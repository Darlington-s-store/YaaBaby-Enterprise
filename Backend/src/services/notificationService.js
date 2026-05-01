import { Resend } from 'resend';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Email Notification via Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Yaa Baby Enterprise <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent via Resend:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
};

/**
 * Send SMS Notification via Arkesel
 * @param {string} to - Phone number
 * @param {string} message - SMS content
 */
export const sendSMS = async (to, message) => {
  try {
    if (!process.env.ARKESEL_API_KEY) {
      console.log(`[SMS Simulation] To: ${to} | Message: ${message}`);
      return true;
    }

    // Standardize phone number for Ghana if it starts with 0
    let phone = to.replace(/\s/g, '');
    if (phone.startsWith('0')) {
      phone = '233' + phone.substring(1);
    } else if (!phone.startsWith('233') && !phone.startsWith('+')) {
      phone = '233' + phone;
    }

    const response = await axios.get('https://sms.arkesel.com/sms/api', {
      params: {
        action: 'send-sms',
        api_key: process.env.ARKESEL_API_KEY,
        to: phone,
        from: process.env.ARKESEL_SENDER_ID || 'YaaBaby',
        sms: message
      }
    });

    console.log('SMS sent via Arkesel:', response.data);
    return response.data.code === 'ok';
  } catch (error) {
    console.error('Error sending SMS via Arkesel:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Yaa Baby Enterprise! 👶✨';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #FF6B6B;">Welcome, ${user.fullName}!</h2>
      <p>We're thrilled to have you join our community. Yaa Baby Enterprise is your home for premium baby essentials and elegant care.</p>
      <p>Start exploring our collection today!</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'https://yaababy.com'}/shop" style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #777;">If you have any questions, simply reply to this email.</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};

/**
 * Send Verification OTP (Email + SMS)
 */
export const sendVerificationOTP = async (user, otp) => {
  // 1. Email OTP
  const emailSubject = 'Verify your Yaa Baby Account';
  const emailHtml = `
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h1>Verify Your Email</h1>
      <p>Your 6-digit verification code is:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B6B; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
  await sendEmail(user.email, emailSubject, emailHtml);

  // 2. SMS OTP
  const smsMessage = `Your Yaa Baby verification code is ${otp}. Valid for 10 mins.`;
  if (user.phone) {
    await sendSMS(user.phone, smsMessage);
  }
};

/**
 * Send Order Confirmation
 */
export const sendOrderConfirmation = async (user, order) => {
  const subject = `Order Confirmed - #${order.id}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Thank you for your order, ${user.fullName}!</h2>
      <p>Your order <strong>#${order.id}</strong> has been received and is being processed.</p>
      <p>Total Amount: <strong>GHS ${order.totalAmount}</strong></p>
      <p>We'll notify you once your items are on their way.</p>
    </div>
  `;
  return sendEmail(user.email, subject, html);
};
