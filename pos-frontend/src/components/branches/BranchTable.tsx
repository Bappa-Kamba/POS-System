import React from 'react';
import { Edit, Trash2, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Branch } from '../../services/branch.service';

interface BranchTableProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  isLoading?: boolean;
}

export const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
        <p className="text-neutral-500 dark:text-neutral-400">No branches found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Settings
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Statistics
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
          {branches.map((branch) => (
            <tr
              key={branch.id}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {branch.name}
                    </div>
                    {branch.location && (
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {branch.location}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {branch.phone && (
                    <div className="text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      {branch.phone}
                    </div>
                  )}
                  {branch.email && (
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      {branch.email}
                    </div>
                  )}
                  {!branch.phone && !branch.email && (
                    <div className="text-sm text-neutral-400">-</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">
                    Tax: {(branch.taxRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Currency: {branch.currency}
                  </div>
                  {branch.cashbackCapital > 0 && (
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Cashback: {formatCurrency(branch.cashbackCapital)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">
                    {branch._count?.users || 0} users
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {branch._count?.products || 0} products
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {branch._count?.sales || 0} sales
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(branch.createdAt, 'short')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(branch)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(branch)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
