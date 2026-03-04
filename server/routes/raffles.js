import { Router } from 'express';
import crypto from 'crypto';
import cron from 'node-cron';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// List Active Raffles
router.get('/raffles', async (req, res) => {
    try {
        const query = `
            SELECT r.*, COUNT(t.id) as tickets_sold
            FROM raffles r
            LEFT JOIN tickets t ON r.id = t.raffle_id
            WHERE r.status = 'active'
            GROUP BY r.id
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching raffles:', error);
        res.status(500).json({ message: `Erro ao buscar sorteios: ${error.message}` });
    }
});

// Get Raffle Details
router.get('/raffles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT r.*, 
                   u.name as winner_name, 
                   u.picture as winner_picture,
                   (
                       SELECT json_agg(json_build_object(
                           'id', rw.user_id,
                           'name', wu.name,
                           'picture', wu.picture,
                           'position', rw.position
                       ) ORDER BY rw.position)
                       FROM raffle_winners rw
                       JOIN users wu ON rw.user_id = wu.id
                       WHERE rw.raffle_id = r.id
                   ) as winners
            FROM raffles r
            LEFT JOIN users u ON r.winner_id = u.id
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Sorteio não encontrado' });

        const raffle = result.rows[0];

        // Get ticket count
        const ticketsResult = await pool.query('SELECT count(*) FROM tickets WHERE raffle_id = $1', [id]);
        raffle.tickets_sold = parseInt(ticketsResult.rows[0].count);

        res.json(raffle);
    } catch (error) {
        console.error('Error fetching raffle details:', error);
        res.status(500).json({ message: 'Erro ao buscar detalhes do sorteio' });
    }
});

// Get Raffle Participants (Pool for Roulette)
router.get('/raffles/:id/participants', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                t.id as ticket_id,
                t.hash,
                u.id as user_id,
                u.name,
                u.picture
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.raffle_id = $1
            ORDER BY t.created_at DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ message: 'Erro ao buscar participantes' });
    }
});

// Join Raffle (Buy Ticket) - SECURE ATOMIC TRANSACTION
router.post('/raffles/:id/join', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nfts, ticketCount, txHash } = req.body;
    const userId = req.user.id;

    if (!userId) return res.status(400).json({ message: 'UserId required' });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Raffle Info (Price)
        const raffleRes = await client.query('SELECT * FROM raffles WHERE id = $1', [id]);
        if (raffleRes.rows.length === 0) throw new Error('Sorteio não encontrado');
        const raffle = raffleRes.rows[0];
        const ticketPrice = parseFloat(raffle.ticket_price);

        let calculatedTickets = 0;
        let totalValue = 0;

        // 2. Process NFTs (if provided)
        if (nfts && Object.keys(nfts).length > 0) {
            for (const [nftId, qtyRequested] of Object.entries(nfts)) {
                // Lock row for update
                const walletRes = await client.query(
                    'SELECT quantity, nft_metadata FROM wallets WHERE user_id = $1 AND nft_id = $2 FOR UPDATE',
                    [userId, nftId]
                );

                if (walletRes.rows.length === 0) {
                    throw new Error(`Você não possui o NFT ${nftId}`);
                }

                const walletItem = walletRes.rows[0];
                const currentQty = walletItem.quantity;
                const metadata = typeof walletItem.nft_metadata === 'string'
                    ? JSON.parse(walletItem.nft_metadata)
                    : walletItem.nft_metadata;

                const nftPrice = parseFloat(metadata.price || metadata.preco || 0);

                if (currentQty < qtyRequested) {
                    throw new Error(`Quantidade insuficiente do NFT ${metadata.nome || nftId}`);
                }

                totalValue += nftPrice * Number(qtyRequested);

                // Deduct NFT
                if (currentQty == qtyRequested) {
                    await client.query('DELETE FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nftId]);
                } else {
                    await client.query('UPDATE wallets SET quantity = quantity - $1 WHERE user_id = $2 AND nft_id = $3', [qtyRequested, userId, nftId]);
                }
            }

            calculatedTickets = Math.floor(totalValue / ticketPrice);

            // Respect the explicit limit provided by the frontend if applying change logic
            if (ticketCount && ticketCount > 0 && ticketCount < calculatedTickets) {
                calculatedTickets = ticketCount;
            }

        } else if (ticketCount) {
            if (txHash === 'OFF_CHAIN_SIMULATION') {
                calculatedTickets = ticketCount; // Allow legacy/test
            } else {
                calculatedTickets = 0;
            }
        }

        if (calculatedTickets <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Nenhum bilhete gerado. Verifique os NFTs selecionados. Valor insuficiente.' });
        }

        // 3. Generate Tickets
        for (let i = 0; i < calculatedTickets; i++) {
            await client.query(
                'INSERT INTO tickets (raffle_id, user_id, hash) VALUES ($1, $2, $3)',
                [id, userId, txHash || `EXCHANGE_${Date.now()}_${i}`]
            );
        }

        await client.query('COMMIT');

        console.log(`User ${userId} exchanged NFTs for ${calculatedTickets} tickets in raffle ${id}`);
        res.json({ message: `Sucesso! Você recebeu ${calculatedTickets} bilhetes.` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error joining raffle:', error);
        res.status(500).json({ message: error.message || 'Erro ao comprar tickets' });
    } finally {
        client.release();
    }
});

export const performRaffleDraw = async (raffleId) => {
    if (!pool) throw new Error('Database pool not ready');

    try {
        // Get raffle details to know how many winners we need
        const raffleRes = await pool.query('SELECT * FROM raffles WHERE id = $1', [raffleId]);
        if (raffleRes.rows.length === 0) throw new Error('Sorteio não encontrado');
        const raffle = raffleRes.rows[0];
        const winnersAmount = parseInt(raffle.winners_amount) || 1;

        const ticketsResult = await pool.query(`
            SELECT t.id, t.user_id, u.name, u.picture
            FROM tickets t
            JOIN users u ON t.user_id = u.id
            WHERE t.raffle_id = $1
            ORDER BY t.id ASC
        `, [raffleId]);

        let tickets = ticketsResult.rows;
        const totalTickets = tickets.length;

        if (totalTickets === 0) {
            console.log(`Raffle ${raffleId} has no tickets. Closing as cancelled.`);
            await pool.query('UPDATE raffles SET status = $1 WHERE id = $2', ['encerrado', raffleId]);
            return { status: 'cancelled', message: "Não há participantes." };
        }

        const pickedWinners = [];
        const excludedUserIds = new Set();
        let currentPosition = 1;

        for (let i = 0; i < winnersAmount; i++) {
            // Filter out tickets belonging to users who already won this specific draw
            const validTickets = tickets.filter(t => !excludedUserIds.has(t.user_id));

            if (validTickets.length === 0) {
                console.log(`Broke winner loop early for raffle ${raffleId}. Not enough unique participants.`);
                break;
            }

            const winningIndex = crypto.randomInt(0, validTickets.length);
            const winningTicket = validTickets[winningIndex];

            // Register winner
            pickedWinners.push({
                user_id: winningTicket.user_id,
                name: winningTicket.name,
                picture: winningTicket.picture,
                ticketId: winningTicket.id,
                position: currentPosition
            });
            excludedUserIds.add(winningTicket.user_id);
            currentPosition++;
        }

        if (pickedWinners.length === 0) {
            return { status: 'cancelled', message: "Não foi possível sortear ganhadores." };
        }

        // The first winner is the "primary" winner for backwards compatibility
        const primaryWinner = pickedWinners[0];

        await pool.query('UPDATE raffles SET status = $1, prize_value = prize_value, winner_id = $2 WHERE id = $3', ['encerrado', primaryWinner.user_id, raffleId]);

        // Save all winners into raffle_winners table
        for (const winner of pickedWinners) {
            await pool.query(
                `INSERT INTO raffle_winners (raffle_id, user_id, position) VALUES ($1, $2, $3)`,
                [raffleId, winner.user_id, winner.position]
            );

            // Create Notification for Winner
            try {
                let prizeName = (winnersAmount > 1) ? `o ${winner.position}º prêmio do sorteio #${raffleId}` : `o sorteio #${raffleId}`;
                await pool.query(`
                    INSERT INTO notifications (user_id, title, message)
                    VALUES ($1, $2, $3)
                `, [winner.user_id, 'Você Ganhou! 🎉', `Parabéns! Você ganhou ${prizeName}. Entre em contato para resgatar seu prêmio!`]);
                console.log(`Notification created for user ${winner.user_id} (pos ${winner.position})`);
            } catch (notifErr) {
                console.error('Error creating notification:', notifErr);
            }
        }

        console.log(`Draw executed for Raffle ${raffleId}: ${pickedWinners.length} winners drawn!`);

        return {
            status: 'completed',
            winner: {
                id: primaryWinner.user_id,
                name: primaryWinner.name,
                picture: primaryWinner.picture,
                ticketId: primaryWinner.ticketId
            },
            winners: pickedWinners.map(w => ({
                id: w.user_id,
                name: w.name,
                picture: w.picture,
                ticketId: w.ticketId,
                position: w.position
            })),
            totalTickets
        };
    } catch (error) {
        console.error(`Error performing draw logic for raffle ${raffleId}:`, error);
        throw error;
    }
};

