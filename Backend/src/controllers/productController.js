import { Product, Category, ProductVariant, ProductImage } from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      // Relaxed status filter for now to help debug/seed
      // where: { status: 'published' },
      include: [
        { model: Category },
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Category },
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id
    });

    // If images were uploaded via middleware
    if (req.body.images && req.body.images.length > 0) {
      const imageRecords = req.body.images.map((url, index) => ({
        productId: product.id,
        url,
        isPrimary: index === 0,
        altText: product.name
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    // Refetch to include associations
    const freshProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' }
      ]
    });

    res.status(201).json(freshProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'children' }],
      where: { parentId: null } // Get top-level categories first
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, parentId } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const category = await Category.create({
      name,
      slug,
      icon,
      parentId
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, icon, brands } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    category.name = name || category.name;
    category.icon = icon || category.icon;
    if (brands !== undefined) category.brands = brands;
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
