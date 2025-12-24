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
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSubdivisionDto>({
    defaultValues: {
      name: subdivision?.name || '',
      displayName: subdivision?.displayName || '',
      description: subdivision?.description || '',
    },
  });

  // Auto-generate internal name from display name
  const displayName = watch('displayName');
  React.useEffect(() => {
    if (!subdivision && displayName) {
      const internalName = displayName
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setValue('name', internalName);
    }
  }, [displayName, subdivision, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Display Name *
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
          Internal Name (Auto-generated) *
        </label>
        <input
          {...register('name', { required: 'Name is required' })}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          placeholder="AUTO_GENERATED"
          disabled={!!subdivision} // Name cannot be changed after creation
          readOnly={!subdivision}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Auto-generated from display name. Cannot be changed after creation.
        </p>
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
        <Button type="submit" isLoading={isLoading} respectLicense>
          {subdivision ? 'Update Subdivision' : 'Create Subdivision'}
        </Button>
      </div>
    </form>
  );
};
