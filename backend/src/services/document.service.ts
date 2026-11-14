import path from 'path';
import fs from 'fs';
import { DocumentStatus } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/appError';
import { AuditService } from './audit.service';

export interface UploadDocumentParams {
  userId: string;
  documentType?: string;
  documentNumber?: string;
  expiryDate?: string | Date;
  frontFile?: Express.Multer.File;
  backFile?: Express.Multer.File;
}

export class DocumentService {
  /**
   * Uploads or updates a customer's identity / driving license document
   */
  static async uploadDocument(params: UploadDocumentParams) {
    const { userId, documentType = 'DRIVING_LICENSE', documentNumber, expiryDate, frontFile, backFile } = params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    // Check if user already has a document of this type
    const existing = await prisma.userDocument.findFirst({
      where: { userId, documentType },
    });

    let frontImagePath = existing?.frontImagePath;
    let frontOriginalName = existing?.frontOriginalName;
    let frontMimeType = existing?.frontMimeType;
    let frontFileSize = existing?.frontFileSize;

    if (frontFile) {
      // Remove old file if replacing
      if (existing?.frontImagePath && fs.existsSync(existing.frontImagePath)) {
        try { fs.unlinkSync(existing.frontImagePath); } catch {}
      }
      frontImagePath = frontFile.path;
      frontOriginalName = frontFile.originalname;
      frontMimeType = frontFile.mimetype;
      frontFileSize = frontFile.size;
    }

    let backImagePath = existing?.backImagePath;
    let backOriginalName = existing?.backOriginalName;
    let backMimeType = existing?.backMimeType;
    let backFileSize = existing?.backFileSize;

    if (backFile) {
      if (existing?.backImagePath && fs.existsSync(existing.backImagePath)) {
        try { fs.unlinkSync(existing.backImagePath); } catch {}
      }
      backImagePath = backFile.path;
      backOriginalName = backFile.originalname;
      backMimeType = backFile.mimetype;
      backFileSize = backFile.size;
    }

    const parsedExpiry = expiryDate ? new Date(expiryDate) : existing?.expiryDate;

    let doc;
    if (existing) {
      doc = await prisma.userDocument.update({
        where: { id: existing.id },
        data: {
          documentNumber: documentNumber?.trim() || existing.documentNumber,
          expiryDate: parsedExpiry,
          frontImagePath,
          frontOriginalName,
          frontMimeType,
          frontFileSize,
          backImagePath,
          backOriginalName,
          backMimeType,
          backFileSize,
          verificationStatus: DocumentStatus.PENDING, // Reset to pending for review upon re-upload
          rejectionReason: null,
        },
      });
    } else {
      doc = await prisma.userDocument.create({
        data: {
          userId,
          documentType,
          documentNumber: documentNumber?.trim() || null,
          expiryDate: parsedExpiry,
          frontImagePath,
          frontOriginalName,
          frontMimeType,
          frontFileSize,
          backImagePath,
          backOriginalName,
          backMimeType,
          backFileSize,
          verificationStatus: DocumentStatus.PENDING,
        },
      });
    }

    // Keep user's drivingLicenseNumber synchronized if document is DRIVING_LICENSE
    if (documentType === 'DRIVING_LICENSE' && documentNumber) {
      await prisma.user.update({
        where: { id: userId },
        data: { drivingLicenseNumber: documentNumber.trim() },
      });
    }

    return this.sanitizeDocument(doc);
  }

  /**
   * Retrieves all documents for a customer
   */
  static async getMyDocuments(userId: string) {
    const docs = await prisma.userDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => this.sanitizeDocument(d));
  }

  /**
   * Streams a private document file with authorization
   */
  static async streamDocumentFile(id: string, side: 'front' | 'back', userId: string, isAdmin: boolean) {
    const doc = await prisma.userDocument.findUnique({ where: { id } });
    if (!doc) throw new AppError('Document not found.', 404);

    if (!isAdmin && doc.userId !== userId) {
      throw new AppError('Forbidden: Access denied to private document.', 403);
    }

    const filePath = side === 'front' ? doc.frontImagePath : doc.backImagePath;
    const mimeType = side === 'front' ? doc.frontMimeType : doc.backMimeType;
    const originalName = side === 'front' ? doc.frontOriginalName : doc.backOriginalName;

    if (!filePath || !fs.existsSync(filePath)) {
      throw new AppError(`No ${side} image uploaded for this document.`, 404);
    }

    return { filePath, mimeType: mimeType || 'application/octet-stream', originalName: originalName || 'document' };
  }

  /**
   * Deletes a document and cleans up disk files
   */
  static async deleteDocument(id: string, userId: string, isAdmin: boolean) {
    const doc = await prisma.userDocument.findUnique({ where: { id } });
    if (!doc) throw new AppError('Document not found.', 404);

    if (!isAdmin && doc.userId !== userId) {
      throw new AppError('Forbidden: Cannot delete another customer’s document.', 403);
    }

    if (doc.frontImagePath && fs.existsSync(doc.frontImagePath)) {
      try { fs.unlinkSync(doc.frontImagePath); } catch {}
    }
    if (doc.backImagePath && fs.existsSync(doc.backImagePath)) {
      try { fs.unlinkSync(doc.backImagePath); } catch {}
    }

    await prisma.userDocument.delete({ where: { id } });

    return { success: true, message: 'Document deleted successfully.' };
  }

  /**
   * Admin approves or rejects a customer document
   */
  static async adminReviewDocument(
    id: string,
    status: DocumentStatus,
    rejectionReason: string | undefined,
    adminId: string,
    adminEmail?: string,
    req?: any
  ) {
    const doc = await prisma.userDocument.findUnique({ where: { id }, include: { user: true } });
    if (!doc) throw new AppError('Document not found.', 404);

    const updated = await prisma.userDocument.update({
      where: { id },
      data: {
        verificationStatus: status,
        rejectionReason: status === DocumentStatus.REJECTED ? rejectionReason : null,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: doc.userId,
        title: status === DocumentStatus.VERIFIED ? 'Driving License Verified!' : 'Document Verification Update',
        message:
          status === DocumentStatus.VERIFIED
            ? 'Your driving license has been approved by DriveEase verification team.'
            : `Your driving license could not be approved: ${rejectionReason || 'Please re-upload a clear copy.'}`,
        type: status === DocumentStatus.VERIFIED ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      },
    });

    // Audit log
    await AuditService.log({
      adminId,
      adminEmail,
      action: 'REVIEW_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: id,
      details: {
        targetUserId: doc.userId,
        status,
        rejectionReason,
      },
      req,
    });

    return this.sanitizeDocument(updated);
  }

  /**
   * Strips local disk file paths from client response
   */
  private static sanitizeDocument(d: any) {
    return {
      id: d.id,
      userId: d.userId,
      documentType: d.documentType,
      documentNumber: d.documentNumber,
      expiryDate: d.expiryDate,
      hasFrontImage: Boolean(d.frontImagePath),
      frontOriginalName: d.frontOriginalName,
      hasBackImage: Boolean(d.backImagePath),
      backOriginalName: d.backOriginalName,
      verificationStatus: d.verificationStatus,
      rejectionReason: d.rejectionReason,
      verifiedAt: d.verifiedAt,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      // Secure endpoints to fetch private images
      frontUrl: d.frontImagePath ? `/api/v1/users/documents/${d.id}/file?side=front` : null,
      backUrl: d.backImagePath ? `/api/v1/users/documents/${d.id}/file?side=back` : null,
    };
  }
}
