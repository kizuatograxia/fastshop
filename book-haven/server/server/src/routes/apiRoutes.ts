import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController';
import { createOrder } from '../controllers/orderController';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { getLibrary } from '../controllers/libraryController';
import { getBooks, getBook, createBook, updateBook, deleteBook, getAllBooks } from '../controllers/bookController';
import { upload } from '../middleware/uploadMiddleware';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// ==========================================
router.get('/books', getBooks); // Returns only PUBLISHED books
router.get('/books/:id', getBook);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(`[Auth] Checking ${req.method} ${req.path}`);

    if (!token) {
        console.log('[Auth] No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err: any, user: any) => {
        if (err) {
            console.log('[Auth] Token verification failed:', err.message);
            return res.sendStatus(403);
        }
        console.log('[Auth] Success for user:', user.userId, 'role:', user.role);
        req.user = user;
        next();
    });
};

router.use(authenticateToken);

// Admin-Specific (Should ideally be in adminRoutes but keeping here for simplicity/access)
router.get('/admin/books', getAllBooks); // Returns ALL books (Draft, Archived, etc)

// Multer error handler
const handleMulterError = (err: any, req: any, res: any, next: any) => {
    if (err) {
        console.error('❌ Multer Error:', err);
        return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    next();
};

router.post('/books',
    upload.fields([
        { name: 'bookFile', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    handleMulterError,
    createBook
);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Cart Routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:itemId', removeFromCart);

// Order Routes
router.post('/orders', createOrder);

// User Routes
router.get('/library', getLibrary);

// Notification Routes
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markAsRead);

export default router;
