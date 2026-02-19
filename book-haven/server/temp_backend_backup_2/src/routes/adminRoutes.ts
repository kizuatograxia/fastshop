import express from 'express';
import { getStats, getUsers } from '../controllers/adminController';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to check if user is admin
const authenticateAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        if (user.role !== 'ADMIN') return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.use(authenticateAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);

export default router;
