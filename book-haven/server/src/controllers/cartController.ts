import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';

const addToCartSchema = z.object({
    bookId: z.string().uuid(),
    quantity: z.number().min(1).default(1),
});

export const getCart = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        let cart = await prisma.order.findFirst({
            where: {
                userId,
                status: 'PENDING',
            },
            include: {
                items: {
                    include: {
                        book: true,
                    },
                },
            },
        });

        if (!cart) {
            // Create a new cart (pending order) if none exists
            cart = await prisma.order.create({
                data: {
                    userId,
                    status: 'PENDING',
                    orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    paymentMethod: 'CARD', // Default
                    subtotal: 0,
                    totalAmount: 0,
                },
                include: { items: true },
            });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

export const addToCart = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    try {
        const { bookId, quantity } = addToCartSchema.parse(req.body);

        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        let cart = await prisma.order.findFirst({
            where: { userId, status: 'PENDING' },
        });

        if (!cart) {
            cart = await prisma.order.create({
                data: {
                    userId,
                    status: 'PENDING',
                    orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    subtotal: 0,
                    totalAmount: 0,
                },
            });
        }

        // Add item to cart
        await prisma.orderItem.create({
            data: {
                orderId: cart.id,
                bookId,
                price: book.price,
                currency: book.currency,
            },
        });

        // Recalculate totals (simplified logic)
        // In a real app, you'd aggregate all items
        const allItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
        const subtotal = allItems.reduce((acc: number, item: any) => acc + Number(item.price), 0);

        await prisma.order.update({
            where: { id: cart.id },
            data: {
                subtotal,
                totalAmount: subtotal, // Add tax/shipping logic here
            },
        });

        res.json({ message: 'Item added to cart' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to add item', details: error });
    }
};

export const removeFromCart = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;
    const { itemId } = req.params;

    try {
        const cart = await prisma.order.findFirst({ where: { userId, status: 'PENDING' } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        await prisma.orderItem.delete({
            where: { id: itemId },
        });

        // Recalculate totals
        const allItems = await prisma.orderItem.findMany({ where: { orderId: cart.id } });
        const subtotal = allItems.reduce((acc: number, item: any) => acc + Number(item.price), 0);

        const updatedCart = await prisma.order.update({
            where: { id: cart.id },
            data: {
                subtotal,
                totalAmount: subtotal,
            },
            include: {
                items: { include: { book: true } }
            }
        });

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
};
