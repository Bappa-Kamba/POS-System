import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  Receipt,
  DollarSign,
  Settings as SettingsIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { useBranch, useUpdateBranch } from '../../hooks/useSettings';
import { useThemeStore } from '../../store/themeStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const branchInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
});

const taxSettingsSchema = z.object({
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  currency: z.string().min(1, 'Currency is required'),
});

const receiptSettingsSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  receiptFooter: z.string().optional(),
});

type TabType = 'branch' | 'tax' | 'receipt' | 'system';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('branch');
  const { data: branch, isLoading } = useBranch();
  const updateBranch = useUpdateBranch();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const branchForm = useForm({
    resolver: zodResolver(branchInfoSchema),
    defaultValues: {
      name: branch?.name || '',
      location: branch?.location || '',
      phone: branch?.phone || '',
      email: branch?.email || '',
      address: branch?.address || '',
    },
    values: branch
      ? {
          name: branch.name,
          location: branch.location || '',
          phone: branch.phone || '',
          email: branch.email || '',
          address: branch.address || '',
        }
      : undefined,
  });

  const taxForm = useForm({
    resolver: zodResolver(taxSettingsSchema),
    defaultValues: {
      taxRate: branch?.taxRate || 0.075,
      currency: branch?.currency || 'NGN',
    },
    values: branch
      ? {
          taxRate: branch.taxRate,
          currency: branch.currency,
        }
      : undefined,
  });

  const receiptForm = useForm({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: {
      businessName: branch?.businessName || '',
      businessAddress: branch?.businessAddress || '',
      businessPhone: branch?.businessPhone || '',
      receiptFooter: branch?.receiptFooter || '',
    },
    values: branch
      ? {
          businessName: branch.businessName || '',
          businessAddress: branch.businessAddress || '',
          businessPhone: branch.businessPhone || '',
          receiptFooter: branch.receiptFooter || '',
        }
      : undefined,
  });

  const handleBranchSubmit = async (data: z.infer<typeof branchInfoSchema>) => {
    try {
      await updateBranch.mutateAsync(data);
      branchForm.reset(data);
      alert('Branch information updated successfully');
    } catch (error) {
      console.error('Failed to update branch info:', error);
      alert('Failed to update branch information');
    }
  };

  const handleTaxSubmit = async (data: z.infer<typeof taxSettingsSchema>) => {
    try {
      await updateBranch.mutateAsync(data);
      taxForm.reset(data);
      alert('Tax settings updated successfully');
    } catch (error) {
      console.error('Failed to update tax settings:', error);
      alert('Failed to update tax settings');
    }
  };

  const handleReceiptSubmit = async (
    data: z.infer<typeof receiptSettingsSchema>,
  ) => {
    try {
      await updateBranch.mutateAsync(data);
      receiptForm.reset(data);
      alert('Receipt settings updated successfully');
    } catch (error) {
      console.error('Failed to update receipt settings:', error);
      alert('Failed to update receipt settings');
    }
  };

  const tabs = [
    { id: 'branch' as TabType, label: 'Branch Information', icon: Building2 },
    { id: 'tax' as TabType, label: 'Tax Settings', icon: DollarSign },
    { id: 'receipt' as TabType, label: 'Receipt Settings', icon: Receipt },
    { id: 'system' as TabType, label: 'System Settings', icon: SettingsIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your branch and system settings
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700">
        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Branch Information Tab */}
          {activeTab === 'branch' && (
            <form
              onSubmit={branchForm.handleSubmit(handleBranchSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Branch Name"
                  {...branchForm.register('name')}
                  error={branchForm.formState.errors.name?.message}
                />
                <Input
                  label="Location"
                  {...branchForm.register('location')}
                  error={branchForm.formState.errors.location?.message}
                />
                <Input
                  label="Phone"
                  {...branchForm.register('phone')}
                  error={branchForm.formState.errors.phone?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  {...branchForm.register('email')}
                  error={branchForm.formState.errors.email?.message}
                />
                <Input
                  label="Address"
                  {...branchForm.register('address')}
                  className="md:col-span-2"
                  error={branchForm.formState.errors.address?.message}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={updateBranch.isPending}
                  disabled={!branchForm.formState.isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Tax Settings Tab */}
          {activeTab === 'tax' && (
            <form
              onSubmit={taxForm.handleSubmit(handleTaxSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Tax Rate"
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    {...taxForm.register('taxRate', { valueAsNumber: true })}
                    error={taxForm.formState.errors.taxRate?.message}
                  />
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Enter as decimal (e.g., 0.075 for 7.5%)
                  </p>
                </div>
                <Input
                  label="Currency"
                  {...taxForm.register('currency')}
                  error={taxForm.formState.errors.currency?.message}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={updateBranch.isPending}
                  disabled={!taxForm.formState.isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Receipt Settings Tab */}
          {activeTab === 'receipt' && (
            <form
              onSubmit={receiptForm.handleSubmit(handleReceiptSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  {...receiptForm.register('businessName')}
                  error={receiptForm.formState.errors.businessName?.message}
                />
                <Input
                  label="Business Phone"
                  {...receiptForm.register('businessPhone')}
                  error={receiptForm.formState.errors.businessPhone?.message}
                />
                <Input
                  label="Business Address"
                  {...receiptForm.register('businessAddress')}
                  className="md:col-span-2"
                  error={receiptForm.formState.errors.businessAddress?.message}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Receipt Footer
                  </label>
                  <textarea
                    {...receiptForm.register('receiptFooter')}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                    placeholder="Thank you for your purchase!"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={updateBranch.isPending}
                  disabled={!receiptForm.formState.isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      Dark Mode
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Light Mode
                        </span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Dark Mode
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

