import React from 'react';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { InventoryChangeType } from '../../services/inventory.service';
import type { InventoryLog } from '../../services/inventory.service';

interface InventoryLogsTableProps {
  logs: InventoryLog[];
  isLoading?: boolean;
}

const getChangeTypeBadge = (changeType: InventoryChangeType) => {
  const variants = {
    [InventoryChangeType.RESTOCK]: 'success',
    [InventoryChangeType.SALE]: 'info',
    [InventoryChangeType.ADJUSTMENT]: 'neutral',
    [InventoryChangeType.EXPIRY]: 'warning',
    [InventoryChangeType.DAMAGE]: 'error',
    [InventoryChangeType.RETURN]: 'info',
  } as const;

  return (
    <Badge variant={variants[changeType] || 'neutral'}>
      {changeType}
    </Badge>
  );
};

export const InventoryLogsTable: React.FC<InventoryLogsTableProps> = ({
  logs,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p>No inventory logs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Date/Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Change
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Previous
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
              New
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(log.createdAt, 'datetime')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {log.product.name}
                </div>
                {log.variant && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Variant: {log.variant.name}
                  </div>
                )}
                <div className="text-xs text-neutral-400 dark:text-neutral-500">
                  SKU: {log.variant?.sku || log.product.sku}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getChangeTypeBadge(log.changeType)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <span
                  className={`font-medium ${
                    log.quantityChange > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {log.quantityChange > 0 ? '+' : ''}
                  {log.quantityChange}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-900 dark:text-neutral-100">
                {log.previousQuantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {log.newQuantity}
              </td>
              <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                {log.reason || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

