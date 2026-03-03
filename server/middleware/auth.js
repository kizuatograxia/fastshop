import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Token de autenticação necessário' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido ou expirado' });
        req.user = user;
        next();
    });
};
