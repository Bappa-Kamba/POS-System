import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { X } from 'lucide-react';

const quickExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().optional(),
});

type QuickExpenseFormData = z.infer<typeof quickExpenseSchema>;

interface QuickExpenseFormProps {
  onSubmit: (data: QuickExpenseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  categories: string[];
}

export const QuickExpenseForm: React.FC<QuickExpenseFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickExpenseFormData>({
    resolver: zodResolver(quickExpenseSchema),
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isSubmittingRef = React.useRef(false);

  const handleFormSubmit = async (data: QuickExpenseFormData) => {
    if (isSubmittingRef.current) return;
    
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    
    try {
      await onSubmit(data); // Assuming onSubmit might be async
    } catch (error) {
       console.error(error);
    } finally {
        if (isSubmittingRef.current) {
            // Only reset if we are still mounted
             setIsSubmitting(false);
             isSubmittingRef.current = false;
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Record Expense
          </h3>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Title *"
            {...register('title')}
            error={errors.title?.message}
            placeholder="e.g., Office Supplies"
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Category *
            </label>
            <select
              {...register('category')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 ${
                errors.category ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <Input
            label="Amount *"
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
            placeholder="0.00"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isSubmitting} className="flex-1">
              {isLoading || isSubmitting ? 'Recording...' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
