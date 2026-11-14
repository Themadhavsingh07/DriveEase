import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DocumentService } from '../services/document.service';
import { sendSuccess } from '../utils/apiResponse';
import { DocumentStatus } from '@prisma/client';
import { AppError } from '../utils/appError';

export class DocumentController {
  static async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { documentType, documentNumber, expiryDate } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const frontFile = files?.frontImage?.[0];
      const backFile = files?.backImage?.[0];

      const doc = await DocumentService.uploadDocument({
        userId,
        documentType,
        documentNumber,
        expiryDate,
        frontFile,
        backFile,
      });

      return sendSuccess(res, { document: doc }, 'Document uploaded successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async getMyDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const docs = await DocumentService.getMyDocuments(req.user!.id);
      return sendSuccess(res, { documents: docs }, 'Documents retrieved successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async streamDocumentFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const side = (req.query.side as 'front' | 'back') || 'front';
      const userId = req.user!.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const fileInfo = await DocumentService.streamDocumentFile(id, side, userId, isAdmin);

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileInfo.originalName}"`);
      res.sendFile(fileInfo.filePath);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const isAdmin = req.user?.role === 'ADMIN';

      const result = await DocumentService.deleteDocument(id, userId, isAdmin);
      return sendSuccess(res, result, 'Document deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async adminReviewDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!status || !Object.values(DocumentStatus).includes(status)) {
        return next(new AppError('Invalid document status.', 400));
      }

      const adminId = req.user!.id;
      const adminEmail = req.user!.email;

      const doc = await DocumentService.adminReviewDocument(
        id,
        status as DocumentStatus,
        rejectionReason,
        adminId,
        adminEmail,
        req
      );

      return sendSuccess(res, { document: doc }, `Document ${status.toLowerCase()} successfully.`);
    } catch (error) {
      next(error);
    }
  }
}
