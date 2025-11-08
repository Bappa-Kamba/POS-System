import { api } from "./api";
import type { ApiResponse } from "../types/api";

export interface Variant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  lowStockThreshold: number;
  attributes?: string; // JSON string
  isActive: boolean;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface CreateVariantPayload {
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  lowStockThreshold?: number;
  attributes?: string;
  expiryDate?: string;
}

export interface UpdateVariantPayload extends Partial<CreateVariantPayload> {
  isActive?: boolean;
}

const variantService = {
  async getAll(productId: string): Promise<ApiResponse<Variant[]>> {
    const response = await api.get<ApiResponse<Variant[]>>(
      `/products/${productId}/variants`
    );
    return response.data;
  },

  async getOne(productId: string, variantId: string): Promise<ApiResponse<Variant>> {
    const response = await api.get<ApiResponse<Variant>>(
      `/products/${productId}/variants/${variantId}`
    );
    return response.data;
  },

  async create(
    productId: string,
    data: CreateVariantPayload
  ): Promise<ApiResponse<Variant>> {
    const response = await api.post<ApiResponse<Variant>>(
      `/products/${productId}/variants`,
      data
    );
    return response.data;
  },

  async update(
    productId: string,
    variantId: string,
    data: UpdateVariantPayload
  ): Promise<ApiResponse<Variant>> {
    const response = await api.patch<ApiResponse<Variant>>(
      `/products/${productId}/variants/${variantId}`,
      data
    );
    return response.data;
  },

  async delete(productId: string, variantId: string): Promise<ApiResponse<Variant>> {
    const response = await api.delete<ApiResponse<Variant>>(
      `/products/${productId}/variants/${variantId}`
    );
    return response.data;
  },

  async adjustStock(
    productId: string,
    variantId: string,
    data: {
      quantityChange: number;
      changeType: string;
      reason?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<Variant>> {
    const response = await api.post<ApiResponse<Variant>>(
      `/products/${productId}/variants/${variantId}/adjust-stock`,
      data
    );
    return response.data;
  },

  async getLowStock(branchId?: string): Promise<ApiResponse<Variant[]>> {
    const response = await api.get<ApiResponse<Variant[]>>("/variants/low-stock", {
      params: { branchId },
    });
    return response.data;
  },

  async getExpiring(
    days?: number,
    branchId?: string
  ): Promise<ApiResponse<Variant[]>> {
    const response = await api.get<ApiResponse<Variant[]>>("/variants/expiring", {
      params: { days, branchId },
    });
    return response.data;
  },
};

export default variantService;

