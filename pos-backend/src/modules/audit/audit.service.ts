import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AuditAction } from '@prisma/client';
import { FindAllAuditLogsDto } from './dto';
import { startOfDay, endOfDay } from 'date-fns';

type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        firstName: true;
        lastName: true;
        role: true;
      };
    };
  };
}>;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an audit log entry
   */
  async create(data: {
    userId: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    oldValues?: string;
    newValues?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValues: data.oldValues,
          newValues: data.newValues,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error}`);
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }

  /**
   * Get all audit logs with filtering and pagination
   */
  async findAll(params: FindAllAuditLogsDto) {
    const {
      skip = 0,
      take = 50,
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
    } = params;

    const where: Prisma.AuditLogWhereInput = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(entity && { entity }),
      ...(entityId && { entityId }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startOfDay(new Date(startDate)),
            lte: endOfDay(new Date(endDate)),
          },
        }),
      ...(startDate &&
        !endDate && {
          createdAt: {
            gte: startOfDay(new Date(startDate)),
          },
        }),
      ...(!startDate &&
        endDate && {
          createdAt: {
            lte: endOfDay(new Date(endDate)),
          },
        }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get single audit log by ID
   */
  async findOne(id: string): Promise<AuditLogWithUser> {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  /**
   * Get audit logs for a specific entity
   */
  async findByEntity(entity: string, entityId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }
}

