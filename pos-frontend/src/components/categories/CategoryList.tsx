import React from 'react';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../common/Button';
import type { Category } from '../../types/category';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isLoading?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        No categories found in this subdivision.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="cursor-move text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              <GripVertical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-neutral-500 mr-2">
              {category._count?.products || 0} products
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              title="Edit Category"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category)}
              title="Delete Category"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
