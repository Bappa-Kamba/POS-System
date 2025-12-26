import { AuditAction } from '@prisma/client';
export declare class FindAllAuditLogsDto {
    skip?: number;
    take?: number;
    userId?: string;
    action?: AuditAction;
    entity?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
}
