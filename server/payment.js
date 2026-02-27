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

            console.log(`Processing payment via SICOOB for ref ${external_reference}`);

            let resultData;

            try {
                // Native Gateway Routing
                resultData = await createSicoobPayment(amount, external_reference, facade.desc);
            } catch (gwError) {
                console.warn(`Sicoob Gateway failed: ${gwError.message}`);
                if (gwError.response) {
                    console.warn(`Gateway Response Error Data:`, gwError.response.data);
                }

                // If Sicoob failed due to our own invalid config or certs, let it bubble up
                throw gwError;
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

        // TODO: Sicoob Specific Webhook Verification here
        // Sicoob webhook format logic
        console.log('Sicoob Webhook received:', req.body);

        try {
            // Placeholder for Sicoob Payload Parse
            const status = 'pending';
            const external_reference = '123';

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
                    console.log(`Payment approved for ${external_reference}. Fulfilling items:`, items);

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

            res.status(200).send('OK');
        } catch (error) {
            console.error('Webhook Error:', error);
            res.status(500).send('Error processing webhook');
        }
    });

    // Debug Route for Environment Variables (Temporary)
    app.get('/api/payment/debug-env', (req, res) => {
        res.json({
            sicoob_client_id: process.env.SICOOB_CLIENT_ID ? 'SET' : 'UNDEFINED',
            sicoob_cert_path: process.env.SICOOB_CERT_PATH ? 'SET' : 'UNDEFINED',
            sicoob_cert_pass: process.env.SICOOB_CERT_PASS ? 'SET' : 'UNDEFINED',
            sicoob_pix_key: process.env.SICOOB_PIX_KEY ? 'SET' : 'UNDEFINED',
            node_env: process.env.NODE_ENV,
            cwd: process.cwd()
        });
    });
};
