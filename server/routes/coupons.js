import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Coupon validation logic (shared)
export const validateCouponLogic = async (code, cartTotal) => {
    const res = await pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
    const coupon = res.rows[0];

    if (!coupon) return { valid: false, message: 'Cupom inválido' };
    if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) return { valid: false, message: 'Cupom expirado' };
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return { valid: false, message: 'Cupom esgotado' };
    if (cartTotal < parseFloat(coupon.min_purchase)) return { valid: false, message: `Valor mínimo para este cupom: R$ ${coupon.min_purchase}` };

    let discount = 0;
    if (coupon.type === 'percent') {
        discount = (cartTotal * parseFloat(coupon.value)) / 100;
    } else {
        discount = parseFloat(coupon.value);
    }
    if (discount > cartTotal) discount = cartTotal;

    return {
        valid: true,
        coupon,
        discount,
        newTotal: Math.max(0, cartTotal - discount)
    };
};

// Validate Coupon (Public)
router.post('/coupons/validate', async (req, res) => {
    const { code, cartTotal } = req.body;

    if (!code) {
        return res.status(400).json({ valid: false, message: 'Código do cupom é obrigatório' });
    }

    try {
        const result = await validateCouponLogic(code, parseFloat(cartTotal));
        if (!result.valid) return res.status(400).json(result);
        res.json(result);
    } catch (error) {
        console.error('Coupon Validation Error:', error);
        res.status(500).json({ message: 'Erro ao validar cupom' });
    }
});

// Admin: List Coupons
router.get('/admin/coupons', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
    try {
        const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar cupons' });
    }
});

// Admin: Create Coupon
router.post('/admin/coupons', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
    const { code, type, value, min_purchase, usage_limit, expires_at } = req.body;

    // Validation
    if (!code || !type || value === undefined) {
        return res.status(400).json({ message: 'Código, tipo e valor são obrigatórios' });
    }

    try {
        await pool.query(
            `INSERT INTO coupons (code, type, value, min_purchase, usage_limit, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [code.toUpperCase(), type, value, min_purchase || 0, usage_limit, expires_at]
        );
        res.json({ message: 'Cupom criado' });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: 'Código já existe' });
        res.status(500).json({ message: 'Erro ao criar cupom' });
    }
});

// Admin: Delete Coupon
router.delete('/admin/coupons/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
        res.json({ message: 'Cupom deletado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar cupom' });
    }
});

export default router;
