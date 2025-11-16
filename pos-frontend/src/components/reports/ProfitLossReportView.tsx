import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useProfitLossReport } from '../../hooks/useReports';
import { StatCard } from '../dashboard/StatCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

interface ProfitLossReportViewProps {
  startDate: string;
  endDate: string;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ProfitLossReportView: React.FC<ProfitLossReportViewProps> = ({
  startDate,
  endDate,
}) => {
  const { data: report, isLoading, error } = useProfitLossReport(
    { startDate, endDate },
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
          Failed to load profit & loss report. Please try again.
        </p>
      </div>
    );
  }

  const isProfit = report.profit.net >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(report.revenue.total)}
          icon={<DollarSign className="w-6 h-6 text-primary-600" />}
          subtitle="Sales revenue"
        />
        <StatCard
          title="Cost of Goods Sold"
          value={formatCurrency(report.costs.costOfGoodsSold)}
          icon={<Package className="w-6 h-6 text-primary-600" />}
          subtitle="Product costs"
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(report.profit.gross)}
          icon={<TrendingUp className="w-6 h-6 text-primary-600" />}
          subtitle={`Margin: ${formatPercentage(report.profit.grossMargin)}`}
        />
        <div
          className={`rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 ${
            isProfit ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Net Profit
              </p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(report.profit.net)}
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Margin: {formatPercentage(report.profit.netMargin)}
              </p>
            </div>
            <div className="ml-4 rounded-lg bg-primary-100 dark:bg-primary-900/20 p-3">
              {isProfit ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* P&L Breakdown Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Profit & Loss Statement
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              <tr>
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                  Revenue
                </td>
                <td className="px-4 py-3 text-right text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(report.revenue.sales)}
                </td>
                <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                  100%
                </td>
              </tr>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50">
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  Less: Cost of Goods Sold
                </td>
                <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(report.costs.costOfGoodsSold)})
                </td>
                <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                  {report.revenue.total > 0
                    ? formatPercentage(
                        (report.costs.costOfGoodsSold / report.revenue.total) * 100,
                      )
                    : '0%'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                  Gross Profit
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(report.profit.gross)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">
                  {formatPercentage(report.profit.grossMargin)}
                </td>
              </tr>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50">
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  Less: Operating Expenses
                </td>
                <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                  ({formatCurrency(report.costs.expenses)})
                </td>
                <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                  {report.revenue.total > 0
                    ? formatPercentage(
                        (report.costs.expenses / report.revenue.total) * 100,
                      )
                    : '0%'}
                </td>
              </tr>
              <tr className="border-t-2 border-neutral-300 dark:border-neutral-600">
                <td className="px-4 py-3 font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  Net Profit
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold text-lg ${
                    isProfit
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatCurrency(report.profit.net)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-bold text-lg ${
                    isProfit
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatPercentage(report.profit.netMargin)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Breakdown */}
      {report.expenseBreakdown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Expense Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report.expenseBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.category}: ${formatCurrency(entry.amount)}`}
                >
                  {report.expenseBreakdown.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Expense Details
            </h3>
            <div className="space-y-2">
              {report.expenseBreakdown.map((expense, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {expense.category}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

