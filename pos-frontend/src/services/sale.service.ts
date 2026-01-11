import { api } from './api';
import type { ApiResponse, PaginatedApiResponse } from '../types/api';
import type { ResolvedReceiptConfig } from '../types/receipt';

export interface SaleItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  method: 'CASH' | 'CARD' | 'TRANSFER';
  amount: number;
  reference?: string;
  notes?: string;
  isSettlement?: boolean;
}

export interface CreateSalePayload {
  items?: SaleItem[];
  payments: Payment[];
  transactionType?: 'PURCHASE' | 'CASHBACK';
  cashbackAmount?: number;
  serviceCharge?: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  isCreditSale?: boolean;
  creditReference?: string;
}
export interface Sale {
  id: string;
  receiptNumber: string;
  cashierId: string;
  branchId: string;
  transactionType: 'PURCHASE' | 'CASHBACK';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  amountPaid: number;
  amountDue: number;
  changeGiven: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  isCreditSale: boolean;
  creditStatus?: 'OPEN' | 'SETTLED' | 'WRITTEN_OFF';
  creditReference?: string;
  items: SaleItemDetail[];
  payments: PaymentDetail[];
  cashier: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  branch: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SaleItemDetail {
  id: string;
  saleId: string;
  productId: string;
  variantId?: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface PaymentDetail {
  id: string;
  saleId: string;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  amount: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface ReceiptData {
  receipt: {
    business: {
      name: string;
      address: string;
      phone: string;
    };
    branch: string;
    receiptNumber: string;
    transactionType: 'PURCHASE' | 'CASHBACK';
    date: string;
    cashier: string;
    items: Array<{
      name: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      taxAmount: number;
      subtotal: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    payments: Array<{
      method: 'CASH' | 'CARD' | 'TRANSFER';
      amount: number;
      reference?: string;
    }>;
    change: number;
    footer: string;
    currency: string;
  };
  config: ResolvedReceiptConfig;
}

export interface FindAllSalesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  branchId?: string;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  transactionType?: 'PURCHASE' | 'CASHBACK';
  search?: string;
  creditStatus?: 'OPEN' | 'SETTLED' | 'WRITTEN_OFF';
  isCreditSale?: boolean;
}

export interface AddPaymentPayload {
  method: 'CASH' | 'CARD' | 'TRANSFER';
  amount: number;
  reference?: string;
  notes?: string;
  isSettlement?: boolean;
}

const saleService = {
  async create(data: CreateSalePayload): Promise<ApiResponse<Sale>> {
    const response = await api.post<ApiResponse<Sale>>('/sales', data);
    return response.data;
  },

  async getAll(
    params?: FindAllSalesParams
  ): Promise<PaginatedApiResponse<Sale>> {
    const response = await api.get<PaginatedApiResponse<Sale>>('/sales', {
      params,
    });
    return response.data;
  },

  async getOne(id: string): Promise<ApiResponse<Sale>> {
    const response = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data;
  },

  async getReceipt(id: string): Promise<ApiResponse<ReceiptData>> {
    const response = await api.get<ApiResponse<ReceiptData>>(
      `/sales/${id}/receipt`
    );
    return response.data;
  },

  async getDailySummary(date?: string): Promise<
    ApiResponse<{
      date: string;
      totalSales: number;
      totalRevenue: number;
      totalProfit: number;
      paymentBreakdown: {
        CASH: number;
        CARD: number;
        TRANSFER: number;
      };
    }>
  > {
    const response = await api.get<
      ApiResponse<{
        date: string;
        totalSales: number;
        totalRevenue: number;
        totalProfit: number;
        paymentBreakdown: {
          CASH: number;
          CARD: number;
          TRANSFER: number;
        };
      }>
    >('/sales/daily-summary', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  async addPayment(
    saleId: string,
    payment: AddPaymentPayload,
    isSettlement?: boolean
  ): Promise<ApiResponse<Sale>> {
    const response = await api.post<ApiResponse<Sale>>(
      `/sales/${saleId}/payments`,
      {
        ...payment,
        isSettlement,
      }
    );
    return response.data;
  },
};

export default saleService;

