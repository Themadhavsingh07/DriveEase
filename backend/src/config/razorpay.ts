import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from './env';

export const razorpayInstance = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return false;
  }
};

export const verifyRazorpayWebhookSignature = (
  rawBody: string | Buffer,
  signature: string,
  secret = ENV.RAZORPAY_WEBHOOK_SECRET
): boolean => {
  try {
    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('Razorpay webhook signature verification error:', err);
    return false;
  }
};
