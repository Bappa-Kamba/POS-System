import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Branch } from '../../services/branch.service';

const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  currency: z.string().optional(),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  receiptFooter: z.string().optional(),
  cashbackCapital: z.number().min(0).optional(),
  cashbackServiceChargeRate: z.number().min(0).max(1).optional(),
});

interface BranchFormProps {
  branch?: Branch;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BranchForm: React.FC<BranchFormProps> = ({
  branch,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!branch;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: branch
      ? {
          name: branch.name,
          location: branch.location || '',
          phone: branch.phone || '',
          email: branch.email || '',
          address: branch.address || '',
          taxRate: branch.taxRate,
          currency: branch.currency,
          businessName: branch.businessName || '',
          businessAddress: branch.businessAddress || '',
          businessPhone: branch.businessPhone || '',
          receiptFooter: branch.receiptFooter || '',
          cashbackCapital: branch.cashbackCapital,
          cashbackServiceChargeRate: branch.cashbackServiceChargeRate,
        }
      : {
          taxRate: 0.075,
          currency: 'NGN',
          cashbackCapital: 0,
          cashbackServiceChargeRate: 0.02,
        },
  });

  const handleFormSubmit = (data: any) => {
    const submitData = { ...data };
    // Remove empty optional fields
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === '' || submitData[key] === null) {
        delete submitData[key];
      }
    });
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="space-y-4">
          <Input
            label="Branch Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Main Branch"
          />

          <Input
            label="Location"
            {...register('location')}
            error={errors.location?.message}
            placeholder="e.g., Downtown"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="e.g., +234 123 456 7890"
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="e.g., branch@example.com"
            />
          </div>

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="e.g., 123 Main Street"
          />
        </div>
      </div>

      {/* Business Settings */}
      <div>
        <h3 className="text-lg font-medium mb-4">Business Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('taxRate', {
                  setValueAs: (v) => (v === '' ? undefined : parseFloat(v) / 100),
                })}
                defaultValue={branch ? branch.taxRate * 100 : 7.5}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
              {errors.taxRate && (
                <p className="mt-1 text-sm text-red-600">{errors.taxRate.message}</p>
              )}
            </div>

            <Input
              label="Currency"
              {...register('currency')}
              error={errors.currency?.message}
              placeholder="e.g., NGN"
            />
          </div>

          <Input
            label="Business Name"
            {...register('businessName')}
            error={errors.businessName?.message}
            placeholder="e.g., ABC Company Ltd"
          />

          <Input
            label="Business Address"
            {...register('businessAddress')}
            error={errors.businessAddress?.message}
            placeholder="For receipts"
          />

          <Input
            label="Business Phone"
            {...register('businessPhone')}
            error={errors.businessPhone?.message}
            placeholder="For receipts"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Receipt Footer
            </label>
            <textarea
              {...register('receiptFooter')}
              rows={2}
              placeholder="e.g., Thank you for your business!"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            {errors.receiptFooter && (
              <p className="mt-1 text-sm text-red-600">{errors.receiptFooter.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cashback Settings */}
      <div>
        <h3 className="text-lg font-medium mb-4">Cashback Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Cashback Capital
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('cashbackCapital', {
                setValueAs: (v) => (v === '' ? undefined : parseFloat(v)),
              })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            {errors.cashbackCapital && (
              <p className="mt-1 text-sm text-red-600">{errors.cashbackCapital.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Service Charge Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('cashbackServiceChargeRate', {
                setValueAs: (v) => (v === '' ? undefined : parseFloat(v) / 100),
              })}
              defaultValue={branch ? branch.cashbackServiceChargeRate * 100 : 2}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            {errors.cashbackServiceChargeRate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.cashbackServiceChargeRate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
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
          {isLoading ? 'Saving...' : isEditMode ? 'Update Branch' : 'Create Branch'}
        </Button>
      </div>
    </form>
  );
};
