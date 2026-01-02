import { api } from './api';
import type { ResolvedReceiptConfig } from '../types/receipt';

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
  cashbackSubdivisionId?: string | null;
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
  cashbackCapital?: number;
  cashbackServiceChargeRate?: number;
  cashbackSubdivisionId?: string;
}

export interface AdjustCashbackCapitalData {
  amount: number; // Positive to add, negative to subtract
  notes?: string;
}

export const settingsService = {
  async getReceiptConfig(subdivisionId?: string): Promise<ResolvedReceiptConfig> {
    const params = subdivisionId ? { subdivisionId } : {};
    const response = await api.get<{ success: true; data: ResolvedReceiptConfig }>(
      '/settings/receipt-config',
      { params },
    );
    return response.data.data;
  },

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

  async adjustCashbackCapital(
    data: AdjustCashbackCapitalData,
  ): Promise<{
    previousCapital: number;
    adjustment: number;
    newCapital: number;
    notes?: string;
  }> {
    const response = await api.post<{
      success: true;
      data: {
        previousCapital: number;
        adjustment: number;
        newCapital: number;
        notes?: string;
      };
    }>('/settings/cashback-capital/adjust', data);
    return response.data.data;
  },
};

