import { Review, Product, User, Order, OrderItem } from '../models/index.js';

export const createReview = async (req, res) => {
  const { productId, rating, comment, images } = req.body;

  try {
    // 1. Verify if user has purchased the product (Verified Purchase)
    const hasPurchased = await Order.findOne({
      where: { customerId: req.user.id, status: 'delivered' },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { productId }
      }]
    });

    const review = await Review.create({
      productId,
      customerId: req.user.id,
      rating,
      comment,
      images,
      isVerifiedPurchase: !!hasPurchased,
      status: 'pending' // Admin must approve
    });

    res.status(201).json({
      message: 'Review submitted successfully and is awaiting moderation',
      review
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId, status: 'approved' },
      include: [{ model: User, as: 'customer', attributes: ['fullName', 'avatarUrl'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const moderateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { status, reply } = req.body;

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (status) review.status = status;
    if (reply) {
      review.reply = reply;
      review.repliedAt = new Date();
    }

    await review.save();

    // If approved, update product average rating (Simplified)
    if (status === 'approved') {
      const allReviews = await Review.findAll({ 
        where: { productId: review.productId, status: 'approved' } 
      });
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      
      const product = await Product.findByPk(review.productId);
      product.averageRating = avg;
      product.reviewCount = allReviews.length;
      await product.save();
    }

    res.json({ message: 'Review moderated successfully', review });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { status: 'pending' },
      include: [
        { model: Product, attributes: ['name'] },
        { model: User, as: 'customer', attributes: ['fullName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
