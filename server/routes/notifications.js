import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get Notifications
router.get('/notifications', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
});

// Mark Notification as Read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Notificação não encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ message: 'Erro ao atualizar notificação' });
    }
});

export default router;
