import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getLibrary = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const libraryItems = await prisma.userBook.findMany({
            where: { userId },
            include: {
                book: {
                    include: {
                        author: true,
                        // Add other relations if needed for display (e.g. publisher)
                    }
                }
            },
            orderBy: { purchaseDate: 'desc' }
        });

        // Transform for frontend if necessary, or send as is
        res.json(libraryItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch library', details: error });
    }
};
