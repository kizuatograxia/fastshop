import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bookhaven-secret-key-999';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(); // Let it pass as guest, but req.user won't be set
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        return next(); // Still pass as guest if token is invalid, or you could return 401
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};
