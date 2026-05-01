import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible settings (site name, logo, etc.)
router.get('/', settingsController.getSettings);

// Admin-only updates
router.put('/update', authenticate, authorize('admin', 'super_admin'), settingsController.updateSetting);
router.put('/bulk-update', authenticate, authorize('admin', 'super_admin'), settingsController.bulkUpdateSettings);

export default router;
