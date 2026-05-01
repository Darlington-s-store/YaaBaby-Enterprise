import { Order, User, Product, Review, Payment, Category } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Order.sum('netAmount', { where: { paymentStatus: 'paid' } }) || 0;
    const totalOrders = await Order.count();
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalProducts = await Product.count();

    // Last 7 days revenue for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('netAmount')), 'total']
      ],
      where: {
        paymentStatus: 'paid',
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'customer', attributes: ['fullName', 'email'] }]
    });

    // Pending reviews count
    const pendingReviewsCount = await Review.count({ where: { status: 'pending' } });

    // Category distribution
    const categoryDistribution = await Product.findAll({
      attributes: [
        [sequelize.col('Category.name'), 'name'],
        [sequelize.fn('COUNT', sequelize.col('Product.id')), 'value']
      ],
      include: [{
        model: Category,
        attributes: [],
        required: true
      }],
      group: ['Category.name'],
      raw: true
    });

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingReviewsCount
      },
      dailyRevenue,
      recentOrders,
      categoryDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const outOfStock = await Product.count({ 
      // Simplified: should check variants too
      where: { totalSold: { [Op.gt]: 100 } } 
    });

    const categoryDistribution = await Product.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['categoryId']
    });

    res.json({
      outOfStock,
      categoryDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
