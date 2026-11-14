import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticateUser, AuthController.me);

// Legacy routes for backward compatibility
router.patch('/profile', authenticateUser, validateBody(updateProfileSchema), UserController.updateProfile);
router.patch('/change-password', authenticateUser, validateBody(changePasswordSchema), UserController.changePassword);
router.post('/change-password', authenticateUser, validateBody(changePasswordSchema), UserController.changePassword);

export default router;
