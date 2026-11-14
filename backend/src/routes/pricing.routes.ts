import { Router } from 'express';
import {
  calculatePrice,
  validateCoupon,
  getAdditionalServices,
} from '../controllers/pricing.controller';
import { validateBody } from '../middleware/validate';
import { calculatePriceSchema, validateCouponSchema } from '../validators/booking.validator';

const router = Router();

router.post('/pricing/calculate', validateBody(calculatePriceSchema), calculatePrice);
router.post('/coupons/validate', validateBody(validateCouponSchema), validateCoupon);
router.get('/services', getAdditionalServices);

export default router;
