import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  colorHex: {
    type: DataTypes.STRING(7),
    allowNull: true
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true
  },
  otherAttributes: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  priceOverride: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default ProductVariant;
