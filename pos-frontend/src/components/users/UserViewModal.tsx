import React from 'react';
import { X, User as UserIcon, Mail, Building2, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import type { User } from '../../services/user.service';
import { format } from 'date-fns';

interface UserViewModalProps {
  user: User;
  onClose: () => void;
  onEdit: () => void;
  subdivisionName?: string;
}

export const UserViewModal: React.FC<UserViewModalProps> = ({
  user,
  onClose,
  onEdit,
  subdivisionName,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {user.isActive ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Inactive
                </>
              )}
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              <Shield className="w-4 h-4" />
              {user.role === 'ADMIN' ? 'Administrator' : 'Cashier'}
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium">Username</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                {user.username}
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Mail className="w-4 h-4" />
                <span className="font-medium">Email</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">
                {user.email || 'Not provided'}
              </p>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                First Name
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">
                {user.firstName || 'Not provided'}
              </p>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                Last Name
              </div>
              <p className="text-neutral-900 dark:text-neutral-100">
                {user.lastName || 'Not provided'}
              </p>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Branch</span>
              </div>
              <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                {user.branch?.name || user.branchId}
              </p>
            </div>

            {/* Assigned Subdivision */}
            {user.role === 'CASHIER' && (
              <div className="space-y-2">
                <div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  Assigned Subdivision
                </div>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {subdivisionName || user.assignedSubdivisionId || 'None (No Access)'}
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Created</span>
                </div>
                <p className="text-neutral-900 dark:text-neutral-100 text-sm">
                  {format(new Date(user.createdAt), 'PPpp')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Last Updated</span>
                </div>
                <p className="text-neutral-900 dark:text-neutral-100 text-sm">
                  {format(new Date(user.updatedAt), 'PPpp')}
                </p>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="space-y-2">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                User ID
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs font-mono">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 px-6 py-4 flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={onEdit} className="flex-1">
            Edit User
          </Button>
        </div>
      </div>
    </div>
  );
};
