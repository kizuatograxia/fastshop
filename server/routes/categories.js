import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET all categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM categories ORDER BY display_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
