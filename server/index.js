import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Database & Initialization
import { pool, initDB } from './db.js';

// Payment Routes (Facade Strategy)
import { setupPaymentRoutes } from './payment.js';

// Route Modules
import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import rafflesRoutes from './routes/raffles.js';
import adminRoutes from './routes/admin.js';
import couponsRoutes from './routes/coupons.js';
import notificationsRoutes from './routes/notifications.js';
import winnersRoutes from './routes/winners.js';
import chatRoutes from './routes/chat.js';
import shippingRoutes from './routes/shipping.js';
import nftsRoutes from './routes/nfts.js';
import bannersRoutes from './routes/banners.js';
import categoriesRoutes from './routes/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

// DEBUG: List files to diagnose ENOENT
console.log('CWD:', process.cwd());
try {
    console.log('Root contents:', fs.readdirSync(process.cwd()));
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
        console.log('Dist contents:', fs.readdirSync(distPath));
    } else {
        console.log('Dist directory DOES NOT EXIST at:', distPath);
    }
} catch (e) {
    console.error('Error listing files:', e);
}

// Express App Setup
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Fix for Google OAuth Popup (COOP)
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    next();
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Initialize Payment Routes
if (pool) {
    setupPaymentRoutes(app, pool);
} else {
    console.warn('Skipping Payment Routes: Pool not ready');
}

// Initialize Database
initDB();

// Health Check
app.get('/health', async (req, res) => {
    try {
        if (!pool) throw new Error('Database pool not initialized');
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

// Mount Route Modules
app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', rafflesRoutes);
app.use('/api', adminRoutes);
app.use('/api', couponsRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', winnersRoutes);
app.use('/api', chatRoutes);
app.use('/api', shippingRoutes);
app.use('/api', nftsRoutes);
app.use('/api', bannersRoutes);
app.use('/api', categoriesRoutes);

// Serve React App (Static Files)
const DIST_DIR = path.join(process.cwd(), 'dist');
console.log('Serving static files from:', DIST_DIR);

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    console.log('Rendering SPA:', indexPath, 'Request:', req.url);
    res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
