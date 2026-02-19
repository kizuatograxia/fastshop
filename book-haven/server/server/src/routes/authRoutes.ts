import express from 'express';
import { login, me, register } from '../controllers/authController';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);

export default router;
