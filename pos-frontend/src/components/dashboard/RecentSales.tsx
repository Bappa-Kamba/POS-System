import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface RecentSale {
  id: string;
  receiptNumber: string;
  createdAt: string;
  cashier: string;
  totalAmount: number;
  paymentStatus: string;
}

interface RecentSalesProps {
  sales: RecentSale[];
  onSaleClick?: (saleId: string) => void;
}

export const RecentSales: React.FC<RecentSalesProps> = ({ sales, onSaleClick }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'PARTIAL':
        return <Badge variant="warning">Partial</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Recent Sales
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
          No sales yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Recent Sales
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Receipt #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Cashier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {sales.map((sale) => (
              <tr
                key={sale.id}
                onClick={() => onSaleClick?.(sale.id)}
                className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                  onSaleClick ? 'cursor-pointer' : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {sale.receiptNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {formatDate(sale.createdAt, 'time')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {sale.cashier}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(sale.totalAmount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(sale.paymentStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

