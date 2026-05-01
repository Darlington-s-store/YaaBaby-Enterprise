import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DeliveryPartner = sequelize.define('DeliveryPartner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackingUrlTemplate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

export default DeliveryPartner;
