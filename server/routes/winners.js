import { Router } from 'express';
import { pool } from '../db.js';
import { ADMIN_PASSWORD } from '../middleware/auth.js';

const router = Router();

// Public Winners Feed (returns approved testimonials + raffle winners)
router.get('/winners', async (req, res) => {
    const status = req.query.status;
    try {
        if (status === 'pending') {
            const result = await pool.query(
                `SELECT * FROM testimonials WHERE status = 'pending' ORDER BY created_at DESC`
            );
            const mapped = result.rows.map(t => ({
                id: String(t.id),
                userId: String(t.user_id || ''),
                userName: t.user_name || 'Anônimo',
                userAvatar: t.user_avatar || '',
                raffleName: t.raffle_name || '',
                prizeName: t.prize_name || '',
                rating: t.rating || 5,
                comment: t.comment || '',
                photoUrl: t.photo_url || '',
                createdAt: t.created_at,
                status: t.status
            }));
            return res.json(mapped);
        }

        const testimonialResult = await pool.query(
            `SELECT * FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC LIMIT 20`
        );

        const testimonials = testimonialResult.rows.map(t => ({
            id: t.id,
            userName: t.user_name,
            userAvatar: t.user_avatar,
            raffleName: t.raffle_name,
            prizeName: t.prize_name,
            rating: t.rating,
            comment: t.comment,
            photoUrl: t.photo_url,
            createdAt: t.created_at,
            status: t.status
        }));

        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ message: 'Erro ao buscar ganhadores' });
    }
});

// Submit Testimonial (Public)
router.post('/winners', async (req, res) => {
    const { userId, userName, userAvatar, raffleName, prizeName, rating, comment, photoUrl } = req.body;

    if (!comment || !rating) {
        return res.status(400).json({ message: 'Comentário e avaliação são obrigatórios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO testimonials (user_id, user_name, user_avatar, raffle_name, prize_name, rating, comment, photo_url, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
             RETURNING *`,
            [userId || null, userName || 'Anônimo', userAvatar || '', raffleName || '', prizeName || '', rating || 5, comment, photoUrl || '']
        );
        console.log('New testimonial submitted:', result.rows[0].id);
        res.json({ success: true, testimonial: result.rows[0] });
    } catch (error) {
        console.error('Error submitting testimonial:', error);
        res.status(500).json({ message: 'Erro ao enviar depoimento' });
    }
});

// Approve Testimonial (Admin)
router.put('/winners/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    try {
        const result = await pool.query(
            `UPDATE testimonials SET status = 'approved' WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Depoimento não encontrado' });
        }
        console.log('Testimonial approved:', id);
        res.json({ success: true, testimonial: result.rows[0] });
    } catch (error) {
        console.error('Error approving testimonial:', error);
        res.status(500).json({ message: 'Erro ao aprovar depoimento' });
    }
});

// Reject Testimonial (Admin)
router.put('/winners/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    try {
        const result = await pool.query(
            `DELETE FROM testimonials WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Depoimento não encontrado' });
        }
        console.log('Testimonial rejected and deleted:', id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error rejecting testimonial:', error);
        res.status(500).json({ message: 'Erro ao rejeitar depoimento' });
    }
});

export default router;
