import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'bookhaven-secret-key-999';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: email.startsWith('admin') ? 'ADMIN' : 'USER',
            }
        });

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await db.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};
