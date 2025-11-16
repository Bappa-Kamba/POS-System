import { api } from './api';
import type { PaginatedApiResponse } from '../types/api';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'EXPORT'
  | 'BACKUP'
  | 'RESTORE';

export interface AuditLog {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  action: AuditAction;
  entity: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface FindAllAuditLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}

export const auditService = {
  async getAll(
    params?: FindAllAuditLogsParams,
  ): Promise<PaginatedApiResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    if (params?.page)
      queryParams.append('skip', String((params.page - 1) * (params.limit || 50)));
    if (params?.limit) queryParams.append('take', String(params.limit));
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.entity) queryParams.append('entity', params.entity);
    if (params?.entityId) queryParams.append('entityId', params.entityId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get<PaginatedApiResponse<AuditLog>>(
      `/audit-logs?${queryParams.toString()}`,
    );
    return response.data;
  },

  async getOne(id: string): Promise<AuditLog> {
    const response = await api.get<{ success: boolean; data: AuditLog }>(
      `/audit-logs/${id}`,
    );
    return response.data.data;
  },

  async getByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    const response = await api.get<{ success: boolean; data: AuditLog[] }>(
      `/audit-logs/entity/${entity}/${entityId}`,
    );
    return response.data.data;
  },
};

