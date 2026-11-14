import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt';
import { AppError } from '../utils/appError';
import { Role } from '@prisma/client';

export interface RegisterDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  drivingLicenseNumber?: string;
}

export class AuthService {
  static async register(data: RegisterDTO) {
    const email = data.email.toLowerCase().trim();

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    // Determine name fields
    let firstName = data.firstName?.trim() || '';
    let lastName = data.lastName?.trim() || '';
    let name = data.name?.trim() || '';

    if (!name && firstName) {
      name = `${firstName} ${lastName}`.trim();
    } else if (name && !firstName) {
      const parts = name.split(' ');
      firstName = parts[0] || 'Member';
      lastName = parts.slice(1).join(' ') || '';
    }

    if (!firstName) firstName = 'Member';

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        firstName,
        lastName,
        phone: data.phone || null,
        drivingLicenseNumber: data.drivingLicenseNumber || null,
        role: Role.CUSTOMER,
        isActive: true,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        drivingLicenseNumber: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    // Store hashed refresh token in database
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken };
  }

  static async login(emailInput: string, passwordInput: string) {
    const email = emailInput.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(passwordInput, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Check account status
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    // Store hashed refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name || `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      drivingLicenseNumber: user.drivingLicenseNumber,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return { user: sanitizedUser, accessToken, refreshToken };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
    return true;
  }

  static async refresh(token: string) {
    if (!token) {
      throw new AppError('Refresh token is required.', 401);
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
    }

    const tokenHash = hashToken(token);
    const existingToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    // Check token reuse
    if (!existingToken || existingToken.isRevoked) {
      // Invalidate all tokens for user on suspicious reuse
      if (existingToken?.userId) {
        await prisma.refreshToken.updateMany({
          where: { userId: existingToken.userId },
          data: { isRevoked: true },
        });
      }
      throw new AppError('Invalid or revoked refresh token. Please log in again.', 401);
    }

    if (new Date() > existingToken.expiresAt) {
      throw new AppError('Refresh token has expired. Please log in again.', 401);
    }

    // Revoke old token (rotation)
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { isRevoked: true },
    });

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('User account not found or deactivated.', 401);
    }

    // Issue new pair
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
    });

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name || `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      drivingLicenseNumber: user.drivingLicenseNumber,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizedUser,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        drivingLicenseNumber: true,
        role: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }
}
