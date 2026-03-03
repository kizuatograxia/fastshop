import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get Wallet
router.get('/wallet', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    if (!userId) return res.status(400).json({ message: 'UserId required' });

    try {
        const { default: nftsCatalog } = await import('../nfts.js');
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        const wallet = result.rows.map(row => {
            const liveCatalogInfo = nftsCatalog.find(n => n.id === row.metadata?.id || n.id === row.id) || {};
            return {
                id: row.id,
                ...row.nft_metadata,
                ...liveCatalogInfo, // Override with latest catalog strictly for display
                quantidade: row.quantidade
            };
        });
        res.json(wallet);
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Erro ao buscar carteira' });
    }
});

// Add to Wallet (Legacy/Single)
router.post('/wallet', authenticateToken, async (req, res) => {
    const { userId, nft } = req.body;

    if (String(userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Acesso negado: Você só pode adicionar itens à sua própria carteira.' });
    }

    if (!userId || !nft) return res.status(400).json({ message: 'UserId and nft required' });

    try {
        const check = await pool.query('SELECT * FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nft.id]);

        const newHash = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        if (check.rows.length > 0) {
            const existingMetadata = check.rows[0].nft_metadata;
            const updatedMetadata = { ...existingMetadata, hash: newHash, lastUpdated: timestamp };
            await pool.query(
                'UPDATE wallets SET nft_metadata = $1, quantity = quantity + 1 WHERE user_id = $2 AND nft_id = $3',
                [JSON.stringify(updatedMetadata), userId, nft.id]);
        } else {
            const metadata = {
                ...nft,
                hash: newHash,
                mintedAt: timestamp,
                owner: userId,
                blockchain: 'polygon',
                contractAddress: `0x${crypto.randomBytes(20).toString('hex')}`,
                tokenId: Math.floor(Math.random() * 100000)
            };
            await pool.query(
                'INSERT INTO wallets (user_id, nft_id, nft_metadata, quantity) VALUES ($1, $2, $3, $4)',
                [userId, nft.id, JSON.stringify(metadata), 1]);
        }

        // Return updated wallet
        const { default: nftsCatalog } = await import('../nfts.js');
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        const wallet = result.rows.map(row => {
            const liveCatalogInfo = nftsCatalog.find(n => n.id === row.metadata?.id || n.id === row.id) || {};
            return {
                id: row.id,
                ...row.nft_metadata,
                ...liveCatalogInfo,
                quantidade: row.quantidade
            };
        });
        res.json(wallet);
    } catch (error) {
        console.error('Error adding to wallet:', error);
        res.status(500).json({ message: 'Erro ao adicionar item à carteira' });
    }
});

// Remove from Wallet
router.post('/wallet/remove', authenticateToken, async (req, res) => {
    const { userId, nftId, quantity } = req.body;
    const qty = quantity || 1;

    if (String(userId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    try {
        const check = await pool.query('SELECT * FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nftId]);

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Item não encontrado na carteira' });
        }

        const current = check.rows[0].quantity;
        if (current <= qty) {
            await pool.query('DELETE FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, nftId]);
        } else {
            await pool.query('UPDATE wallets SET quantity = quantity - $1 WHERE user_id = $2 AND nft_id = $3', [qty, userId, nftId]);
        }

        // Return updated wallet
        const { default: nftsCatalog } = await import('../nfts.js');
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        const wallet = result.rows.map(row => {
            const liveCatalogInfo = nftsCatalog.find(n => n.id === row.metadata?.id || n.id === row.id) || {};
            return {
                id: row.id,
                ...row.nft_metadata,
                ...liveCatalogInfo,
                quantidade: row.quantidade
            };
        });
        res.json(wallet);
    } catch (error) {
        console.error('Error removing from wallet:', error);
        res.status(500).json({ message: 'Erro ao remover item da carteira' });
    }
});

// Buy NFTs (with Coupon Support)
router.post('/shop/buy', authenticateToken, async (req, res) => {
    const { items, couponCode } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: 'Dados inválidos' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let totalCost = 0;
        const purchasedItems = [];

        // 1. Validate Items & Calculate Base Total
        for (const item of items) {
            const { id, quantity } = item;
            // Use server-side catalog (nfts.js) for price?
            // For now, trust the metadata from catalog
            const { default: nftsCatalog } = await import('../nfts.js');
            const catalogItem = nftsCatalog.find(n => n.id === id);
            if (!catalogItem) throw new Error(`NFT não encontrado: ${id}`);

            totalCost += catalogItem.price * quantity;
            purchasedItems.push({ ...catalogItem, quantity });
        }

        // 2. Apply Coupon (if any)
        let discount = 0;
        let finalCost = totalCost;
        let appliedCoupon = null;

        if (couponCode) {
            const couponResult = await client.query('SELECT * FROM coupons WHERE code = $1', [couponCode]);
            const coupon = couponResult.rows[0];

            if (coupon) {
                if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
                    throw new Error('Cupom expirado');
                }
                if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                    throw new Error('Cupom esgotado');
                }
                if (totalCost < parseFloat(coupon.min_purchase)) {
                    throw new Error(`Valor mínimo: R$ ${coupon.min_purchase}`);
                }

                if (coupon.type === 'percent') {
                    discount = (totalCost * parseFloat(coupon.value)) / 100;
                } else {
                    discount = parseFloat(coupon.value);
                }
                if (discount > totalCost) discount = totalCost;
                finalCost = Math.max(0, totalCost - discount);
                appliedCoupon = coupon;

                // Increment Usage
                await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [coupon.id]);
            }
        }

        // 3. Process Delivery (Add to Wallet)
        for (const item of purchasedItems) {
            const check = await client.query('SELECT * FROM wallets WHERE user_id = $1 AND nft_id = $2', [userId, item.id]);

            if (check.rows.length > 0) {
                await client.query(
                    'UPDATE wallets SET quantity = quantity + $1 WHERE user_id = $2 AND nft_id = $3',
                    [item.quantity, userId, item.id]);
            } else {
                const newMetadata = {
                    ...item,
                    hash: crypto.randomUUID(),
                    mintedAt: new Date().toISOString(),
                    owner: userId
                };
                await client.query(
                    'INSERT INTO wallets (user_id, nft_id, nft_metadata, quantity) VALUES ($1, $2, $3, $4)',
                    [userId, item.id, JSON.stringify(newMetadata), item.quantity]);
            }
        }

        await client.query('COMMIT');

        console.log(`User ${userId} bought items. Total: ${totalCost}, Discount: ${discount}, Final: ${finalCost}`);

        const { default: nftsCatalog } = await import('../nfts.js');
        const result = await pool.query('SELECT nft_id as id, nft_metadata, quantity as quantidade FROM wallets WHERE user_id = $1', [userId]);
        const wallet = result.rows.map(row => {
            const liveCatalogInfo = nftsCatalog.find(n => n.id === row.metadata?.id || n.id === row.id) || {};
            return {
                id: row.id,
                ...row.nft_metadata,
                ...liveCatalogInfo,
                quantidade: row.quantidade
            };
        });

        res.json({ success: true, wallet, totalCost, discount, finalCost });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Purchase error:', error);
        res.status(500).json({ message: error.message || 'Erro ao realizar compra' });
    } finally {
        client.release();
    }
});

export default router;
