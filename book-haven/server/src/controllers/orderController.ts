import { Request, Response } from 'express';
import { db } from '../lib/db';

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, amount, customer, paymentMethod } = req.body;

        console.log("Receiving Order:", { amount, customer });

        if (paymentMethod === 'PIX') {
            // Save order to DB first
            await db.order.create({
                data: {
                    customerId: customer.email || 'guest',
                    customerName: customer.fullName || '',
                    customerEmail: customer.email || '',
                    customerCpf: customer.cpf || null,
                    address: customer.address || null,
                    totalAmount: amount,
                    paymentMethod: 'PIX',
                    status: 'pending',
                    items: items,
                }
            });

            // Mock Pix response (swap with real Mercado Pago call when ready)
            const mockPixResponse = {
                qrCode: "00020126580014BR.GOV.BCB.PIX0114+551199999999520400005303986540510.005802BR5913MundoPix Ltd6008Sao Paulo62070503***6304E2CA",
                qrCodeBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII=",
                orderId: `ORD-${Date.now()}`
            };

            return res.status(201).json(mockPixResponse);
        }

        return res.status(400).json({ error: 'Invalid payment method' });
    } catch (error) {
        console.error("Order Error:", error);
        return res.status(500).json({ error: 'Failed to process order' });
    }
};
