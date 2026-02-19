import express from 'express';
import { createPaymentTunnel, handlePaymentWebhook } from '../controllers/tunnelController';

const router = express.Router();

// Tunnel Endpoint (Called by App)
router.post('/payment', createPaymentTunnel);

// Webhook Endpoint (Called by Mercado Pago)
router.post('/webhook', handlePaymentWebhook);

export default router;
