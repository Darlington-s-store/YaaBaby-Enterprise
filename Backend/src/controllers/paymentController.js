import { Payment, Order, User } from '../models/index.js';
import * as paystackService from '../services/paystackService.js';

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { 
          model: Order, 
          include: [{ model: User, as: 'customer', attributes: ['fullName', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    if (status === 'successful') {
      payment.paidAt = new Date();
    }
    
    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const initializePayment = async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;
    
    const initialization = await paystackService.initializeTransaction(email, amount, orderId);
    
    await Payment.create({
      orderId,
      transactionId: initialization.data.reference,
      paymentGateway: 'paystack',
      amount,
      status: 'pending'
    });
    
    res.json(initialization.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handlePaystackWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const isValid = paystackService.validateWebhook(req.body, signature);
    
    if (!isValid) {
      return res.status(401).send('Invalid signature');
    }
    
    const event = req.body;
    
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      const orderId = metadata.orderId;
      
      const payment = await Payment.findOne({ where: { transactionId: reference } });
      if (payment) {
        payment.status = 'successful';
        payment.paidAt = new Date();
        payment.gatewayResponse = event.data;
        await payment.save();
      }
      
      const order = await Order.findByPk(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};
