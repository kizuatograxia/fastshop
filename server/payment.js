import mercadopago from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';

// Facade Strategy: Randomize product titles to avoid pattern detection
const facades = [
    { title: "Ebook: Guia de Economia Digital", desc: "Acesso a conteúdo educativo PDF", priceVariant: 0 },
    { title: "Curso: Masterclass Web3 Essentials", desc: "Acesso à plataforma de membros", priceVariant: 0 },
    { title: "Pack: Assets Gráficos Premium v4", desc: "Download de material complementar", priceVariant: 0 },
    { title: "Ebook: Mentalidade Digital", desc: "Guia prático para iniciantes", priceVariant: 0 },
    { title: "Workshop: Estratégias de Marketing", desc: "Acesso ao replay do workshop", priceVariant: 0 }
];

import { createPixCharge } from './services/sicoob.js';

// Sicoob Integration API
const createSicoobPayment = async (amount, external_reference, description) => {
    const devedor = {
        cpf: '19119119100', // Mock format for testing or get from DB later
        nome: 'Cliente Book-Haven'
    };

    // Pix TxId must be alphanumeric and length 26 to 35
    const txid = external_reference.replace(/-/g, '') + 'A';

    const pixData = await createPixCharge(txid, Number(amount), devedor);

    return {
        qrCode: pixData.pixCopiaECola,
        qrCodeBase64: null,
        copyPaste: pixData.pixCopiaECola,
        transactionId: pixData.txid || txid,
        ticketUrl: null
    };
};

export const setupPaymentRoutes = (app, pool) => {

    // Configure Mercado Pago credentials
    // user must provide access token in .env
    const client = new mercadopago.MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-7613327157973024-051515-373322fdf741873177890b9122550130-181514785' // Default Test Credential if missing
    });

    // Force Sicoob as Primary Gateway
    const selectGateway = () => {
        return 'SICOOB';
    };

    // Helper to Create Preference
    app.post('/api/payment/create', async (req, res) => {
        const { userId, amount, realItems } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            // 1. Generate Facade Details
            const facade = facades[Math.floor(Math.random() * facades.length)];
            const external_reference = uuidv4();
            const gateway = selectGateway();

            // 2. Save "Real" Transaction Intent (Pending)
            await pool.query(
                `INSERT INTO transactions (user_id, external_reference, amount, description, items, status, gateway) 
                 VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
                [userId, external_reference, amount, facade.title, JSON.stringify(realItems), gateway]
            );

            console.log(`Processing payment via ${gateway} for ref ${external_reference}`);

            let resultData;

            try {
                // Native Gateway Routing
                if (gateway === 'SICOOB') {
                    resultData = await createSicoobPayment(amount, external_reference, facade.desc);
                } else {
                    throw new Error("Use MP logic");
                }
            } catch (gwError) {
                console.warn(`Primary Gateway/Tunnel failed: ${gwError.message}`);
                if (gwError.response) {
                    console.warn(`Gateway Response Error Data:`, gwError.response.data);
                }

                // If Sicoob failed due to our own invalid config or certs, let it bubble up instead of hiding it in MP fallback
                if (gateway === 'SICOOB' && gwError.message !== "Use MP logic") {
                    throw gwError;
                }

                // Fallback to Mercado Pago DO BRASIL (Direct in App)
                const payment = new mercadopago.Payment(client);
                const mpResult = await payment.create({
                    body: {
                        transaction_amount: Number(amount),
                        description: facade.desc,
                        payment_method_id: 'pix',
                        payer: {
                            email: "test_user_123@test.com",
                            first_name: "Test",
                            entity_type: "individual",
                            type: "customer",
                            identification: { type: "CPF", number: "19119119100" }
                        },
                        external_reference: external_reference,
                        notification_url: "https://cdn.mundopix.com/api/webhook/payment"
                    }
                });

                const poi = mpResult.point_of_interaction?.transaction_data;
                resultData = {
                    qrCode: poi?.qr_code,
                    qrCodeBase64: poi?.qr_code_base64,
                    copyPaste: poi?.qr_code,
                    transactionId: mpResult.id,
                    ticketUrl: poi?.ticket_url
                };

                await pool.query(`UPDATE transactions SET gateway = 'MP_DIRECT_FALLBACK' WHERE external_reference = $1`, [external_reference]);
            }

            res.json(resultData);

        } catch (error) {
            console.error('Payment Creation Error:', error);
            res.status(500).json({ message: 'Erro ao criar pagamento', error: error.message });
        }
    });

    // Webhook Handler
    app.post('/api/webhook/payment', async (req, res) => {
        const { type, data } = req.body;
        const topic = req.query.topic || type; // MP sends topic in query or type in body
        const id = data?.id || req.query.id;

        console.log('Webhook received:', topic, id);

        try {
            if (topic === 'payment') {
                const paymentClient = new mercadopago.Payment(client);
                const payment = await paymentClient.get({ id });

                const { status, external_reference } = payment;

                if (status === 'approved') {
                    // 1. Update Transaction Status
                    const trxResult = await pool.query(
                        `UPDATE transactions SET status = 'approved' WHERE external_reference = $1 RETURNING *`,
                        [external_reference]
                    );

                    if (trxResult.rowCount > 0) {
                        const transaction = trxResult.rows[0];
                        const items = transaction.items; // { nftId, userId } or array of tickets

                        // 2. Fulfill the Order (Allocate Raffle Tickets / NFT)
                        // This logic depends on what 'items' contains. 
                        // Assuming it contains instructions to add to wallet.

                        console.log(`Payment approved for ${external_reference}. Fulfilling items:`, items);

                        // Example Fulfillment: Add to Wallet
                        if (items.nftId) {
                            await pool.query(`
                                INSERT INTO wallets (user_id, nft_id, quantity)
                                VALUES ($1, $2, 1)
                                ON CONFLICT (user_id, nft_id) 
                                DO UPDATE SET quantity = wallets.quantity + 1
                            `, [transaction.user_id, items.nftId]);
                        }
                    }
                }
            }

            res.status(200).send('OK');
        } catch (error) {
            console.error('Webhook Error:', error);
            res.status(500).send('Error processing webhook');
        }
    });
};
