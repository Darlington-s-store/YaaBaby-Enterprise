import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShippingMethod = sequelize.define('ShippingMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  zoneId: {
    type: DataTypes.UUID,
    references: {
      model: 'ShippingZones',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('flat_rate', 'free_shipping', 'weight_based', 'local_pickup'),
    defaultValue: 'flat_rate'
  },
  baseCost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  minOrderValue: { // For free shipping threshold
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  estimatedDays: {
    type: DataTypes.STRING, // e.g., '1-3'
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default ShippingMethod;
