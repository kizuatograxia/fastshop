import express from 'express';
import { createOrder, getOrders, getDashboardStats, createTunnelOrder, getRandomBook, handleWebhook } from '../controllers/orderController';
import { getBooks, createBook, upload, getBookBySlug, deleteBook } from '../controllers/adminController';
import { login, register } from '../controllers/authController';
import { authenticate, requireAdmin, requireApiKey } from '../middleware/auth';
import { createPaymentPreference } from '../lib/mercadopago';

const router = express.Router();

// Auth Routes
router.post('/auth/login', login);
router.post('/auth/register', register);

// Tunnel / Payment Gateway Mask (THE PORTAL)
router.post('/tunnel/payment', requireApiKey, async (req: express.Request, res: express.Response) => {
    // This route is called by Mundo Pix
    // It creates a real preference here in Book-Haven
    try {
        const { amount, external_reference, description, payer_email } = req.body;

        // 1. Create an order in the database
        const order = await createTunnelOrder(amount, external_reference, description);

        // 2. Get a random book for the facade
        const facadeBook = await getRandomBook();
        const facadeItem = facadeBook ? facadeBook.title : "E-book: Digital Transformation Guide";

        // 3. Create a payment preference
        const preference = await createPaymentPreference(
            [{
                title: facadeItem,
                quantity: 1,
                unit_price: amount,
            }],
            { email: payer_email },
            external_reference
        );

        // 4. Return the preference details
        res.json({
            qrCode: preference.init_point, // This is the URL to the checkout
            qrCodeBase64: '', // We can generate a QR code from the init_point on the client side
            copyPaste: preference.init_point,
            facadeItem: facadeItem,
            external_reference: external_reference,
            orderId: order.id,
            preferenceId: preference.id,
        });
    } catch (err: any) {
        console.error("Tunnel Error:", err);
        res.status(500).json({ error: "Tunnel Error", message: err.message });
    }
});


router.post('/webhook/payment', handleWebhook);

router.post('/orders', authenticate, createOrder);
router.get('/orders', authenticate, requireAdmin, getOrders); // For Admin
router.get('/stats', authenticate, requireAdmin, getDashboardStats); // For Admin

// Admin / Book Routes
router.get('/books', getBooks);
router.get('/books/:slug', getBookBySlug);
router.post('/books', authenticate, requireAdmin, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 }
]), createBook);
router.delete('/books/:id', authenticate, requireAdmin, deleteBook);

export default router;
