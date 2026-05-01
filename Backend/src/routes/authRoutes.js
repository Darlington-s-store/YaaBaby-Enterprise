import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

const registerValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phone').optional().isMobilePhone().withMessage('Enter a valid phone number')
];

router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/verify', protect, authController.verifyAccount);
router.post('/request-otp', authController.requestOTP);

// Google OAuth via Firebase
router.post('/google/firebase', authController.firebaseGoogleLogin);
router.post('/phone/firebase', authController.firebasePhoneLogin);

export default router;
