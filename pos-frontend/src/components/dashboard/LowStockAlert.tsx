import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

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

interface LowStockAlertProps {
  items: LowStockItem[];
  onRestock?: (itemId: string, isVariant: boolean) => void;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ items, onRestock }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Low Stock Alerts
          </h3>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">
          All products are well stocked! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Low Stock Alerts ({items.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Threshold
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {items.slice(0, 10).map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </span>
                    {item.isVariant && (
                      <Badge variant="neutral" size="sm">
                        Variant
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {item.sku}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge
                    variant={item.currentStock === 0 ? 'error' : 'warning'}
                  >
                    {item.currentStock} {item.unitType === 'WEIGHT' ? 'kg' : 'units'}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {item.threshold} {item.unitType === 'WEIGHT' ? 'kg' : 'units'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  {onRestock && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRestock(item.id, item.isVariant)}
                    >
                      Restock
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 10 && (
        <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Showing 10 of {items.length} low stock items
        </div>
      )}
    </div>
  );
};

