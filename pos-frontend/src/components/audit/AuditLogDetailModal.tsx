import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import type { AuditLog } from '../../services/audit.service';

interface AuditLogDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
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

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!log) return null;

  let oldValues: Record<string, unknown> | null = null;
  let newValues: Record<string, unknown> | null = null;

  try {
    if (log.oldValues) {
      oldValues = JSON.parse(log.oldValues) as Record<string, unknown>;
    }
    if (log.newValues) {
      newValues = JSON.parse(log.newValues) as Record<string, unknown>;
    }
  } catch {
    // Invalid JSON, ignore
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details" size="xl">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Timestamp
            </label>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              {formatDate(log.createdAt, 'datetime')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              User
            </label>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              {log.user.firstName && log.user.lastName
                ? `${log.user.firstName} ${log.user.lastName}`
                : log.user.username}
              <span className="text-neutral-500 ml-2">({log.user.username})</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Action
            </label>
            <Badge
              className={
                actionColors[log.action] ||
                'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200'
              }
            >
              {log.action}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Entity
            </label>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              {log.entity}
            </p>
          </div>
          {log.entityId && (
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Entity ID
              </label>
              <p className="text-sm font-mono text-neutral-900 dark:text-neutral-100">
                {log.entityId}
              </p>
            </div>
          )}
          {log.ipAddress && (
            <div>
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                IP Address
              </label>
              <p className="text-sm text-neutral-900 dark:text-neutral-100">
                {log.ipAddress}
              </p>
            </div>
          )}
          {log.userAgent && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                User Agent
              </label>
              <p className="text-sm text-neutral-900 dark:text-neutral-100">
                {log.userAgent}
              </p>
            </div>
          )}
        </div>

        {/* Changes */}
        {(oldValues || newValues) && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Changes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {oldValues && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Old Values
                  </h4>
                  <pre className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-xs overflow-auto max-h-64">
                    {JSON.stringify(oldValues, null, 2)}
                  </pre>
                </div>
              )}
              {newValues && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    New Values
                  </h4>
                  <pre className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-xs overflow-auto max-h-64">
                    {JSON.stringify(newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

