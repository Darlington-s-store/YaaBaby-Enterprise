import express from 'express';
import * as statsController from '../controllers/statsController.js';
import * as authController from '../controllers/authController.js';
import * as orderController from '../controllers/orderController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as visualSearchController from '../controllers/visualSearchController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes are protected and restricted to staff roles
router.use(protect);
router.use(authorize('admin', 'super_admin', 'manager'));

router.get('/dashboard-stats', statsController.getDashboardStats);
router.get('/inventory-stats', statsController.getInventoryStats);
router.get('/users', authController.getAllUsers);
router.get('/orders', orderController.getAllOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);

router.get('/payments', paymentController.getAllPayments);
router.put('/payments/:id/status', paymentController.updatePaymentStatus);

// User Management
router.put('/users/:id/status', authController.updateUserStatus);
router.put('/users/:id/role', authController.updateUserRole);
router.put('/users/:id', authController.updateUserDetails);
router.delete('/users/:id', authController.deleteUser);

// Visual Search Management
router.put('/visual-search/:id', visualSearchController.adminUpdateSearch);

export default router;
