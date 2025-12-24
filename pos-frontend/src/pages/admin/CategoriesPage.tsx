import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CategoryList } from '../../components/categories/CategoryList';
import { CategoryForm } from '../../components/categories/CategoryForm';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import { useSubdivisions } from '../../hooks/useSubdivisions';
import type { Category } from '../../types/category';

export const CategoriesPage: React.FC = () => {
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: subdivisionsResponse } = useSubdivisions();
  const subdivisions = subdivisionsResponse?.success ? subdivisionsResponse.data : [];

  // If no subdivision is selected, select the first one by default when loaded
  React.useEffect(() => {
    if (!selectedSubdivisionId && subdivisions.length > 0) {
      setSelectedSubdivisionId(subdivisions[0].id);
    }
  }, [subdivisions, selectedSubdivisionId]);

  const { data: categoriesResponse, isLoading } = useCategories(
    selectedSubdivisionId
  );
  const categories = categoriesResponse?.success ? categoriesResponse.data : [];

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async (formData: any) => {
    try {
      await createCategory.mutateAsync(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedCategory) return;

    try {
      await updateCategory.mutateAsync({
        id: selectedCategory.id,
        data: formData,
      });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (
      !confirm(
        `Are you sure you want to delete ${category.name}? This will fail if there are products in this category.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory.mutateAsync(category.id);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Category Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage product categories within subdivisions
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
          respectLicense
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Subdivisions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Subdivisions
            </h2>
            <div className="space-y-1">
              {subdivisions.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubdivisionId(sub.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSubdivisionId === sub.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                  }`}
                >
                  {sub.displayName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Categories */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {subdivisions.find((s: any) => s.id === selectedSubdivisionId)
                  ?.displayName || 'Categories'}
              </h2>
            </div>

            <CategoryList
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Category"
      >
        <CategoryForm
          subdivisions={subdivisions}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createCategory.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        title="Edit Category"
      >
        {selectedCategory && (
          <CategoryForm
            category={selectedCategory}
            subdivisions={subdivisions}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
            }}
            isLoading={updateCategory.isPending}
          />
        )}
      </Modal>
    </div>
  );
};
