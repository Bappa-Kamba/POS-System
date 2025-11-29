import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import type { Category, CreateCategoryDto } from '../../types/category';
import type { Subdivision } from '../../types/subdivision';

interface CategoryFormProps {
  category?: Category;
  subdivisions: Subdivision[];
  onSubmit: (data: CreateCategoryDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  subdivisions,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryDto>({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      subdivisionId: category?.subdivisionId || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Category Name *
        </label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          placeholder="e.g., Beverages"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Subdivision *
        </label>
        <select
          {...register('subdivisionId', { required: 'Subdivision is required' })}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          disabled={!!category} // Cannot change subdivision after creation for now
        >
          <option value="">Select a subdivision</option>
          {subdivisions.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.displayName}
            </option>
          ))}
        </select>
        {errors.subdivisionId && (
          <p className="text-red-500 text-sm mt-1">{errors.subdivisionId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Description (Optional)
        </label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          rows={3}
          placeholder="Optional description..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};
