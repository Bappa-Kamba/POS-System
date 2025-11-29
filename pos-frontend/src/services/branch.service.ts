import { api } from './api';
import type { ApiResponse, PaginatedApiResponse } from '../types/api';

export interface Branch {
  id: string;
  name: string;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxRate: number;
  currency: string;
  businessName?: string | null;
  businessAddress?: string | null;
  businessPhone?: string | null;
  receiptFooter?: string | null;
  cashbackCapital: number;
  cashbackServiceChargeRate: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    products: number;
    sales: number;
  };
}

export interface CreateBranchPayload {
  name: string;
  location?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxRate?: number;
  currency?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  receiptFooter?: string;
  cashbackCapital?: number;
  cashbackServiceChargeRate?: number;
}

export interface UpdateBranchPayload {
  name?: string;
  location?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxRate?: number;
  currency?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  receiptFooter?: string;
  cashbackCapital?: number;
  cashbackServiceChargeRate?: number;
}

export interface FindAllBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BranchStatistics {
  branch: Branch;
  statistics: {
    users: {
      total: number;
      active: number;
    };
    products: number;
    sales: {
      total: number;
      revenue: number;
    };
    sessions: {
      active: number;
    };
  };
}

export const branchService = {
  async getAll(params?: FindAllBranchesParams): Promise<PaginatedApiResponse<Branch>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('skip', String((params.page - 1) * (params.limit || 20)));
    if (params?.limit) queryParams.append('take', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get<PaginatedApiResponse<Branch>>(
      `/branches?${queryParams.toString()}`
    );
    return response.data;
  },

  async getOne(id: string): Promise<ApiResponse<Branch>> {
    const response = await api.get<ApiResponse<Branch>>(`/branches/${id}`);
    return response.data;
  },

  async getStatistics(id: string): Promise<ApiResponse<BranchStatistics>> {
    const response = await api.get<ApiResponse<BranchStatistics>>(`/branches/${id}/statistics`);
    return response.data;
  },

  async create(data: CreateBranchPayload): Promise<ApiResponse<Branch>> {
    const response = await api.post<ApiResponse<Branch>>('/branches', data);
    return response.data;
  },

  async update(id: string, data: UpdateBranchPayload): Promise<ApiResponse<Branch>> {
    const response = await api.put<ApiResponse<Branch>>(`/branches/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<Branch>> {
    const response = await api.delete<ApiResponse<Branch>>(`/branches/${id}`);
    return response.data;
  },
};
