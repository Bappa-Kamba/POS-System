import React, { useState } from 'react';
import { Plus, Search, Building2, Users, Package, DollarSign } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BranchTable } from '../../components/branches/BranchTable';
import { BranchForm } from '../../components/branches/BranchForm';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from '../../hooks/useBranches';
import type { Branch } from '../../services/branch.service';

export const BranchesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const limit = 20;

  const { data, isLoading, refetch } = useBranches({
    page,
    limit,
    search: search || undefined,
  });

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCreate = async (formData: any) => {
    try {
      await createBranch.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      // Error is handled by the hook
      console.error('Failed to create branch:', error);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedBranch) return;

    try {
      await updateBranch.mutateAsync({
        id: selectedBranch.id,
        data: formData,
      });
      setIsEditModalOpen(false);
      setSelectedBranch(null);
      refetch();
    } catch (error: any) {
      // Error is handled by the hook
      console.error('Failed to update branch:', error);
    }
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`Are you sure you want to delete ${branch.name}?`)) {
      return;
    }

    try {
      await deleteBranch.mutateAsync(branch.id);
      refetch();
    } catch (error: any) {
      // Error is handled by the hook
      console.error('Failed to delete branch:', error);
    }
  };

  const branches = data?.data || [];
  const totalPages = data?.meta?.lastPage || 1;

  // Calculate summary statistics
  const totalUsers = branches.reduce((sum, b) => sum + (b._count?.users || 0), 0);
  const totalProducts = branches.reduce((sum, b) => sum + (b._count?.products || 0), 0);
  const totalSales = branches.reduce((sum, b) => sum + (b._count?.sales || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Branch Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage branches and their settings
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Branches
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {branches.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Products
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalSales}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, location, or address..."
              className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <BranchTable
          branches={branches}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages} • {data?.meta?.total || 0} total branches
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
        title="Add New Branch"
        size="lg"
      >
        <BranchForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createBranch.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBranch(null);
        }}
        title="Edit Branch"
        size="lg"
      >
        {selectedBranch && (
          <BranchForm
            branch={selectedBranch}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedBranch(null);
            }}
            isLoading={updateBranch.isPending}
          />
        )}
      </Modal>
    </div>
  );
};
