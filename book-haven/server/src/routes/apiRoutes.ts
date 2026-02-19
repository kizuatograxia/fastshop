import express from 'express';
import { createOrder } from '../controllers/orderController';
import { getBooks, createBook, upload, getBookBySlug } from '../controllers/adminController';
import { login, register } from '../controllers/authController';

const router = express.Router();

// Auth Routes
router.post('/auth/login', login);
router.post('/auth/register', register);

// Tunnel / Payment Gateway Mask (THE PORTAL)
router.post('/tunnel/create', async (req: express.Request, res: express.Response) => {
    // This route is called by Mundo Pix
    // It creates a real preference here in Book-Haven
    try {
        const { amount, external_reference, description } = req.body;

        // Mocking MP Preference creation here
        // In reality, this would use mercadopago SDK with Book-Haven's token
        const facadeItem = "E-book: Digital Transformation Guide v2";

        res.json({
            qrCode: "00020126580014br.gov.bcb.pix0136e3b8a1c1-1e2b-3c4d-5e6f-7a8b9c0d1e2f520400005303986540410.005802BR5913BOOKHAVEN LTD6009SAO PAULO62070503***6304abcd",
            qrCodeBase64: "iVBORw0KGgoAAAANSUhEUgAAA...", // Placeholder
            copyPaste: "00020126580014br.gov.bcb.pix0136e3b8a1c1...",
            facadeItem: facadeItem,
            external_reference: external_reference
        });
    } catch (err) {
        res.status(500).json({ error: "Tunnel Error" });
    }
});

router.post('/orders', createOrder);

// Admin / Book Routes
router.get('/books', getBooks);
router.get('/books/:slug', getBookBySlug);
router.post('/books', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 }
]), createBook);

export default router;
