import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../common/Button';
import type { Subdivision, CreateSubdivisionDto } from '../../types/subdivision';

interface SubdivisionFormProps {
  subdivision?: Subdivision;
  onSubmit: (data: CreateSubdivisionDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SubdivisionForm: React.FC<SubdivisionFormProps> = ({
  subdivision,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSubdivisionDto>({
    defaultValues: {
      name: subdivision?.name || '',
      displayName: subdivision?.displayName || '',
      description: subdivision?.description || '',
      color: subdivision?.color || '',
      icon: subdivision?.icon || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Internal Name (Unique ID)
        </label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          placeholder="e.g., CASHBACK_ACCESSORIES"
          disabled={!!subdivision} // Name cannot be changed after creation
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
        <p className="text-xs text-neutral-500 mt-1">
          This is used internally and cannot be changed later. Use uppercase and underscores.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Display Name
        </label>
        <input
          {...register('displayName', { required: 'Display name is required' })}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          placeholder="e.g., Cashback & Accessories"
        />
        {errors.displayName && (
          <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          rows={3}
          placeholder="Optional description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Color (Tailwind Class or Hex)
          </label>
          <input
            {...register('color')}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            placeholder="e.g., bg-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Icon Name
          </label>
          <input
            {...register('icon')}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            placeholder="e.g., Package"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {subdivision ? 'Update Subdivision' : 'Create Subdivision'}
        </Button>
      </div>
    </form>
  );
};
