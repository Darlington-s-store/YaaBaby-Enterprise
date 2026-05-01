import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductVariant from './ProductVariant.js';
import ProductImage from './ProductImage.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Payment from './Payment.js';
import Review from './Review.js';
import ShippingZone from './ShippingZone.js';
import ShippingMethod from './ShippingMethod.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Brand from './Brand.js';
import SystemSetting from './SystemSetting.js';
import DeliveryPartner from './DeliveryPartner.js';
import VisualSearch from './VisualSearch.js';

// Associations
Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.hasMany(ProductVariant, { as: 'variants', foreignKey: 'productId' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductImage, { as: 'images', foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

ProductVariant.hasMany(ProductImage, { as: 'images', foreignKey: 'variantId' });
ProductImage.belongsTo(ProductVariant, { foreignKey: 'variantId' });

User.hasOne(Cart, { as: 'cart', foreignKey: 'customerId' });
Cart.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

CartItem.belongsTo(Product, { foreignKey: 'productId' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

User.hasMany(Order, { as: 'orders', foreignKey: 'customerId' });
Order.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(Payment, { as: 'payments', foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(Review, { as: 'reviews', foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Review, { as: 'reviews', foreignKey: 'customerId' });
Review.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

ShippingZone.hasMany(ShippingMethod, { as: 'methods', foreignKey: 'zoneId' });
ShippingMethod.belongsTo(ShippingZone, { foreignKey: 'zoneId' });

OrderItem.belongsTo(Product, { foreignKey: 'productId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId' });

User.hasMany(Product, { as: 'createdProducts', foreignKey: 'createdBy' });
Product.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

User.hasMany(User, { as: 'referrals', foreignKey: 'referredBy' });
User.belongsTo(User, { as: 'referrer', foreignKey: 'referredBy' });

User.hasMany(VisualSearch, { as: 'visualSearches', foreignKey: 'customerId' });
VisualSearch.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });

export {
  User,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Order,
  OrderItem,
  Payment,
  Review,
  ShippingZone,
  ShippingMethod,
  Cart,
  CartItem,
  Brand,
  SystemSetting,
  DeliveryPartner,
  VisualSearch
};
