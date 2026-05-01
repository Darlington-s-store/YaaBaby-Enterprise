import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  paymentGateway: {
    type: DataTypes.STRING, // 'paystack', 'stripe', 'momo', etc.
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'GHS'
  },
  status: {
    type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

export default Payment;
