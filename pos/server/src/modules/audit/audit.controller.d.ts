import { AuditService } from './audit.service';
import { FindAllAuditLogsDto } from './dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(findAllAuditLogsDto: FindAllAuditLogsDto): Promise<{
        data: ({
            user: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
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
        success: boolean;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
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
        };
    }>;
    findByEntity(entity: string, entityId: string): Promise<{
        success: boolean;
        data: ({
            user: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
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
    }>;
}
