import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Send Push Notification via Firebase Cloud Messaging (FCM)
 * @param {string} token - Device FCM token
 * @param {object} payload - Notification payload { title, body, data }
 */
export const sendPushNotification = async (token, { title, body, data = {} }) => {
  if (!token) return;

  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: token,
        notification: {
          title,
          body,
          sound: 'default',
        },
        data,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${process.env.FCM_SERVER_KEY}`,
        },
      }
    );
    console.log('Push notification sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending push notification:', error.response ? error.response.data : error.message);
    return null;
  }
};

/**
 * Send Welcome Push
 */
export const sendWelcomePush = async (user) => {
  if (!user.fcmToken) return;
  
  return sendPushNotification(user.fcmToken, {
    title: 'Welcome to Yaa Baby! 👶',
    body: `Hi ${user.fullName}, thanks for joining us. We have some amazing deals waiting for you!`,
    data: { screen: 'Shop' }
  });
};

/**
 * Send Order Status Push
 */
export const sendOrderStatusPush = async (user, order) => {
  if (!user.fcmToken) return;

  return sendPushNotification(user.fcmToken, {
    title: 'Order Confirmed! ✅',
    body: `Your order #${order.id} has been placed successfully.`,
    data: { orderId: order.id, screen: 'OrderDetails' }
  });
};
