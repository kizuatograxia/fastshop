import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { authenticateToken, ADMIN_PASSWORD, JWT_SECRET } from '../middleware/auth.js';
import { performRaffleDraw } from './raffles.js';

const router = Router();

// Verify Admin Password
router.post('/admin/verify', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: "Acesso autorizado" });
    } else {
        res.status(401).json({ success: false, message: "Senha incorreta" });
    }
});

// Create Raffle
router.post('/raffles', async (req, res) => {
    const { password, raffle } = req.body;

    // Auth: password OR JWT
    let isAuthorized = (password === ADMIN_PASSWORD);

    if (!isAuthorized) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded && decoded.role === 'admin') isAuthorized = true;
                } catch (err) {
                    console.warn("Invalid token in raffle creation:", err.message);
                }
            }
        }
    }

    if (!isAuthorized) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    // Validation
    if (!raffle || !raffle.title || !raffle.ticket_price) {
        return res.status(400).json({ message: "Dados do sorteio incompletos. Título e preço do ticket são obrigatórios." });
    }

    try {
        const query = `
            INSERT INTO raffles (title, description, prize_pool, ticket_price, max_tickets, draw_date, image_url, prize_value, category, rarity, image_urls)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [
            raffle.title,
            raffle.description,
            raffle.prize_pool || raffle.title,
            raffle.ticket_price,
            raffle.max_tickets || 1000,
            raffle.draw_date,
            raffle.image_url,
            raffle.prize_value || 0,
            raffle.category || 'tech',
            raffle.rarity || 'comum',
            JSON.stringify(raffle.image_urls || [])
        ];

        const result = await pool.query(query, values);
        console.log('Admin created new raffle:', result.rows[0].title);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating raffle:', error);
        res.status(500).json({ message: `Erro ao criar sorteio: ${error.message}` });
    }
});

// Update Raffle
router.put('/raffles/:id', async (req, res) => {
    const { id } = req.params;
    const { password, raffle } = req.body;

    // Auth: password OR JWT
    let isAuthorized = (password === ADMIN_PASSWORD);

    if (!isAuthorized) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded && decoded.role === 'admin') isAuthorized = true;
                } catch (err) {
                    console.warn("Invalid token in raffle update:", err.message);
                }
            }
        }
    }

    if (!isAuthorized) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    try {
        const { title, description, image_url, ticket_price, prize_pool, max_tickets, prize_value, draw_date, category, rarity, image_urls } = raffle;

        const result = await pool.query(
            `UPDATE raffles SET 
                title = $1, description = $2, image_url = $3, ticket_price = $4, 
                prize_pool = $5, max_tickets = $6, prize_value = $7, draw_date = $8, 
                category = $9, rarity = $10, image_urls = $11 
             WHERE id = $12 RETURNING *`,
            [title, description, image_url, ticket_price, prize_pool, max_tickets, prize_value, draw_date, category || 'tech', rarity || 'comum', JSON.stringify(image_urls || []), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sorteio não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating raffle:', error);
        res.status(500).json({ message: 'Erro ao atualizar sorteio' });
    }
});

// Delete Raffle
router.delete('/raffles/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Auth: password OR JWT
    let isAuthorized = (password === ADMIN_PASSWORD);

    if (!isAuthorized) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    if (decoded && decoded.role === 'admin') isAuthorized = true;
                } catch (err) {
                    console.warn("Invalid token in raffle deletion:", err.message);
                }
            }
        }
    }

    if (!isAuthorized) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    try {
        await pool.query('DELETE FROM tickets WHERE raffle_id = $1', [id]);
        const result = await pool.query('DELETE FROM raffles WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sorteio não encontrado' });
        }

        console.log('Admin deleted raffle:', id);
        res.json({ message: 'Sorteio removido com sucesso' });
    } catch (error) {
        console.error('Error deleting raffle:', error);
        res.status(500).json({ message: 'Erro ao deletar sorteio' });
    }
});

// Admin: Update Tracking Info
router.put('/admin/raffles/:id/tracking', async (req, res) => {
    const { id } = req.params;
    const { trackingCode, carrier, status, password } = req.body;

    // Auth: accept password OR JWT
    let isAuthenticated = false;

    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
    }

    if (!isAuthenticated) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    jwt.verify(token, JWT_SECRET);
                    isAuthenticated = true;
                } catch (err) {
                    console.warn("Invalid token in tracking update:", err.message);
                }
            }
        }
    }

    if (!isAuthenticated) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    try {
        const result = await pool.query(
            `UPDATE raffles 
             SET tracking_code = $1, 
                 carrier = $2, 
                 shipping_status = $3::varchar, 
                 shipped_at = CASE 
                    WHEN $3::varchar = 'shipped' AND shipped_at IS NULL THEN NOW() 
                    ELSE shipped_at 
                 END
             WHERE id = $4 
             RETURNING *`,
            [trackingCode, carrier, status || 'preparing', id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Sorteio não encontrado' });

        const raffle = result.rows[0];

        // Notify Winner
        if (raffle.winner_id) {
            let message = `O status do seu prêmio mudou para: ${status}`;
            if (status === 'shipped') message = `Seu prêmio foi enviado! 🚚 Código: ${trackingCode}`;
            if (status === 'delivered') message = `Seu prêmio foi entregue! 🎉 Aproveite!`;

            await pool.query(`
                INSERT INTO notifications (user_id, title, message)
                VALUES ($1, $2, $3)
            `, [
                raffle.winner_id,
                'Atualização de Entrega 📦',
                message
            ]);
        }

        res.json({ success: true, raffle });
    } catch (error) {
        console.error('Error updating tracking:', error);
        res.status(500).json({ message: `Erro ao atualizar rastreio: ${error.message}` });
    }
});

// Admin: Get All Raffles (Active + Completed)
router.get('/admin/raffles', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
    try {
        const query = `
            SELECT r.*, 
                   COUNT(t.id) as tickets_sold,
                   u.name as winner_name,
                   u.picture as winner_picture,
                   u.email as winner_email,
                   u.address as winner_address,
                   u.city as winner_city,
                   u.state as winner_state,
                   u.cep as winner_cep
            FROM raffles r
            LEFT JOIN tickets t ON r.id = t.raffle_id
            LEFT JOIN users u ON r.winner_id = u.id
            GROUP BY r.id, u.id
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching admin raffles:', error);
        res.status(500).json({ message: 'Erro ao buscar sorteios' });
    }
});

// Admin: Get User Details
router.get('/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });

    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT id, name, email, picture, cpf, phone, address, city, cep, state, role 
            FROM users WHERE id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar usuário" });
    }
});

// Perform Draw (Route - Manual Trigger via Admin)
router.post('/raffles/:id/draw', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Não autorizado" });
    }

    try {
        const result = await performRaffleDraw(id);

        if (result.status === 'cancelled') {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error performing draw:', error);
        res.status(500).json({ message: 'Erro ao realizar sorteio' });
    }
});

export default router;
