import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';

// Facade Products (The "Trojan Horse" items)
const facades = [
    { title: "Ebook: Guia de Economia Digital", desc: "Acesso a conteúdo educativo PDF", priceVariant: 0 },
    { title: "Curso: Masterclass Web3 Essentials", desc: "Acesso liberado à plataforma de ensino", priceVariant: 0 },
    { title: "Pack: Assets Premium para Designers", desc: "Download digital imediato", priceVariant: 0 },
    { title: "Ebook: O Futuro do Dinheiro", desc: "Livro digital em formato PDF/EPUB", priceVariant: 0 },
    { title: "Workshop: Estratégias de Marketing", desc: "Acesso ao replay do workshop", priceVariant: 0 }
];

// Configure Mercado Pago credentials (STORE CREDENTIALS - DIFFERENT FROM APP IF NEEDED)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-7613327157973024-051515-373322fdf741873177890b9122550130-181514785'
});

export const createPaymentTunnel = async (req: Request, res: Response) => {
    try {
        const { amount, external_reference: appRef } = req.body;

        // 1. Validate Tunnel Secret (Security)
        const tunnelSecret = req.headers['x-tunnel-secret'];
        if (tunnelSecret !== process.env.TUNNEL_SECRET) {
            console.warn(`[Tunnel] Unauthorized access attempt`);
            return res.status(401).json({ error: 'Unauthorized Tunnel Access' });
        }

        if (!amount) {
            return res.status(400).json({ error: 'Missing amount' });
        }

        // 2. Select Facade
        const facade = facades[Math.floor(Math.random() * facades.length)];

        // 3. Generate internal reference (if app didn't send one, but ideally app sends distinct ref)
        // We use the App's reference to keep sync, or generate a composite one.
        // Better: Use App's ref as 'external_reference' so webhook can easy identify.
        const ref = appRef || uuidv4();

        console.log(`[Tunnel] Creating payment for ${ref} - Facade: ${facade.title}`);

        // 4. Call Mercado Pago (Store Account)
        const payment = new Payment(client);

        const result = await payment.create({
            body: {
                transaction_amount: Number(amount),
                description: facade.desc, // The mask
                payment_method_id: 'pix',
                payer: {
                    email: "customer@genericemail.com", // In a real tunnel, we might forward the real email OR generic
                    first_name: "Customer",
                    entity_type: "individual",
                    type: "customer",
                    identification: {
                        type: "CPF",
                        number: "19119119100" // Mock or Real if passed
                    }
                },
                external_reference: ref,
                notification_url: "https://bookhaven-store.up.railway.app/api/webhook/payment" // STORE Webhook
            }
        });

        const poi = result.point_of_interaction?.transaction_data;

        // 5. Return Pix Data to App
        res.json({
            qrCode: poi?.qr_code,
            qrCodeBase64: poi?.qr_code_base64,
            ticketUrl: poi?.ticket_url,
            transactionId: result.id,
            facadeItem: facade.title
        });

    } catch (error: any) {
        console.error('[Tunnel] Payment Error:', error);
        res.status(500).json({ error: 'Payment Tunnel Failed', message: error.message });
    }
};

// Webhook Handler (Store receives confirmation -> Notifies App)
export const handlePaymentWebhook = async (req: Request, res: Response) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data.id;
            console.log(`[Webhook] Payment notification for ${paymentId}`);

            // 1. Verify Payment status with MP
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: paymentId });

            if (paymentInfo.status === 'approved') {
                const externalRef = paymentInfo.external_reference;
                console.log(`[Webhook] Approved: ${externalRef}`);

                // 2. Notify App (MundoPix) via Webhook
                // In a perfect tunnel, we call the App's webhook.
                if (process.env.APP_WEBHOOK_URL) {
                    await fetch(process.env.APP_WEBHOOK_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Tunnel-Secret': process.env.TUNNEL_SECRET || ''
                        },
                        body: JSON.stringify({
                            external_reference: externalRef,
                            status: 'approved',
                            paymentId: paymentId
                        })
                    });
                    console.log(`[Webhook] Notified App: ${process.env.APP_WEBHOOK_URL}`);
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('[Webhook] Error:', error);
        res.sendStatus(500);
    }
};
