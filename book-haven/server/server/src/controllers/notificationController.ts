import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getNotifications = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { id } = req.params as { id: string };

    try {
        await prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};
