import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', reviewController.getProductReviews);

router.post('/', protect, reviewController.createReview);

// Admin moderation
router.get('/admin/pending', protect, authorize('admin', 'super_admin'), reviewController.getPendingReviews);
router.put('/moderate/:reviewId', protect, authorize('admin', 'super_admin'), reviewController.moderateReview);

export default router;
