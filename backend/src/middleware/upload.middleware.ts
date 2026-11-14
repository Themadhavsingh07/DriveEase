import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { AppError } from '../utils/appError';

const storageDir = path.resolve(__dirname, '../../storage/documents');

// Ensure storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storageDir);
  },
  filename: (_req, file, cb) => {
    // Generate secure randomized UUID filename with extension
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomUUID();
    cb(null, `${randomName}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only JPEG, PNG, WEBP, and PDF documents are permitted.',
        400
      )
    );
  }
};

export const documentUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export const documentUploadFields = documentUpload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
]);
