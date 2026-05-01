import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  customerId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  netAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'GHS'
  },
  paymentStatus: {
    type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid', 'refunded'),
    defaultValue: 'unpaid'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedDeliveryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pointsRedeemed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pointsDiscount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  }
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['orderNumber']
    },
    {
      fields: ['customerId']
    },
    {
      fields: ['status']
    }
  ]
});

export default Order;
