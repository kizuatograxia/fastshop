import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET all active banners
router.get('/banners', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM banners WHERE is_active = TRUE ORDER BY display_order ASC'
        );

        // Map backend fields to camelCase for frontend
        const banners = result.rows.map(b => ({
            id: String(b.id),
            title: b.title,
            subtitle: b.subtitle,
            imageUrl: b.image_url,
            linkUrl: b.link_url,
            buttonText: b.button_text
        }));

        res.json(banners);
    } catch (error) {
        console.error('Failed to fetch banners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
