import express from 'express';
import * as shippingController from '../controllers/shippingController.js';
import * as deliveryPartnerController from '../controllers/deliveryPartnerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin-only routes for management
router.use(protect);
router.use(authorize('admin', 'super_admin', 'manager'));

router.get('/zones', shippingController.getShippingZones);
router.post('/zones', shippingController.createShippingZone);
router.delete('/zones/:id', shippingController.deleteShippingZone);

router.post('/zones/:zoneId/methods', shippingController.createShippingMethod);

// Delivery Partners
router.get('/partners', deliveryPartnerController.getAllPartners);
router.post('/partners', deliveryPartnerController.createPartner);
router.put('/partners/:id', deliveryPartnerController.updatePartner);
router.delete('/partners/:id', deliveryPartnerController.deletePartner);

export default router;
