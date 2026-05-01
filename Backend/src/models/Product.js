import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.UUID,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  brandId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Brands',
      key: 'id'
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isNewArrival: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  basePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  salePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  costPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  taxClass: {
    type: DataTypes.STRING,
    defaultValue: 'standard'
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSONB, // {length, width, height}
    allowNull: true
  },
  shippingClass: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackInventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  allowBackorders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  minOrderQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxOrderQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSold: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['status']
    },
    {
      fields: ['categoryId']
    }
  ]
});

export default Product;
