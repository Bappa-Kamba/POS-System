import { useQuery } from '@tanstack/react-query';
import { auditService, type FindAllAuditLogsParams } from '../services/audit.service';

export const useAuditLogs = (params?: FindAllAuditLogsParams) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAll(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useAuditLog = (id: string) => {
  return useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditService.getOne(id),
    enabled: !!id,
  });
};

export const useAuditLogsByEntity = (entity: string, entityId: string) => {
  return useQuery({
    queryKey: ['audit-logs', entity, entityId],
    queryFn: () => auditService.getByEntity(entity, entityId),
    enabled: !!entity && !!entityId,
  });
};

