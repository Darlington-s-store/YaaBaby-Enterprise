import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductImage = sequelize.define('ProductImage', {
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
  variantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ProductVariants',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cloudinaryPublicId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  altText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default ProductImage;
