import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController';
import { createOrder } from '../controllers/orderController';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { getLibrary } from '../controllers/libraryController';
import { getBooks, getBook, createBook, updateBook, deleteBook } from '../controllers/bookController';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.use(authenticateToken);

// Cart Routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:itemId', removeFromCart);

// Order Routes
router.post('/orders', createOrder);

// User Routes
router.get('/library', getLibrary);

import { upload } from '../middleware/uploadMiddleware';

// ...
// Admin Book Routes
router.post('/books', upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), createBook);

// ...
router.delete('/books/:id', deleteBook);

// Notification Routes
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markAsRead);

export default router;
