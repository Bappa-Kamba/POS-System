import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SessionSummary {
  totalSales: number;
  totalRevenue: number;
  payments: {
    cash: { count: number; amount: number };
    transfer: { count: number; amount: number };
    card: { count: number; amount: number };
    pos: { count: number; amount: number };
  };
  cashback: {
    count: number;
    totalAmount: number;
    totalServiceCharge: number;
    totalReceived: number;
  };
  expenses: {
    count: number;
    totalAmount: number;
    byCategory: Array<{ category: string; amount: number }>;
  };
  cashFlow: {
    openingBalance: number;
    cashSales: number;
    cashbackPaid: number;
    expensesPaid: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
    variancePercentage: number;
    isBalanced: boolean;
  };
  durationMinutes: number | null;
  hourlyBreakdown: Array<{
    hour: string;
    salesCount: number;
    revenue: number;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    categoryName: string;
    itemsSold: number;
    revenue: number;
  }>;
}

interface SessionSummaryReportProps {
  sessionId: string;
}

export const SessionSummaryReport: React.FC<SessionSummaryReportProps> = ({ sessionId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: async () => {
      const response = await api.get<{ data: { summary: SessionSummary } }>(`/sessions/${sessionId}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="text-center p-8 text-gray-500">
        No session data available
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Sales</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{summary.totalSales}</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Revenue</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {formatCurrency(summary.totalRevenue)}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Duration</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            {summary.durationMinutes ? `${summary.durationMinutes} min` : 'Active'}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Expenses</div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
            {formatCurrency(summary.expenses.totalAmount)}
          </div>
        </Card>
      </div>

      {/* Cash Reconciliation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Cash Reconciliation
          </h3>
          {summary.cashFlow.isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Opening Balance</span>
            <span className="font-medium">{formatCurrency(summary.cashFlow.openingBalance)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">+ Cash Sales</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(summary.cashFlow.cashSales)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">- Cashback Paid</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(summary.cashFlow.cashbackPaid)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">- Expenses Paid</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(summary.cashFlow.expensesPaid)}
            </span>
          </div>

          <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
            <div className="flex justify-between font-semibold">
              <span>Expected Cash</span>
              <span>{formatCurrency(summary.cashFlow.expectedCash)}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Actual Cash (Counted)</span>
            <span className="font-medium">{formatCurrency(summary.cashFlow.actualCash)}</span>
          </div>

          <div className={`flex justify-between font-bold text-lg pt-2 border-t ${
            summary.cashFlow.variance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>Variance</span>
            <span>
              {summary.cashFlow.variance >= 0 ? '+' : ''}
              {formatCurrency(summary.cashFlow.variance)}
              <span className="text-xs ml-2 font-normal">
                ({summary.cashFlow.variancePercentage.toFixed(2)}%)
              </span>
            </span>
          </div>

          {Math.abs(summary.cashFlow.variance) > 100 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Significant variance detected.</strong> Please verify cash count and review transactions.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Payment Methods
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(summary.payments).map(([method, data]) => (
            <div key={method} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                {method}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(data.amount)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.count} transaction{data.count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cashback Summary */}
      {summary.cashback.count > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Cashback Transactions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</div>
              <div className="text-2xl font-bold">{summary.cashback.count}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</div>
              <div className="text-2xl font-bold">{formatCurrency(summary.cashback.totalAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Service Charge Earned</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.cashback.totalServiceCharge)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Received</div>
              <div className="text-2xl font-bold">{formatCurrency(summary.cashback.totalReceived)}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Expenses */}
      {summary.expenses.count > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Expenses ({summary.expenses.count})
          </h3>
          <div className="space-y-2">
            {summary.expenses.byCategory.map((cat) => (
              <div key={cat.category} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.category}</span>
                <span className="font-semibold text-red-600">{formatCurrency(cat.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 dark:border-gray-600 font-bold">
              <span>Total Expenses</span>
              <span className="text-red-600">{formatCurrency(summary.expenses.totalAmount)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Top Products */}
      {summary.topProducts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Top Products
          </h3>
          <div className="space-y-2">
            {summary.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {product.quantity}
                  </div>
                </div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(product.revenue)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      {summary.categoryBreakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Sales by Category
          </h3>
          <div className="space-y-2">
            {summary.categoryBreakdown.map((cat, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {cat.categoryName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {cat.itemsSold} items
                  </div>
                </div>
                <div className="font-semibold text-blue-600">
                  {formatCurrency(cat.revenue)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};
