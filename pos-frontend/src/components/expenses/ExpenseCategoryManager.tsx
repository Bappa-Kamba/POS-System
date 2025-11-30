import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import {
  useAllExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from '../../hooks/useExpenses';
import type { ExpenseCategory } from '../../services/expense.service';

interface CategoryFormData {
  name: string;
  description: string;
}

export const ExpenseCategoryManager: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  const { data: categories = [], isLoading } = useAllExpenseCategories();
  const createCategory = useCreateExpenseCategory();
  const updateCategory = useUpdateExpenseCategory();
  const deleteCategory = useDeleteExpenseCategory();

  const handleCreate = () => {
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (category: ExpenseCategory) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${category.name}"? This action cannot be undone if the category is not being used.`
      )
    ) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete category');
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await updateCategory.mutateAsync({
        id: selectedCategory.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        },
      });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Expense Categories
        </h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No expense categories yet. Create one to get started.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      {category.name}
                    </h4>
                    {!category.isActive && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Expense Category"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Utilities, Rent, Supplies"
            required
            maxLength={100}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || createCategory.isPending}
            >
              {createCategory.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Expense Category"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Utilities, Rent, Supplies"
            required
            maxLength={100}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || updateCategory.isPending}
            >
              {updateCategory.isPending ? 'Updating...' : 'Update Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
