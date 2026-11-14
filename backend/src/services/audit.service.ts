import { Request } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/db';

export interface AuditLogInput {
  adminId: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  req?: Request;
}

export class AuditService {
  /**
   * Logs an administrative action with sanitized details.
   */
  static async log(input: AuditLogInput) {
    try {
      const { adminId, adminEmail, action, entityType, entityId, details, req } = input;

      // Sanitize details to guarantee no secrets/passwords are recorded
      const sanitizedDetails = details ? this.sanitize(details) : undefined;

      const ipAddress = req
        ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null
        : null;
      const userAgent = req ? (req.headers['user-agent'] as string) || null : null;

      return await prisma.auditLog.create({
        data: {
          adminId,
          adminEmail,
          action,
          entityType,
          entityId,
          details: sanitizedDetails ? (sanitizedDetails as Prisma.InputJsonValue) : undefined,
          ipAddress: ipAddress ? String(ipAddress).slice(0, 100) : null,
          userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
        },
      });
    } catch (error) {
      console.error('Audit logging failed (non-blocking):', error);
      return null;
    }
  }

  /**
   * Retrieves paginated audit logs with optional filters.
   */
  static async getLogs(params: {
    page?: number;
    limit?: number;
    entityType?: string;
    action?: string;
    adminId?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (params.entityType) {
      where.entityType = params.entityType;
    }
    if (params.action) {
      where.action = params.action;
    }
    if (params.adminId) {
      where.adminId = params.adminId;
    }
    if (params.search) {
      where.OR = [
        { action: { contains: params.search, mode: 'insensitive' } },
        { adminEmail: { contains: params.search, mode: 'insensitive' } },
        { entityType: { contains: params.search, mode: 'insensitive' } },
        { entityId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Sanitizes objects by removing confidential keys
   */
  private static sanitize(obj: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'signature', 'cvv', 'cookie'];
    const cleaned: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        cleaned[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = this.sanitize(value);
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}
