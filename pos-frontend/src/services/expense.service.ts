import { api } from './api';
import type { PaginatedApiResponse } from '../types/api';

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  createdById?: string;
  createdBy?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  title: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  branchId: string;
}

export interface UpdateExpenseData {
  title?: string;
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  branchId?: string;
}

export interface FindAllExpensesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
}

export const expenseService = {
  async getAll(
    params?: FindAllExpensesParams,
  ): Promise<PaginatedApiResponse<Expense>> {
    const queryParams = new URLSearchParams();
    if (params?.page)
      queryParams.append('skip', String((params.page - 1) * (params.limit || 20)));
    if (params?.limit) queryParams.append('take', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.branchId) queryParams.append('branchId', params.branchId);

    const response = await api.get<PaginatedApiResponse<Expense>>(
      `/expenses?${queryParams.toString()}`,
    );
    return response.data;
  },

  async getOne(id: string): Promise<Expense> {
    const response = await api.get<{ success: boolean; data: Expense }>(
      `/expenses/${id}`,
    );
    return response.data.data;
  },

  async create(data: CreateExpenseData): Promise<Expense> {
    const response = await api.post<{ success: boolean; data: Expense }>(
      '/expenses',
      data,
    );
    return response.data.data;
  },

  async update(id: string, data: UpdateExpenseData): Promise<Expense> {
    const response = await api.put<{ success: boolean; data: Expense }>(
      `/expenses/${id}`,
      data,
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<{ success: boolean; data: string[] }>(
      '/expenses/categories',
    );
    return response.data.data;
  },
};

