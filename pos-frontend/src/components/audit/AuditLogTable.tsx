import React from 'react';
import { Eye, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import type { AuditLog } from '../../services/audit.service';

interface AuditLogTableProps {
  logs: AuditLog[];
  onView: (log: AuditLog) => void;
  isLoading?: boolean;
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  LOGIN_FAILED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  EXPORT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  BACKUP: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  RESTORE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  onView,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-500 dark:text-neutral-400">No audit logs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Entity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Entity ID
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(log.createdAt, 'datetime')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                {log.user.firstName && log.user.lastName
                  ? `${log.user.firstName} ${log.user.lastName}`
                  : log.user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  className={
                    actionColors[log.action] ||
                    'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200'
                  }
                >
                  {log.action}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                {log.entity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                {log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(log)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

