import React from 'react';
import { Edit2, Power, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import type { Subdivision } from '../../types/subdivision';
import { SubdivisionStatus } from '../../types/subdivision';

interface SubdivisionTableProps {
  subdivisions: Subdivision[];
  onEdit: (subdivision: Subdivision) => void;
  onToggleStatus: (subdivision: Subdivision) => void;
  isLoading?: boolean;
}

export const SubdivisionTable: React.FC<SubdivisionTableProps> = ({
  subdivisions,
  onEdit,
  onToggleStatus,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (subdivisions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        No subdivisions found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Name
            </th>
            <th className="py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Internal ID
            </th>
            <th className="py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Status
            </th>
            <th className="py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Categories
            </th>
            <th className="py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Branches
            </th>
            <th className="py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subdivisions.map((subdivision) => (
            <tr
              key={subdivision.id}
              className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {subdivision.displayName}
                  </div>
                  {subdivision.description && (
                    <div className="text-xs text-neutral-500 truncate max-w-[200px]">
                      {subdivision.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">
                  {subdivision.name}
                </code>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subdivision.status === SubdivisionStatus.ACTIVE
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {subdivision.status === SubdivisionStatus.ACTIVE ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {subdivision.status}
                </span>
              </td>
              <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                {subdivision._count?.categories || 0}
              </td>
              <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                {subdivision._count?.branchSubdivisions || 0}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(subdivision)}
                    title="Edit Subdivision"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(subdivision)}
                    title={
                      subdivision.status === SubdivisionStatus.ACTIVE
                        ? 'Deactivate'
                        : 'Activate'
                    }
                    className={
                      subdivision.status === SubdivisionStatus.ACTIVE
                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }
                  >
                    <Power className="w-4 h-4" />
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
