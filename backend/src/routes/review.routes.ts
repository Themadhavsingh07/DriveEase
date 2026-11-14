import { Router } from 'express';
import { getCarReviews, createReview } from '../controllers/review.controller';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/cars/:carId/reviews', getCarReviews);
router.post('/reviews', authenticateJwt, createReview);

export default router;
