import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSalesReport } from '../../hooks/useReports';
import { StatCard } from '../dashboard/StatCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CashbackReportViewProps {
  startDate: string;
  endDate: string;
}

export const CashbackReportView: React.FC<CashbackReportViewProps> = ({
  startDate,
  endDate,
}) => {
  const navigate = useNavigate();
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const { data: report, isLoading, error } = useSalesReport(
    { startDate, endDate, groupBy, transactionType: 'CASHBACK' as any },
    !!startDate && !!endDate,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">
          Failed to load cashback report. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={report.summary.cashback.totalTransactions.toString()}
          icon={<ShoppingCart className="w-6 h-6 text-primary-600" />}
          subtitle={`${formatDate(report.period.start)} - ${formatDate(report.period.end)}`}
        />

        <div
          onClick={() => navigate('/settings', {})}
          className="cursor-pointer"
        >
          <StatCard
            title="Available Capital"
            value={formatCurrency(report.availableCapital || 0)}
            icon={<DollarSign className="w-6 h-6 text-primary-600" />}
            subtitle="Current cashback balance"
        />
        </div>
        <StatCard
          title="Total Amount Given"
          value={formatCurrency(report.summary.cashback.totalGiven)}
          icon={<DollarSign className="w-6 h-6 text-primary-600" />}
          subtitle="Cash given to customers"
        />
        <StatCard
          title="Total Service Charge (Profit)"
          value={formatCurrency(report.summary.cashback.serviceChargeEarned)}
          icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
          subtitle="Revenue from service charges"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Service Charge Trend */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
            Service Charge Trend
          </h3>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: unknown) => formatCurrency(value as number)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                name="Service Charge"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Cashback History
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount Given
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Service Charge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {report.transactions.slice(0, 20).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {transaction.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDate(transaction.date, 'short')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {transaction.cashier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(transaction.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(transaction.serviceCharge || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(transaction.totalAmount + (transaction.serviceCharge || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {transaction.paymentStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
