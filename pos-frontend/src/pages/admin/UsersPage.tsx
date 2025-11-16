import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { UserTable } from '../../components/users/UserTable';
import { UserForm } from '../../components/users/UserForm';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../services/user.service';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const limit = 20;

  const { data, isLoading, refetch } = useUsers({
    page,
    limit,
    search: search || undefined,
    role: role ? (role as 'ADMIN' | 'CASHIER') : undefined,
    isActive,
    branchId: currentUser?.branchId,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setIsActive(undefined);
    } else {
      setIsActive(value === 'active');
    }
    setPage(1);
  };

  const handleCreate = async (formData: any) => {
    try {
      await createUser.mutateAsync({
        ...formData,
        branchId: currentUser?.branchId || '',
      });
      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.message ||
          'Failed to create user. Please try again.'
      );
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedUser) return;

    try {
      // Remove password if it's empty (don't update password)
      const updateData = { ...formData };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      await updateUser.mutateAsync({
        id: selectedUser.id,
        data: updateData,
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.message ||
          'Failed to update user. Please try again.'
      );
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.username}?`)) {
      return;
    }

    try {
      await deleteUser.mutateAsync(user.id);
      refetch();
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.message ||
          'Failed to deactivate user. Please try again.'
      );
    }
  };

  const users = data?.data || [];
  const totalPages = data?.meta?.lastPage || 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            User Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage system users and their access
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, username, or email..."
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="CASHIER">Cashier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Status
            </label>
            <select
              value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages} • {data?.meta?.total || 0} total users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (page <= 3) {
                    pageNum = idx + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = page - 2 + idx;
                  }
                  return (
                      <React.Fragment key={pageNum}>
                        {idx === 0 && pageNum > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setPage(1)}
                            >
                              1
                            </Button>
                            {pageNum > 2 && <span className="px-2">...</span>}
                          </>
                        )}
                        <Button
                          variant={page === pageNum ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                        {idx === Math.min(totalPages, 5) - 1 &&
                          pageNum < totalPages && (
                            <>
                              {pageNum < totalPages - 1 && (
                                <span className="px-2">...</span>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPage(totalPages)}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                      </React.Fragment>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New User"
        size="lg"
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createUser.isPending}
          branchId={currentUser?.branchId}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            isLoading={updateUser.isPending}
            branchId={currentUser?.branchId}
          />
        )}
      </Modal>
    </div>
  );
};

