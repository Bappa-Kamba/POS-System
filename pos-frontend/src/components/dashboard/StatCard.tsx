import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercentage } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  variant = 'default',
}) => {
  const getChangeColor = () => {
    if (change === undefined || change === 0) return 'text-neutral-500';
    return change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getChangeIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-4 h-4" />;
    }
    return change > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
    }
  };

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md ${getVariantStyles()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="font-medium">
                {change > 0 ? '+' : ''}
                {formatPercentage(Math.abs(change))} vs yesterday
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 rounded-lg bg-primary-100 dark:bg-primary-900/20 p-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

