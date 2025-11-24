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
import { formatCurrency } from '../../utils/formatters';

interface SalesChartProps {
  data: Array<{
    date: string;
    label: string;
    revenue: number;
    profit: number;
    salesCount: number;
  }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'profit'>('revenue');

  const chartData = data.map((item) => ({
    date: item.label,
    revenue: item.revenue,
    profit: item.profit,
    salesCount: item.salesCount,
  }));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Sales Trend (Last 7 Days)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
              viewMode === 'revenue'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setViewMode('profit')}
            className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
              viewMode === 'profit'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            Profit
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          {viewMode === 'revenue' ? (
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0284c7"
              strokeWidth={2}
              name="Revenue"
              dot={{ fill: '#0284c7', r: 4 }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              name="Profit"
              dot={{ fill: '#10b981', r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
