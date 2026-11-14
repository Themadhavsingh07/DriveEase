import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { DocumentController } from '../controllers/document.controller';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { documentUploadFields } from '../middleware/upload.middleware';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/user.validator';

const router = Router();

router.use(authenticateUser);

// Profile
router.get('/profile', UserController.getProfile);
router.patch('/profile', validateBody(updateProfileSchema), UserController.updateProfile);
router.patch('/change-password', validateBody(changePasswordSchema), UserController.changePassword);

// Driving License & Documents
router.get('/documents', DocumentController.getMyDocuments);
router.post('/documents', documentUploadFields, DocumentController.uploadDocument);
router.get('/documents/:id/file', DocumentController.streamDocumentFile);
router.delete('/documents/:id', DocumentController.deleteDocument);

export default router;
