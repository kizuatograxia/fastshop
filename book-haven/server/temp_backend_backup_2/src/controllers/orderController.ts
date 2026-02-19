import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';

const createOrderSchema = z.object({
    paymentMethod: z.string(),
    // Add address validation if needed later
});

export const createOrder = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = (req as any).user;
    const userId = user?.userId;

    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({ error: 'Unauthorized: Invalid user ID' });
    }

    try {
        const { paymentMethod } = createOrderSchema.parse(req.body);

        // Get the pending cart
        const cart = await prisma.order.findFirst({
            where: { userId, status: 'PENDING' },
            include: { items: true },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // SIMULATED PAYMENT PROCESSING
        // In a real app, you would call Stripe/Paypal here using the totalAmount
        const isPaymentSuccessful = true; // Mock success

        if (isPaymentSuccessful) {
            // Update order status to COMPLETED
            const completedOrder = await prisma.order.update({
                where: { id: cart.id },
                data: {
                    status: 'COMPLETED',
                    paymentMethod,
                    paymentId: `MOCK-PAY-${Date.now()}`,
                    completedAt: new Date(),
                },
            });

            // Assign books to user's library
            const libraryEntries = cart.items.map((item: any) => ({
                userId,
                bookId: item.bookId,
                purchasePrice: item.price,
            }));

            await prisma.userBook.createMany({
                data: libraryEntries,
            });

            // Clear the "cart" by just leaving this order as completed. 
            // Next time the user adds to cart, a NEW pending order will be created.

            return res.json({ success: true, order: completedOrder });
        } else {
            return res.status(400).json({ error: 'Payment failed' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Failed to create order', details: error });
    }
};
