import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  Receipt,
  Settings as SettingsIcon,
  Moon,
  Sun,
  ArrowLeftRight,
  Plus,
  Minus,
} from 'lucide-react';
import { useBranch, useUpdateBranch, useAdjustCashbackCapital } from '../../hooks/useSettings';
import { useSubdivisions, useUpdateSubdivision } from '../../hooks/useSubdivisions';
import { useThemeStore } from '../../store/themeStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';

const branchInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
});

const receiptSettingsSchema = z.object({
  receiptFooter: z.string().optional(),
});

const cashbackSettingsSchema = z.object({
  cashbackServiceChargeRate: z.number().min(0).max(1, 'Rate must be between 0 and 1'),
  cashbackSubdivisionId: z.string().optional(),
});

type TabType = 'branch' | 'tax' | 'receipt' | 'cashback' | 'system';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('branch');
  const { data: branch, isLoading } = useBranch();
  const { data: subdivisions } = useSubdivisions();
  const updateBranch = useUpdateBranch();
  const updateSubdivision = useUpdateSubdivision();
  const adjustCapital = useAdjustCashbackCapital();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [capitalAdjustment, setCapitalAdjustment] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  
  // Subdivision Receipt Settings State
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<string>('');
  const [isOverridingReceipt, setIsOverridingReceipt] = useState(false);
  const [subdivisionReceiptForm, setSubdivisionReceiptForm] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    receiptFooter: '',
  });

  // Load subdivision settings when selection changes
  const handleSubdivisionChange = (subdivisionId: string) => {
    setSelectedSubdivisionId(subdivisionId);
    if (!subdivisionId) {
      setIsOverridingReceipt(false);
      return;
    }
    
    // Find the selected subdivision from the list
    // Note: In a real app, might want to fetch fresh data here
    const sub = subdivisions && 'data' in subdivisions 
      ? (subdivisions.data as any[]).find(s => s.id === subdivisionId) 
      : null;
      
    if (sub) {
      // Check if any receipt field is non-null
      const hasOverrides = !!(sub.receiptBusinessName || sub.receiptAddress || sub.receiptPhone || sub.receiptFooter);
      setIsOverridingReceipt(hasOverrides);
      setSubdivisionReceiptForm({
        businessName: sub.receiptBusinessName || '',
        businessAddress: sub.receiptAddress || '',
        businessPhone: sub.receiptPhone || '',
        receiptFooter: sub.receiptFooter || '',
      });
    }
  };

  const handleSubdivisionReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubdivisionId) return;

    try {
      // If not overriding, set all to null
      const data = isOverridingReceipt ? {
        receiptBusinessName: subdivisionReceiptForm.businessName || null,
        receiptAddress: subdivisionReceiptForm.businessAddress || null,
        receiptPhone: subdivisionReceiptForm.businessPhone || null,
        receiptFooter: subdivisionReceiptForm.receiptFooter || null,
      } : {
        receiptBusinessName: null,
        receiptAddress: null,
        receiptPhone: null,
        receiptFooter: null,
      };

      await updateSubdivision.mutateAsync({
        id: selectedSubdivisionId,
        data: data
      });
      
      alert('Subdivision receipt settings saved successfully');
    } catch (error) {
      console.error('Failed to update subdivision receipt settings:', error);
      alert('Failed to update subdivision receipt settings');
    }
  };

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

  const receiptForm = useForm({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: {
      receiptFooter: branch?.receiptFooter || '',
    },
    values: branch
      ? {
          receiptFooter: branch.receiptFooter || '',
        }
      : undefined,
  });

  const cashbackForm = useForm({
    resolver: zodResolver(cashbackSettingsSchema),
    defaultValues: {
      cashbackServiceChargeRate: branch?.cashbackServiceChargeRate || 0.02,
      cashbackSubdivisionId: branch?.cashbackSubdivisionId || '',
    },
    values: branch
      ? {
          cashbackServiceChargeRate: branch.cashbackServiceChargeRate || 0.02,
          cashbackSubdivisionId: branch.cashbackSubdivisionId || '',
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
    { id: 'receipt' as TabType, label: 'Receipt Settings', icon: Receipt },
    { id: 'cashback' as TabType, label: 'Cashback Settings', icon: ArrowLeftRight },
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

          {activeTab === 'receipt' && (
            <div className="space-y-8">
              {/* Branch Level Settings */}
              <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">Branch Receipt Footer</h3>
                <form
                  onSubmit={receiptForm.handleSubmit(handleReceiptSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div>
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
                      Save Defaults
                    </Button>
                  </div>
                </form>
              </div>

              {/* Subdivision Overrides */}
              <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium mb-4 text-neutral-900 dark:text-neutral-100">Subdivision Overrides</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Select Subdivision to Configure
                  </label>
                  <select
                    value={selectedSubdivisionId}
                    onChange={(e) => handleSubdivisionChange(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a subdivision...</option>
                    {subdivisions && 'data' in subdivisions && Array.isArray(subdivisions.data) && subdivisions.data.map((subdivision: any) => (
                      <option key={subdivision.id} value={subdivision.id}>
                        {subdivision.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSubdivisionId && (
                  <form onSubmit={handleSubdivisionReceiptSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="overrideReceipt"
                        checked={isOverridingReceipt}
                        onChange={(e) => setIsOverridingReceipt(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-neutral-300"
                      />
                      <label htmlFor="overrideReceipt" className="text-sm font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer">
                        Override branch receipt settings
                      </label>
                    </div>

                    {isOverridingReceipt && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary-200 dark:border-primary-800">
                        <Input
                          label="Business Name (Override)"
                          value={subdivisionReceiptForm.businessName}
                          onChange={e => setSubdivisionReceiptForm(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder={branch?.businessName || ''}
                        />
                        <Input
                          label="Business Phone (Override)"
                          value={subdivisionReceiptForm.businessPhone}
                          onChange={e => setSubdivisionReceiptForm(prev => ({ ...prev, businessPhone: e.target.value }))}
                          placeholder={branch?.businessPhone || ''}
                        />
                        <Input
                          label="Business Address (Override)"
                          value={subdivisionReceiptForm.businessAddress}
                          onChange={e => setSubdivisionReceiptForm(prev => ({ ...prev, businessAddress: e.target.value }))}
                          className="md:col-span-2"
                          placeholder={branch?.businessAddress || ''}
                        />
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Receipt Footer (Override)
                          </label>
                          <textarea
                            value={subdivisionReceiptForm.receiptFooter}
                            onChange={e => setSubdivisionReceiptForm(prev => ({ ...prev, receiptFooter: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
                            placeholder={branch?.receiptFooter || "Thank you for your purchase!"}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        isLoading={updateSubdivision.isPending}
                        disabled={!selectedSubdivisionId}
                      >
                        Save Overrides
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
          {/* Cashback Settings Tab */}
          {activeTab === 'cashback' && (
            <div className="space-y-6">
              {/* Current Capital Display */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Current Cashback Capital
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Available capital for cashback transactions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(branch?.cashbackCapital || 0, branch?.currency || 'NGN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cashback Configuration */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Cashback Configuration
                </h3>
                <form
                  onSubmit={cashbackForm.handleSubmit(async (data) => {
                    try {
                      await updateBranch.mutateAsync({
                        cashbackServiceChargeRate: data.cashbackServiceChargeRate,
                        cashbackSubdivisionId: data.cashbackSubdivisionId || undefined,
                      });
                      cashbackForm.reset(data);
                      alert('Cashback settings updated successfully');
                    } catch (error) {
                      console.error('Failed to update cashback settings:', error);
                      alert('Failed to update cashback settings');
                    }
                  })}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Cashback Subdivision
                    </label>
                    <select
                      {...cashbackForm.register('cashbackSubdivisionId')}
                      className="w-full max-w-xs px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">No subdivision assigned</option>
                      {subdivisions && 'data' in subdivisions && Array.isArray(subdivisions.data) && subdivisions.data.map((subdivision: any) => (
                        <option key={subdivision.id} value={subdivision.id}>
                          {subdivision.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Only cashiers assigned to this subdivision can process cashback transactions.
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Service Charge Rate"
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      {...cashbackForm.register('cashbackServiceChargeRate', {
                        valueAsNumber: true,
                      })}
                      className="max-w-xs"
                      error={
                        cashbackForm.formState.errors.cashbackServiceChargeRate?.message
                      }
                    />
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Enter as decimal (e.g., 0.02 for 2%). Current rate:{' '}
                      {((branch?.cashbackServiceChargeRate || 0.02) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isLoading={updateBranch.isPending}
                      disabled={!cashbackForm.formState.isDirty}
                    >
                      Save Settings
                    </Button>
                  </div>
                </form>
              </div>

              {/* Adjust Capital */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Adjust Capital
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const amount = parseFloat(capitalAdjustment);
                    if (isNaN(amount) || amount === 0) {
                      alert('Please enter a valid amount');
                      return;
                    }

                    const newBalance = (branch?.cashbackCapital || 0) + amount;
                    if (newBalance < 0) {
                      alert(
                        `Insufficient capital. Current: ${formatCurrency(
                          branch?.cashbackCapital || 0,
                          branch?.currency || 'NGN',
                        )}, Adjustment: ${formatCurrency(amount, branch?.currency || 'NGN')}`,
                      );
                      return;
                    }

                    try {
                      await adjustCapital.mutateAsync({
                        amount,
                        notes: adjustmentNotes || undefined,
                      });
                      setCapitalAdjustment('');
                      setAdjustmentNotes('');
                      alert(
                        `Capital ${amount > 0 ? 'added' : 'deducted'} successfully. New balance: ${formatCurrency(
                          newBalance,
                          branch?.currency || 'NGN',
                        )}`,
                      );
                    } catch (error: any) {
                      console.error('Failed to adjust capital:', error);
                      alert(
                        error?.response?.data?.error?.message ||
                          'Failed to adjust capital',
                      );
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Amount
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={capitalAdjustment}
                        onChange={(e) => setCapitalAdjustment(e.target.value)}
                        placeholder="Enter amount"
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const amount = parseFloat(capitalAdjustment) || 0;
                          if (amount > 0) {
                            setCapitalAdjustment(amount.toString());
                          }
                        }}
                        title="Use positive number to add"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const amount = parseFloat(capitalAdjustment) || 0;
                          if (amount > 0) {
                            setCapitalAdjustment(`-${amount}`);
                          }
                        }}
                        title="Use negative number to subtract"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Use positive number to add capital, negative to subtract
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Notes (Optional)
                    </label>
                    <Input
                      type="text"
                      value={adjustmentNotes}
                      onChange={(e) => setAdjustmentNotes(e.target.value)}
                      placeholder="e.g., Initial capital, Bank deposit, etc."
                    />
                  </div>
                  {capitalAdjustment && (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Current Balance:
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(
                            branch?.cashbackCapital || 0,
                            branch?.currency || 'NGN',
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Adjustment:
                        </span>
                        <span
                          className={`font-medium ${
                            parseFloat(capitalAdjustment) >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {parseFloat(capitalAdjustment) >= 0 ? '+' : ''}
                          {formatCurrency(
                            parseFloat(capitalAdjustment) || 0,
                            branch?.currency || 'NGN',
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="text-neutral-900 dark:text-neutral-100">
                          New Balance:
                        </span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {formatCurrency(
                            (branch?.cashbackCapital || 0) +
                              (parseFloat(capitalAdjustment) || 0),
                            branch?.currency || 'NGN',
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      isLoading={adjustCapital.isPending}
                      disabled={!capitalAdjustment || parseFloat(capitalAdjustment) === 0}
                    >
                      {parseFloat(capitalAdjustment) >= 0 ? 'Add' : 'Deduct'} Capital
                    </Button>
                  </div>
                </form>
              </div>
            </div>
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

