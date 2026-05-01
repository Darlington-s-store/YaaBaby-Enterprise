import express from 'express';
import { initializePayment, handlePaystackWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public webhook (called by Paystack)
router.post('/webhook', handlePaystackWebhook);

// Protected payment routes
router.post('/initialize', protect, initializePayment);

export default router;
