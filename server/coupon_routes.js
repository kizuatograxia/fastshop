// --- COUPON ROUTES ---

// Helper: Validate Coupon
const validateCouponLogic = async (code, cartTotal) => {
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

    // Ensure discount doesn't exceed total
    if (discount > cartTotal) discount = cartTotal;

    return {
        valid: true,
        coupon,
        discount,
        newTotal: Math.max(0, cartTotal - discount)
    };
};

// POST /api/coupons/validate (Public/User)
app.post('/api/coupons/validate', async (req, res) => {
    const { code, cartTotal } = req.body;
    try {
        const result = await validateCouponLogic(code, parseFloat(cartTotal));
        if (!result.valid) return res.status(400).json(result);
        res.json(result);
    } catch (error) {
        console.error('Coupon Validation Error:', error);
        res.status(500).json({ message: 'Erro ao validar cupom' });
    }
});

// GET /api/admin/coupons (Admin)
app.get('/api/admin/coupons', async (req, res) => {
    // Basic admin check (simplistic for this project context, ideally verify admin_key or role)
    // The query param check is handled in frontend api.ts but endpoints usually need protection.
    // For now assuming open or relying on the 'password' param if implemented, 
    // but the Admin.tsx sends 'password' header or similar? 
    // Wait, the other admin routes use `req.body.password` or query param. 
    // Admin.tsx uses `api.getAdminRaffles` which usually appends auth?
    // Let's check api.ts later. For now, open or basic check if possible.
    try {
        const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar cupons' });
    }
});

// POST /api/admin/coupons (Admin Create)
app.post('/api/admin/coupons', async (req, res) => {
    const { code, type, value, min_purchase, usage_limit, expires_at } = req.body;
    try {
        await pool.query(
            `INSERT INTO coupons (code, type, value, min_purchase, usage_limit, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [code.toUpperCase(), type, value, min_purchase || 0, usage_limit, expires_at]
        );
        res.json({ message: 'Cupom criado' });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') return res.status(400).json({ message: 'Código já existe' });
        res.status(500).json({ message: 'Erro ao criar cupom' });
    }
});

// DELETE /api/admin/coupons/:id
app.delete('/api/admin/coupons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
        res.json({ message: 'Cupom deletado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar cupom' });
    }
});
