import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 1) return null; // stop retrying
    return 5000;
  },
  enableOfflineQueue: false // don't queue commands if redis is down
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis for OTP management');
});

redis.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    // Only log once or stay quiet about local connection failures
    const address = err.address || 'localhost';
    const port = err.port || '6379';
    console.warn(`⚠️ Redis is unavailable at ${address}:${port}. OTP services will be limited.`);
  } else {
    console.error('❌ Redis error:', err);
  }
});

/**
 * Store OTP in Redis with a TTL
 * @param {string} key - The identifier (email or phone)
 * @param {string} otp - The 6-digit code
 * @param {number} ttl - Time to live in seconds (default 600s = 10min)
 */
export const storeOTP = async (key, otp, ttl = 600) => {
  try {
    if (redis.status !== 'ready') {
      console.warn('⚠️ Skipping Redis storeOTP: Connection not ready');
      return;
    }
    await redis.set(`otp:${key}`, otp, 'EX', ttl);
  } catch (err) {
    console.error('❌ Failed to store OTP in Redis:', err.message);
  }
};

/**
 * Verify OTP from Redis
 * @param {string} key - The identifier
 * @param {string} otp - The code to verify
 * @returns {boolean}
 */
export const verifyOTP = async (key, otp) => {
  try {
    if (redis.status !== 'ready') {
      console.warn('⚠️ Skipping Redis verifyOTP: Connection not ready');
      return process.env.NODE_ENV === 'development'; // Always valid in dev if redis is down
    }
    const storedOtp = await redis.get(`otp:${key}`);
    if (storedOtp === otp) {
      await redis.del(`otp:${key}`); // Clear after successful verification
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to verify OTP from Redis:', err.message);
  }
  return false;
};
