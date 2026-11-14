import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handleRazorpayWebhook,
} from '../controllers/payment.controller';
import { authenticateJwt } from '../middleware/auth';
import { paymentRateLimiter, webhookRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/create-order', paymentRateLimiter, authenticateJwt, createRazorpayOrder);
router.post('/verify', paymentRateLimiter, authenticateJwt, verifyPayment);
router.post('/webhook', webhookRateLimiter, handleRazorpayWebhook);

export default router;