// CRON JOB: Check every minute for active raffles that are past their draw date
cron.schedule('* * * * *', async () => {
    if (!pool) return;
    try {
        const result = await pool.query(`SELECT id, title FROM raffles WHERE status = 'active' AND draw_date <= NOW()`);
        const expiredRaffles = result.rows;

        if (expiredRaffles.length > 0) {
            console.log(`Cron: Found ${expiredRaffles.length} expired raffles. Processing...`);
            for (const raffle of expiredRaffles) {
                console.log(`Cron: Automatically drawing raffle "${raffle.title}" (ID: ${raffle.id})`);
                await performRaffleDraw(raffle.id);
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

// Get User Raffles
router.get('/user/raffles', authenticateToken, async (req, res) => {
    const userId = parseInt(req.query.userId);
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (Number(requesterId) !== Number(userId) && requesterRole !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    if (!userId) return res.status(400).json({ message: 'UserId required' });

    try {
        const query = `
            SELECT 
                r.*, 
                count(t.id) as tickets_comprados,
                u.name as winner_name,
                u.picture as winner_picture
            FROM tickets t
            JOIN raffles r ON t.raffle_id = r.id
            LEFT JOIN users u ON r.winner_id = u.id
            WHERE t.user_id = $1
            GROUP BY r.id, u.id
        `;
        const result = await pool.query(query, [userId]);

        const userRaffles = result.rows.map(row => ({
            raffle: {
                id: row.id,
                title: row.title,
                description: row.description,
                image: row.image_url,
                price: row.ticket_price,
                prize: row.prize_pool,
                prizeValue: row.prize_value || 0,
                drawDate: row.draw_date,
                status: row.status,
                category: row.category || 'tech',
                rarity: row.rarity || 'comum',
                winner_id: row.winner_id,
                winner_name: row.winner_name,
                winner: row.winner_id ? {
                    id: row.winner_id,
                    name: row.winner_name,
                    picture: row.winner_picture
                } : undefined,
                tracking_code: row.tracking_code,
                carrier: row.carrier,
                shipping_status: row.shipping_status,
                shipped_at: row.shipped_at
            },
            ticketsComprados: parseInt(row.tickets_comprados),
            totalValueContributed: parseInt(row.tickets_comprados) * row.ticket_price,
            dataParticipacao: new Date().toISOString()
        }));

        res.json(userRaffles);
    } catch (error) {
        console.error('Error fetching user raffles:', error);
        res.status(500).json({ message: 'Erro ao buscar sorteios do usuário' });
    }
});

export default router;
