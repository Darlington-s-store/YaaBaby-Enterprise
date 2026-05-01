import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json'
  }
});

export const initializeTransaction = async (email, amount, orderId, metadata = {}) => {
  try {
    const response = await paystack.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Paystack expects amount in pesewas/kobo
      reference: `ORD-${orderId}-${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/checkout/success`,
      metadata: {
        orderId,
        ...metadata
      }
    });
    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    throw new Error('Failed to initialize Paystack transaction');
  }
};

export const verifyTransaction = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    throw new Error('Failed to verify Paystack transaction');
  }
};

import crypto from 'crypto';

export const validateWebhook = (payload, signature) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  return hash === signature;
};
