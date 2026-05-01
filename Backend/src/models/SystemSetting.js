import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SystemSetting = sequelize.define('SystemSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  group: {
    type: DataTypes.STRING,
    defaultValue: 'general' // general, contact, social, payment, etc.
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

export default SystemSetting;
