import { api } from './api';
import type { ApiResponse } from '../types/api';

export interface DashboardStats {
  salesOverview: {
    todaySalesCount: number;
    todayRevenue: number;
    revenueChange: number;
    salesCountChange: number;
  };
  profit: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  expenses: {
    monthTotal: number;
    topCategory: {
      category: string;
      amount: number;
    } | null;
  };
  chartData: Array<{
    date: string;
    label: string;
    revenue: number;
    profit: number;
    salesCount: number;
  }>;
  recentSales: Array<{
    id: string;
    receiptNumber: string;
    createdAt: string;
    cashier: string;
    totalAmount: number;
    paymentStatus: string;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  threshold: number;
  unitType: string;
  isVariant: boolean;
  productId?: string;
}

const reportService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get<ApiResponse<DashboardStats>>('/reports/dashboard');
    return response.data;
  },

  async getLowStockItems(): Promise<ApiResponse<LowStockItem[]>> {
    const response = await api.get<ApiResponse<LowStockItem[]>>('/reports/low-stock');
    return response.data;
  },
};

export default reportService;

