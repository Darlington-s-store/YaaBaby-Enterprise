import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import './models/index.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import visualSearchRoutes from './routes/visualSearchRoutes.js';
import { checkMaintenanceMode } from './middleware/maintenance.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Request logger for debugging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = allowedOrigins.includes(origin);
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`   Origin: ${origin} | Allowed: ${isAllowed}`);
  next();
});

// Manual CORS handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // If not allowed, still send something but not * if it's a browser
    if (origin) {
      console.warn(`🚨 Blocked Origin: ${origin}`);
      // Don't set the header, browser will block
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Pragma');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkMaintenanceMode);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/visual-search', visualSearchRoutes);

// Database Sync & Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync models
    await sequelize.sync({ alter: true }); 
    console.log('✅ Database models synchronized.');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });

    // Keep the process alive heartbeat
    setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        // console.log('💓 Backend heartbeat...');
      }
    }, 60000);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // process.exit(1); // Optional: keep running or exit
});

startServer();
