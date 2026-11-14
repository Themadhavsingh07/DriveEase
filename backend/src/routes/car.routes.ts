import { Router } from 'express';
import {
  getCars,
  getFeaturedCars,
  getCarById,
  getCategories,
  createCar,
  updateCar,
  deleteCar,
} from '../controllers/car.controller';
import { authenticateJwt } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import { validateBody } from '../middleware/validate';
import { createCarSchema, updateCarSchema } from '../validators/car.validator';

const router = Router();

router.get('/', getCars);
router.get('/featured', getFeaturedCars);
router.get('/categories', getCategories);
router.get('/:id', getCarById);

// Admin protected routes
router.post('/', authenticateJwt, requireAdmin, validateBody(createCarSchema), createCar);
router.patch('/:id', authenticateJwt, requireAdmin, validateBody(updateCarSchema), updateCar);
router.delete('/:id', authenticateJwt, requireAdmin, deleteCar);

export default router;
