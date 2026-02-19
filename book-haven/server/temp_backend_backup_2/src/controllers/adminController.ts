import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalBooks = await prisma.book.count();
        const totalOrders = await prisma.order.count();
        const totalRevenue = await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
        });

        res.json({
            totalUsers,
            totalBooks,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
