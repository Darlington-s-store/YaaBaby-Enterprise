import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cartId: {
    type: DataTypes.UUID,
    references: {
      model: 'Carts',
      key: 'id'
    }
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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['cartId', 'productId', 'variantId']
    }
  ]
});

export default CartItem;
