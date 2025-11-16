import { api } from './api';
import type { ApiResponse, PaginatedApiResponse } from '../types/api';

export enum InventoryChangeType {
  RESTOCK = 'RESTOCK',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  EXPIRY = 'EXPIRY',
  DAMAGE = 'DAMAGE',
  RETURN = 'RETURN',
}

export interface AdjustStockPayload {
  productId: string;
  variantId?: string;
  quantityChange: number;
  changeType: InventoryChangeType;
  reason?: string;
  notes?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  variantId?: string;
  changeType: InventoryChangeType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  notes?: string;
  saleId?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  productId?: string;
  productName?: string;
  category: string;
  quantityInStock: number;
  lowStockThreshold: number;
  unitType: string;
  isVariant: boolean;
}

export interface ExpiringItem {
  id: string;
  name: string;
  sku: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface AllInventory {
  products: InventoryItem[];
  variants: InventoryItem[];
}

const inventoryService = {
  async adjustStock(
    payload: AdjustStockPayload
  ): Promise<ApiResponse<InventoryLog>> {
    const response = await api.post<ApiResponse<InventoryLog>>(
      '/inventory/adjust-stock',
      payload
    );
    return response.data;
  },

  async getInventoryLogs(params?: {
    page?: number;
    limit?: number;
    productId?: string;
    variantId?: string;
    changeType?: InventoryChangeType;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedApiResponse<InventoryLog>> {
    const response = await api.get<PaginatedApiResponse<InventoryLog>>(
      '/inventory/logs',
      { params }
    );
    return response.data;
  },

  async getAllInventory(): Promise<ApiResponse<AllInventory>> {
    const response = await api.get<ApiResponse<AllInventory>>('/inventory/all');
    return response.data;
  },

  async getExpiringItems(days?: number): Promise<ApiResponse<ExpiringItem[]>> {
    const response = await api.get<ApiResponse<ExpiringItem[]>>(
      '/inventory/expiring',
      { params: days ? { days: days.toString() } : undefined }
    );
    return response.data;
  },
};

export default inventoryService;

