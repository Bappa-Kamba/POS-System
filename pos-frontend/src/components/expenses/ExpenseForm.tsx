import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Expense } from '../../services/expense.service';

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Omit<ExpenseFormData, 'branchId'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  categories: string[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSubmit,
  onCancel,
  isLoading,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          description: expense.description || '',
          date: expense.date.split('T')[0],
        }
      : {
          date: new Date().toISOString().split('T')[0],
        },
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        description: expense.description || '',
        date: expense.date.split('T')[0],
      });
    }
  }, [expense, reset]);

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Enter expense title"
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Category
        </label>
        <select
          {...register('category')}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.category ? 'border-red-500' : 'border-neutral-300'
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
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        {...register('amount', { valueAsNumber: true })}
        error={errors.amount?.message}
        placeholder="0.00"
      />

      <Input
        label="Date"
        type="date"
        {...register('date')}
        error={errors.date?.message}
      />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="Enter description (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1" respectLicense>
          {isLoading ? 'Saving...' : expense ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

