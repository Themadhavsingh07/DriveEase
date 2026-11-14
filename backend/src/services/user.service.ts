import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { AppError } from '../utils/appError';

export class UserService {
  static async getProfile(userId: string) {
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
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User profile not found.', 404);
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      drivingLicenseNumber?: string;
    }
  ) {
    const updateData: Record<string, any> = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.phone !== undefined) updateData.phone = data.phone.trim();
    if (data.avatar !== undefined) updateData.avatar = data.avatar.trim();
    if (data.drivingLicenseNumber !== undefined) {
      updateData.drivingLicenseNumber = data.drivingLicenseNumber.trim();
    }

    // Keep name in sync if firstName/lastName supplied
    if (data.firstName && !data.name) {
      updateData.name = `${data.firstName} ${data.lastName || ''}`.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password entered is incorrect.', 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError('New password cannot be the same as your current password.', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens on password change for security
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return true;
  }

  // Admin user operations
  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.status === 'active') {
      where.isActive = true;
    } else if (params.status === 'inactive') {
      where.isActive = false;
    }

    if (params.role) {
      where.role = params.role.toUpperCase();
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          avatar: true,
          drivingLicenseNumber: true,
          createdAt: true,
          _count: {
            select: { bookings: true },
          },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        drivingLicenseNumber: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            bookingNumber: true,
            totalAmount: true,
            bookingStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  static async updateUserStatus(
    targetUserId: string,
    isActive: boolean,
    requestingAdminId: string
  ) {
    if (targetUserId === requestingAdminId && !isActive) {
      throw new AppError('You cannot deactivate your own administrative account.', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new AppError('Target user not found.', 404);
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // If deactivating, revoke all sessions
    if (!isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId: targetUserId },
        data: { isRevoked: true },
      });
    }

    return updated;
  }
}
