import { Product, ProductImage, VisualSearch } from '../models/index.js';
import { uploadToFirebase } from '../middleware/upload.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const performVisualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    console.log(`📸 Processing visual search: ${req.file.originalname}`);

    // Upload to Firebase
    const result = await uploadToFirebase(req.file.buffer, req.file.originalname, 'visual-searches');
    const imageUrl = result.secure_url;
    
    // Simulate AI tag detection
    // In a production environment, you would integrate Google Cloud Vision or a similar API here.
    const detectedTags = ['premium', 'featured', 'new-arrival'];

    // Find products - for now we return featured/published products to simulate relevance
    const products = await Product.findAll({
      // where: { status: 'published' },
      include: [{ model: ProductImage, as: 'images' }],
      limit: 6,
      order: [sequelize.random()] // Randomize to simulate "search" variety
    });

    // Map products for frontend
    const mappedProducts = products.map(p => {
      const data = p.toJSON();
      return {
        ...data,
        image: data.images?.find((img) => img.isPrimary)?.url || data.images?.[0]?.url || "",
        images: data.images?.map((img) => img.url) || [],
        price: Number(data.price),
        compareAt: data.compareAt ? Number(data.compareAt) : undefined,
      };
    });

    // Log the search in background
    const visualSearch = await VisualSearch.create({
      imageUrl,
      detectedTags,
      resultsCount: mappedProducts.length,
      customerId: req.user?.id || null,
      metadata: { 
        originalName: req.file.originalname, 
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

    res.json({
      products: mappedProducts,
      searchId: visualSearch.id
    });
  } catch (error) {
    console.error('Visual search error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    const history = await VisualSearch.findAll({
      where: { customerId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitAvailabilityRequest = async (req, res) => {
  try {
    const { searchId } = req.params;
    const { notes } = req.body;

    const visualSearch = await VisualSearch.findOne({
      where: { 
        id: searchId,
        customerId: req.user.id 
      }
    });

    if (!visualSearch) {
      return res.status(404).json({ message: 'Search record not found' });
    }

    visualSearch.isRequest = true;
    if (notes) {
      visualSearch.adminNotes = notes;
    }
    
    await visualSearch.save();

    res.json({ 
      message: 'Availability request submitted successfully', 
      visualSearch 
    });
  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const adminUpdateSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, isRequest } = req.body;

    const visualSearch = await VisualSearch.findByPk(id);

    if (!visualSearch) {
      return res.status(404).json({ message: 'Search record not found' });
    }

    if (adminNotes !== undefined) visualSearch.adminNotes = adminNotes;
    if (isRequest !== undefined) visualSearch.isRequest = isRequest;
    
    await visualSearch.save();

    res.json({ 
      message: 'Search record updated successfully', 
      visualSearch 
    });
  } catch (error) {
    console.error('Admin update search error:', error);
    res.status(500).json({ message: error.message });
  }
};
