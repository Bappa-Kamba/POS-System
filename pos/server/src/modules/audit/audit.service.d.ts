import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AuditAction } from '@prisma/client';
import { FindAllAuditLogsDto } from './dto';
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
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        action: AuditAction;
        entity: string;
        entityId?: string;
        oldValues?: string;
        newValues?: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    findAll(params: FindAllAuditLogsDto): Promise<{
        data: ({
            user: {
                username: string;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            action: import("@prisma/client").$Enums.AuditAction;
            entity: string;
            entityId: string | null;
            oldValues: string | null;
            newValues: string | null;
            ipAddress: string | null;
            userAgent: string | null;
            userId: string;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<AuditLogWithUser>;
    findByEntity(entity: string, entityId: string): Promise<({
        user: {
            username: string;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        action: import("@prisma/client").$Enums.AuditAction;
        entity: string;
        entityId: string | null;
        oldValues: string | null;
        newValues: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
    })[]>;
}
export {};
