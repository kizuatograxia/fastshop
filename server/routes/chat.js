import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get Messages (Between Admin/System and User)
router.get('/chat/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (String(requesterId) !== String(userId) && requesterRole !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }

    try {
        const result = await pool.query(`
            SELECT m.*, u.name as sender_name, u.picture as sender_picture 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 OR m.receiver_id = $1)
            ORDER BY m.created_at ASC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao carregar mensagens" });
    }
});

// Send Message
router.post('/chat/send', authenticateToken, async (req, res) => {
    const { sender_id, receiver_id, content } = req.body;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (String(sender_id) !== String(requesterId)) {
        if (requesterRole !== 'admin') {
            return res.status(403).json({ message: 'Você só pode enviar mensagens como você mesmo.' });
        }
    }

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Conteúdo da mensagem é obrigatório' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [sender_id, receiver_id, content]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao enviar mensagem" });
    }
});

export default router;
