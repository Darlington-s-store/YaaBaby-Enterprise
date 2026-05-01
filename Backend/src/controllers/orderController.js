import { Order, OrderItem, Cart, CartItem, Product, ProductVariant, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shippingAddress, billingAddress, shippingMethod, couponCode, customerNotes, pointsToRedeem } = req.body;

    // 1. Get user's cart
    const cart = await Cart.findOne({
      where: { customerId: req.user.id },
      include: [{ 
        model: CartItem, 
        as: 'items',
        include: [
          { model: Product },
          { model: ProductVariant }
        ]
      }]
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Calculate totals and verify stock
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const product = item.Product;
      const variant = item.ProductVariant;
      
      const price = variant ? (variant.priceOverride || product.basePrice) : product.basePrice;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      // Basic stock check
      if (variant && variant.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (${variant.size || variant.color})`);
      }

      orderItemsData.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        productName: product.name,
        sku: variant ? variant.sku : product.sku,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal
      });
    }

    // 3. Loyalty Points Discount
    let pointsDiscount = 0;
    if (pointsToRedeem > 0) {
      // Re-fetch user to get latest points
      const { User } = await import('../models/index.js');
      const user = await User.findByPk(req.user.id);
      if (user.loyaltyPoints < pointsToRedeem) {
        throw new Error('Insufficient loyalty points');
      }
      pointsDiscount = pointsToRedeem / 100; // 100 points = 1 GHS
    }

    // 4. Final Calculations
    const shippingAmount = 0; // TODO: Implement shipping logic
    const taxAmount = (subtotal - pointsDiscount) * 0.05; 
    const netAmount = Math.max(0, subtotal + shippingAmount + taxAmount - pointsDiscount);

    // 5. Create the Order
    const order = await Order.create({
      orderNumber: `YAA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerId: req.user.id,
      totalAmount: subtotal,
      shippingAmount,
      taxAmount,
      netAmount,
      pointsRedeemed: pointsToRedeem || 0,
      pointsDiscount,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod,
      couponCode,
      customerNotes
    }, { transaction });

    // 6. Create OrderItems
    const { OrderItem: OrderItemModel } = await import('../models/index.js');
    await OrderItemModel.bulkCreate(
      orderItemsData.map(item => ({ ...item, orderId: order.id })),
      { transaction }
    );

    // 7. Update Stock
    for (const item of cart.items) {
      if (item.ProductVariant) {
        await item.ProductVariant.decrement('stockQuantity', { 
          by: item.quantity, 
          transaction 
        });
      }
    }

    // 8. Clear Cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    // 9. Send Notifications (Async)
    const { sendOrderConfirmation } = await import('../services/notificationService.js');
    const { sendOrderStatusPush } = await import('../services/pushNotificationService.js');
    
    sendOrderConfirmation(req.user, order).catch(err => console.error('Email failed:', err));
    sendOrderStatusPush(req.user, order).catch(err => console.error('Push failed:', err));

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Checkout error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, customerId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'customer', attributes: ['fullName', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
