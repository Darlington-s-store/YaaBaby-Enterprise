import express from 'express';
import { performVisualSearch, getSearchHistory, submitAvailabilityRequest } from '../controllers/visualSearchController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public visual search (simulated)
router.post('/', upload.single('image'), performVisualSearch);

// History (authenticated)
router.get('/history', authenticate, getSearchHistory);

// Submit availability request
router.post('/:searchId/request', authenticate, submitAvailabilityRequest);

export default router;
