import { Request, Response } from 'express';
import { db } from '../lib/db';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { items, amount, customer, paymentMethod } = req.body;

        console.log("Receiving Order:", { amount, customer });

        if (paymentMethod === 'PIX' || paymentMethod === 'CREDIT_CARD') {
            // Save order to DB
            const order = await db.order.create({
                data: {
                    customerId: req.user?.id || 'guest', // Link order to user ID if available
                    customerName: customer.fullName || '',
                    customerEmail: customer.email || '',
                    customerCpf: customer.cpf || null,
                    address: customer.address || null,
                    totalAmount: amount,
                    paymentMethod: paymentMethod,
                    status: paymentMethod === 'PIX' ? 'pending' : 'completed', // CC is instant for now
                    items: items,
                }
            });

            if (paymentMethod === 'PIX') {
                // Mock Pix response
                const mockPixResponse = {
                    qrCode: "00020126580014BR.GOV.BCB.PIX0114+551199999999520400005303986540510.005802BR5913MundoPix Ltd6008Sao Paulo62070503***6304E2CA",
                    qrCodeBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII=",
                    orderId: order.id
                };
                return res.status(201).json(mockPixResponse);
            }

            // Success for Credit Card
            return res.status(201).json({
                message: 'Order created successfully',
                orderId: order.id
            });
        }

        return res.status(400).json({ error: 'Invalid payment method' });
    } catch (error) {
        console.error("Order Error:", error);
        return res.status(500).json({ error: 'Failed to process order' });
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await db.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return res.json(orders);
    } catch (error) {
        console.error("getOrders Error:", error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalRevenue = await db.order.aggregate({
            _sum: { totalAmount: true }
        });
        const ordersCount = await db.order.count();
        const totalBooksCount = await db.book.count();
        const usersCount = await db.user.count();

        // Calculate actual books sold (sum of items in orders)
        const allOrders = await db.order.findMany({
            select: { items: true }
        });

        let totalUnitsSold = 0;
        allOrders.forEach((order: any) => {
            const items = order.items as any[];
            if (Array.isArray(items)) {
                items.forEach((item: any) => {
                    totalUnitsSold += item.quantity || 1;
                });
            }
        });

        // Weekly revenue for chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const weeklyRevenue = await Promise.all(last7Days.map(async (day) => {
            const startOfDay = new Date(day);
            const endOfDay = new Date(new Date(day).getTime() + 24 * 60 * 60 * 1000);

            const sum = await db.order.aggregate({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                },
                _sum: { totalAmount: true }
            });
            return {
                name: day,
                revenue: sum._sum.totalAmount || 0,
                orders: await db.order.count({
                    where: {
                        createdAt: {
                            gte: startOfDay,
                            lt: endOfDay
                        }
                    }
                })
            };
        }));

        return res.json({
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalOrders: ordersCount,
            totalUnitsSold: totalUnitsSold,
            totalInventoryBooks: totalBooksCount,
            totalCustomers: usersCount,
            chartData: weeklyRevenue
        });
    } catch (error) {
        console.error("getStats Error:", error);
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
