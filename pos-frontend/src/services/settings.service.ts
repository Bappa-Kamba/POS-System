import { api } from './api';

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
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBranchData {
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
}

export const settingsService = {
  async getBranch(): Promise<Branch> {
    const response = await api.get<{ success: true; data: Branch }>(
      '/settings/branch',
    );
    return response.data.data;
  },

  async updateBranch(data: UpdateBranchData): Promise<Branch> {
    const response = await api.patch<{ success: true; data: Branch }>(
      '/settings/branch',
      data,
    );
    return response.data.data;
  },
};

