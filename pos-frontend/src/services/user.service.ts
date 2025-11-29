import { api } from './api';
import type { ApiResponse, PaginatedApiResponse } from '../types/api';

export interface User {
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: "ADMIN" | "CASHIER";
  isActive: boolean;
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  assignedSubdivisionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "CASHIER";
  branchId: string;
  isActive?: boolean;
  assignedSubdivisionId?: string | null;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: "ADMIN" | "CASHIER";
  branchId?: string;
  isActive?: boolean;
  assignedSubdivisionId?: string | null;
}

export interface FindAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'ADMIN' | 'CASHIER';
  isActive?: boolean;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
}

export const userService = {
  async getAll(params?: FindAllUsersParams): Promise<PaginatedApiResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('skip', String((params.page - 1) * (params.limit || 20)));
    if (params?.limit) queryParams.append('take', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    // Handle isActive parameter
    // When true: send 'true' (active users) - this is the default
    // When false: send 'false' (inactive users)
    // When undefined: send 'all' (all users - explicitly requested)
    if (params?.isActive === true) {
      queryParams.append('isActive', 'true');
    } else if (params?.isActive === false) {
      queryParams.append('isActive', 'false');
    } else {
      // When undefined, send 'all' to explicitly request all users
      queryParams.append('isActive', 'all');
    }
    if (params?.branchId) queryParams.append('branchId', params.branchId);

    const response = await api.get<PaginatedApiResponse<User>>(
      `/users?${queryParams.toString()}`
    );
    return response.data;
  },

  async getOne(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserPayload): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserPayload): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<User>> {
    const response = await api.delete<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // Note: Branches endpoint not yet implemented
  // For now, users will be created with the current user's branchId
  // In a multi-branch system, you'd fetch branches from /branches endpoint
};

