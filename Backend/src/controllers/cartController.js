import { Cart, CartItem, Product, ProductVariant, ProductImage } from '../models/index.js';

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { customerId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [
          { 
            model: Product,
            include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false }]
          },
          { model: ProductVariant }
        ]
      }]
    });

    if (!cart) {
      cart = await Cart.create({ customerId: req.user.id });
      cart.items = [];
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ where: { customerId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ customerId: req.user.id });
    }

    const [item, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId, variantId },
      defaults: { quantity }
    });

    if (!created) {
      item.quantity += (quantity || 1);
      await item.save();
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const item = await CartItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity = quantity;
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
