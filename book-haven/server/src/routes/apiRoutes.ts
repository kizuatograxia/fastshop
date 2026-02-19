import express from 'express';
import { createOrder } from '../controllers/orderController';
import { getBooks, createBook, upload } from '../controllers/adminController';

const router = express.Router();

router.post('/orders', createOrder);

// Admin / Book Routes
router.get('/books', getBooks);
router.post('/books', upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 }
]), createBook);

export default router;
