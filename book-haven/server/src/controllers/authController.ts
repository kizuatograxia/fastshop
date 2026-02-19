import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const USERS_FILE = path.join(__dirname, '../../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'bookhaven-secret-key-999';

const loadUsers = (): any[] => {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const saveUsers = (users: any[]) => {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        const users = loadUsers();

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            name,
            role: email.startsWith('admin') ? 'ADMIN' : 'USER',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const users = loadUsers();
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
