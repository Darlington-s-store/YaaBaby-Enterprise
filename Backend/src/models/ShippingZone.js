import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ShippingZone = sequelize.define('ShippingZone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  regions: {
    type: DataTypes.ARRAY(DataTypes.STRING), // ['Greater Accra', 'Ashanti', etc.]
    defaultValue: []
  },
  countries: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['GH']
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

export default ShippingZone;
