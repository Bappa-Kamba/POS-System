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

export interface SalesReportParams {
  startDate: string;
  endDate: string;
  cashierId?: string;
  category?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface SalesReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    profitMargin: number;
  };
  breakdown: Array<{
    date: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
  }>;
  paymentBreakdown: Array<{
    method: string;
    amount: number;
  }>;
  salesByCashier: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  transactions: Array<{
    id: string;
    receiptNumber: string;
    date: string;
    cashier: string;
    itemsCount: number;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paymentStatus: string;
  }>;
}

export interface ProfitLossReportParams {
  startDate: string;
  endDate: string;
}

export interface ProfitLossReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    sales: number;
    total: number;
  };
  costs: {
    costOfGoodsSold: number;
    expenses: number;
    total: number;
  };
  profit: {
    gross: number;
    net: number;
    grossMargin: number;
    netMargin: number;
  };
  expenseBreakdown: Array<{
    category: string;
    amount: number;
  }>;
}

export interface ExportReportParams {
  reportType: 'sales' | 'profit-loss' | 'inventory' | 'expenses';
  format: 'pdf' | 'excel';
  startDate: string;
  endDate: string;
  filters?: Record<string, any>;
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

  async getSalesReport(
    params: SalesReportParams,
  ): Promise<ApiResponse<SalesReport>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.cashierId) queryParams.append('cashierId', params.cashierId);
    if (params.category) queryParams.append('category', params.category);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const response = await api.get<ApiResponse<SalesReport>>(
      `/reports/sales?${queryParams.toString()}`,
    );
    return response.data;
  },

  async getProfitLossReport(
    params: ProfitLossReportParams,
  ): Promise<ApiResponse<ProfitLossReport>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);

    const response = await api.get<ApiResponse<ProfitLossReport>>(
      `/reports/profit-loss?${queryParams.toString()}`,
    );
    return response.data;
  },

  async exportReport(params: ExportReportParams): Promise<Blob> {
    const response = await api.post('/reports/export', params, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default reportService;

