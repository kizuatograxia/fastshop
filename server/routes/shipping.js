import { Router } from 'express';

const router = Router();

// Rate Limiter for Shipping (Basic)
const shippingCache = new Map();

// Calculate Shipping
router.post('/shipping/calculate', async (req, res) => {
    const { cep, items } = req.body;

    if (!cep) return res.status(400).json({ message: 'CEP required' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Items required' });

    try {
        const cacheKey = `${cep}_${items.length}`;
        if (shippingCache.has(cacheKey)) {
            const cached = shippingCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 600000) {
                return res.json(cached.data);
            }
        }

        const { calculateShipping } = await import('../services/shipping.js');
        const options = await calculateShipping(cep, items);

        shippingCache.set(cacheKey, { timestamp: Date.now(), data: options });

        res.json(options);
    } catch (error) {
        console.error('Shipping API Error:', error);
        res.status(500).json({ message: 'Erro ao calcular frete', details: error.message });
    }
});

export default router;
