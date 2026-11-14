import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/config/db';
import { DocumentService } from '../src/services/document.service';
import { DocumentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

describe('🪪 Phase 6: Driving License Upload & Verification Service Tests', () => {
  let customerUser: any;
  let adminUser: any;
  let unauthorizedCustomer: any;
  let sampleDoc: any;
  const mockFrontPath = path.join(__dirname, '../storage/documents/test_front.jpg');
  const mockBackPath = path.join(__dirname, '../storage/documents/test_back.jpg');

  beforeAll(async () => {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    customerUser = await prisma.user.create({
      data: {
        email: `doc_cust_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Ananya',
        lastName: 'Verma',
        phone: '+919876500003',
        role: 'CUSTOMER',
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: `doc_admin_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Master',
        lastName: 'Admin',
        phone: '+919876500004',
        role: 'ADMIN',
      },
    });

    unauthorizedCustomer = await prisma.user.create({
      data: {
        email: `doc_intruder_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Intruder',
        lastName: 'User',
        phone: '+919876500005',
        role: 'CUSTOMER',
      },
    });

    // Create dummy files on disk in storage/documents
    fs.mkdirSync(path.dirname(mockFrontPath), { recursive: true });
    fs.writeFileSync(mockFrontPath, 'FAKE_JPEG_FRONT_DATA');
    fs.writeFileSync(mockBackPath, 'FAKE_JPEG_BACK_DATA');
  });

  afterAll(async () => {
    // Clean up files
    if (fs.existsSync(mockFrontPath)) fs.unlinkSync(mockFrontPath);
    if (fs.existsSync(mockBackPath)) fs.unlinkSync(mockBackPath);

    // Clean up database
    await prisma.notification.deleteMany({
      where: { userId: { in: [customerUser?.id, unauthorizedCustomer?.id] } },
    });
    await prisma.auditLog.deleteMany({
      where: { adminId: adminUser?.id },
    });
    await prisma.userDocument.deleteMany({
      where: { userId: customerUser?.id },
    });
    if (customerUser) await prisma.user.delete({ where: { id: customerUser.id } }).catch(() => {});
    if (adminUser) await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    if (unauthorizedCustomer) await prisma.user.delete({ where: { id: unauthorizedCustomer.id } }).catch(() => {});
  });

  it('1. Records driving license document metadata with private storage paths', async () => {
    sampleDoc = await DocumentService.uploadDocument({
      userId: customerUser.id,
      documentType: 'DRIVING_LICENSE',
      documentNumber: 'DL-04-2024-9988776',
      expiryDate: new Date('2032-12-31'),
      frontFile: {
        filename: 'test_front.jpg',
        path: mockFrontPath,
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'my_license_front.jpg',
      } as any,
      backFile: {
        filename: 'test_back.jpg',
        path: mockBackPath,
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'my_license_back.jpg',
      } as any,
    });

    expect(sampleDoc.id).toBeDefined();
    expect(sampleDoc.verificationStatus).toBe(DocumentStatus.PENDING);
    expect(sampleDoc.documentNumber).toBe('DL-04-2024-9988776');

    // Verify user profile license number updated
    const updatedUser = await prisma.user.findUnique({ where: { id: customerUser.id } });
    expect(updatedUser?.drivingLicenseNumber).toBe('DL-04-2024-9988776');
  });

  it('2. Authorizes document streaming for owner and admin, while rejecting other users', async () => {
    // Owner can get file stream path
    const ownerAccess = await DocumentService.streamDocumentFile(sampleDoc.id, 'front', customerUser.id, false);
    expect(ownerAccess.filePath).toBe(mockFrontPath);
    expect(ownerAccess.mimeType).toBe('image/jpeg');

    // Admin can get file stream path
    const adminAccess = await DocumentService.streamDocumentFile(sampleDoc.id, 'back', adminUser.id, true);
    expect(adminAccess.filePath).toBe(mockBackPath);

    // Another customer is rejected with 403 Forbidden
    await expect(
      DocumentService.streamDocumentFile(sampleDoc.id, 'front', unauthorizedCustomer.id, false)
    ).rejects.toThrow('Forbidden: Access denied to private document');
  });

  it('3. Admin can approve or reject driving license with audit logging and notification', async () => {
    // Admin rejects with reason
    const rejected = await DocumentService.adminReviewDocument(
      sampleDoc.id,
      DocumentStatus.REJECTED,
      'Image is blurry; please re-upload clear photo of front license.',
      adminUser.id,
      adminUser.email,
      '127.0.0.1',
      'Vitest-Agent'
    );

    expect(rejected.verificationStatus).toBe(DocumentStatus.REJECTED);
    expect(rejected.rejectionReason).toContain('blurry');

    // Verify customer received notification
    const notifications = await prisma.notification.findMany({
      where: { userId: customerUser.id },
    });
    expect(notifications.some((n) => n.type === 'DOCUMENT_REJECTED')).toBe(true);

    // Admin verifies document
    const verified = await DocumentService.adminReviewDocument(
      sampleDoc.id,
      DocumentStatus.VERIFIED,
      undefined,
      adminUser.id,
      adminUser.email,
      '127.0.0.1',
      'Vitest-Agent'
    );
    expect(verified.verificationStatus).toBe(DocumentStatus.VERIFIED);
  });

  it('4. Deletes driving license document and cleans up storage files', async () => {
    // Create temporary document to test deletion
    const tempFront = path.join(__dirname, '../storage/documents/temp_front.jpg');
    fs.writeFileSync(tempFront, 'TEMP_FRONT');

    const tempDoc = await DocumentService.uploadDocument({
      userId: customerUser.id,
      documentType: 'DRIVING_LICENSE',
      frontFile: {
        filename: 'temp_front.jpg',
        path: tempFront,
        mimetype: 'image/jpeg',
        size: 500,
        originalname: 'temp.jpg',
      } as any,
    });

    expect(fs.existsSync(tempFront)).toBe(true);

    // Delete document
    const deleted = await DocumentService.deleteDocument(tempDoc.id, customerUser.id, false);
    expect(deleted.success).toBe(true);

    // Verify database record deleted
    const checkDb = await prisma.userDocument.findUnique({ where: { id: tempDoc.id } });
    expect(checkDb).toBeNull();

    // Verify disk file was deleted
    expect(fs.existsSync(tempFront)).toBe(false);
  });
});
