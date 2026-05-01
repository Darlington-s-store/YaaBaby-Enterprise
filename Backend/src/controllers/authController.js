import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import admin from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';

import { storeOTP, verifyOTP } from '../services/redisService.js';
import { sendVerificationOTP, sendWelcomeEmail } from '../services/notificationService.js';
import { sendWelcomePush } from '../services/pushNotificationService.js';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, phone, password, fullName, referralCode } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ where: { referralCode } });
    }

    const newUser = await User.create({
      email,
      phone,
      password,
      fullName,
      referralCode: uuidv4().substring(0, 8).toUpperCase(),
      referredBy: referredByUser ? referredByUser.id : null,
      isEmailVerified: false,
      isPhoneVerified: false
    });

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await storeOTP(email, otp);
    
    // Fire and forget (or use Bull queue for reliability)
    sendVerificationOTP(newUser, otp).catch(err => console.error('Failed to send OTP:', err));
    
    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({
      message: 'Registration successful. Verification code sent.',
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isEmailVerified: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyAccount = async (req, res) => {
  const { otp } = req.body;
  const userEmail = req.user.email; // Assuming authenticated via token

  try {
    const isValid = await verifyOTP(userEmail, otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const user = await User.findByPk(req.user.id);
    user.isEmailVerified = true;
    await user.save();

    // Send Welcome Email after successful verification
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
    sendWelcomePush(user).catch(err => console.error('Welcome push failed:', err));

    res.json({ message: 'Account verified successfully', isEmailVerified: true });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Account is banned: ' + user.banReason });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update login stats
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const tokens = generateTokens(user);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken // Optionally rotate refresh token
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  // TODO: Blacklist token in Redis if needed
  res.json({ message: 'Logged out successfully' });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'fullName', 'role', 'phone', 'isEmailVerified', 'isPhoneVerified', 'isActive', 'isBanned', 'createdAt', 'lastLoginAt', 'loginCount']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const firebaseGoogleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Firebase ID token is required' });
  }

  try {
    // 1. Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    // 2. Find or create user in our DB
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        email,
        fullName: name || 'Google User',
        avatarUrl: picture,
        firebaseUid: uid,
        isEmailVerified: true, // Google emails are pre-verified
        password: uuidv4(), // Random password for social login users
        referralCode: uuidv4().substring(0, 8).toUpperCase()
      });
      
      sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
    } else {
      // Update existing user's firebase info if needed
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
      }
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Account is banned: ' + user.banReason });
    }

    // 3. Generate our own tokens
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Firebase Google Login error:', error);
    res.status(401).json({ message: 'Invalid or expired Firebase token' });
  }
};

export const firebasePhoneLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Firebase ID token is required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { phone_number, uid } = decodedToken;

    if (!phone_number) {
      return res.status(400).json({ message: 'No phone number found in token' });
    }

    // Find or create user by phone
    let user = await User.findOne({ where: { phone: phone_number } });

    if (!user) {
      user = await User.create({
        phone: phone_number,
        fullName: 'Phone User',
        firebaseUid: uid,
        isPhoneVerified: true,
        password: uuidv4(),
        referralCode: uuidv4().substring(0, 8).toUpperCase()
      });
      
      sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.isPhoneVerified = true;
        await user.save();
      }
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Account is banned: ' + user.banReason });
    }

    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Firebase Phone Login error:', error);
    res.status(401).json({ message: 'Invalid or expired Firebase token' });
  }
};

export const requestOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await storeOTP(email, otp);
    await sendVerificationOTP(user, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isBanned, banReason } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = isBanned;
    if (banReason) user.banReason = banReason;
    await user.save();

    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserDetails = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
