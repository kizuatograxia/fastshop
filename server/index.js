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
import bannersRoutesModule from './routes/banners.js';
import categoriesRoutesModule from './routes/categories.js';

// Global error handling to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('FATAL: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('CWD:', process.cwd());
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
console.log('DIST_DIR resolved to:', DIST_DIR);

// DEBUG: Print all injected environment Variable Keys to check Railway injection
console.log('--- DETECTED ENVIRONMENT VARIABLE KEYS ---');
const envKeys = Object.keys(process.env).filter(k => k.includes('SICOOB') || k.includes('RAILWAY') || k.includes('DB') || k.includes('NODE'));
console.log(envKeys);
console.log('------------------------------------------');

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

// Health Check (Robust)
app.get('/health', async (req, res) => {
    try {
        if (pool) {
            await pool.query('SELECT 1');
            return res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
        }
        res.json({ status: 'warning', database: 'not_initialized' });
    } catch (error) {
        console.error('Health check failed:', error.message);
        res.status(200).json({ status: 'degraded', database: 'error', message: error.message });
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
app.use('/api', bannersRoutesModule);
app.use('/api', categoriesRoutesModule);

// Serve React App (Static Files)
if (fs.existsSync(DIST_DIR)) {
    console.log('Serving static files from:', DIST_DIR);
    app.use(express.static(DIST_DIR, {
        index: false
    }));
} else {
    console.warn('WARNING: DIST_DIR does not exist at startup:', DIST_DIR);
}

app.get('*', (req, res) => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend not built. Please run npm run build.');
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        if (pool) pool.end();
        process.exit(0);
    });
});
