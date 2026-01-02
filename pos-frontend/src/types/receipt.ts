/**
 * Resolved Receipt Configuration
 * Matches the backend DTO
 */
export interface ResolvedReceiptConfig {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  receiptFooter: string;
  branchName: string;
  currency: string;
}

/**
 * Standard Order Interface for Printing
 * (Subset of Sale, simplifying for print)
 */
export interface PrintOrderData {
  receiptNumber: string;
  date: string;
  cashier: string;
  transactionType: 'PURCHASE' | 'CASHBACK';
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    taxAmount?: number;
    subtotal: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payments: Array<{
    method: string;
    amount: number;
    reference?: string;
  }>;
  change: number;
}
