import express from 'express';
import * as productController from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

import { upload, firebaseUploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:slug', productController.getProductBySlug);

// Admin only routes
router.post(
  '/', 
  protect, 
  authorize('admin', 'super_admin'), 
  upload.array('images', 5), 
  firebaseUploadMiddleware,
  productController.createProduct
);

router.post(
  '/categories',
  protect,
  authorize('admin', 'super_admin'),
  productController.createCategory
);

router.put(
  '/categories/:id',
  protect,
  authorize('admin', 'super_admin'),
  productController.updateCategory
);

router.delete(
  '/categories/:id',
  protect,
  authorize('admin', 'super_admin'),
  productController.deleteCategory
);

export default router;
