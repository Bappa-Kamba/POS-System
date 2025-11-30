import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProductSearch } from '../../components/pos/ProductSearch';
import { ProductTable } from '../../components/pos/ProductTable';
import { Cart } from '../../components/pos/Cart';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { ReceiptPreview } from '../../components/pos/ReceiptPreview';
import { TransactionTypeSelector } from '../../components/pos/TransactionTypeSelector';
import { CashbackForm } from '../../components/pos/CashbackForm';
import { Button } from '../../components/common/Button';
import { useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { useCreateSale, useReceipt } from '../../hooks/useSales';
import { useBranch } from '../../hooks/useSettings';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';
import type { Payment } from '../../services/sale.service';
import { ProductCategory } from '../../types/product';

import { useSession } from '../../contexts/SessionContext';
import { SessionControls } from '../../components/session/SessionControls';
import { LogOut, Receipt } from 'lucide-react';
import { QuickExpenseForm } from '../../components/pos/QuickExpenseForm';
import { useCreateExpense, useExpenseCategories } from '../../hooks/useExpenses';
import toast from 'react-hot-toast';

export const PosPage: React.FC = () => {
  const { user } = useAuth();
  const { activeSession, isLoading: isSessionLoading } = useSession();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'PURCHASE' | 'CASHBACK' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const createExpense = useCreateExpense();
  const { data: expenseCategories = [] } = useExpenseCategories();

  const addItem = useCartStore((state) => state.addItem);
  const { items, getTotal, clearCart } = useCartStore();
  const createSaleMutation = useCreateSale();
  const { data: receiptData } = useReceipt(completedSaleId || '');
  const { data: branch } = useBranch();

  const total = getTotal();

  // Fetch products (only for PURCHASE mode)
  const { data, isLoading } = useProducts({
    search: searchQuery || undefined,
    categoryId:
      selectedCategory !== 'ALL'
        ? (selectedCategory as ProductCategory)
        : undefined,
    isActive: true,
    branchId: user?.branchId,
  }, {
    enabled: transactionType === 'PURCHASE',
  });

  const products = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const variants = useMemo(() => {
    const allVariants = (data as any)?.variants || [];
    if (selectedCategory === 'ALL') return allVariants;
    return allVariants.filter(
      (v: Variant) => v.product?.category === selectedCategory
    );
  }, [data, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: products.length,
      FROZEN: 0,
      DRINKS: 0,
      ACCESSORIES: 0,
      OTHER: 0,
    };

    products.forEach((product) => {
      if (counts[product.category] !== undefined) {
        counts[product.category]++;
      }
    });

    return counts;
  }, [products]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductFound = (product: Product | Variant, type: 'product' | 'variant') => {
    if (type === 'product') {
      const productData = product as Product;
      if (productData.hasVariants) {
        return;
      }
      addItem(productData);
    } else {
      const variant = product as Variant;
      if (variant.product) {
        const parentProduct: Product = {
          id: variant.product.id,
          name: variant.product.name,
          category: variant.product.category as ProductCategory,
          // subdivision removed
          hasVariants: true,
          sku: variant.product.id,
          // tax removed
          isActive: true,
          branchId: user?.branchId || '',
          createdAt: '',
          updatedAt: '',
        };
        addItem(parentProduct, variant);
      }
    }
  };

  const handleAddToCart = (product: Product, variant?: Variant | null) => {
    addItem(product, variant || null);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Cart is empty. Please add items before checkout.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCompletePurchase = async (payment: Payment) => {
    try {
      const saleItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const response = await createSaleMutation.mutateAsync({
        items: saleItems,
        payments: [payment],
        transactionType: 'PURCHASE',
      });

      if (response.success && response.data) {
        clearCart();
        setIsPaymentModalOpen(false);
        setCompletedSaleId(response.data.id);
        setIsReceiptModalOpen(true);
      }
    } catch (error: any) {
      console.error('Sale creation failed:', error);
      alert(
        error?.response?.data?.error?.message ||
          'Failed to complete sale. Please try again.'
      );
    }
  };

  const handleCompleteCashback = async (
    amount: number,
    serviceCharge: number,
    totalReceived: number,
  ) => {
    try {
      const response = await createSaleMutation.mutateAsync({
        cashbackAmount: amount,
        serviceCharge, // Pass manual service charge
        payments: [
          {
            method: 'TRANSFER',
            amount: totalReceived,
            reference: `Cashback-${Date.now()}`,
            notes: `Service Charge: ${serviceCharge.toFixed(2)}`,
          },
        ],
        transactionType: 'CASHBACK',
        notes: `Service Charge: ${serviceCharge.toFixed(2)}`,
      });

      if (response.success && response.data) {
        alert('Cashback transaction completed successfully!');
        // Reset to transaction type selection
        setTransactionType(null);
      }
    } catch (error: any) {
      console.error('Cashback creation failed:', error);
      alert(
        error?.response?.data?.error?.message ||
          'Failed to complete cashback. Please try again.'
      );
    }
  };

  const handleBackToSelection = () => {
    setTransactionType(null);
    clearCart();
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  const handleExpenseSubmit = async (data: { title: string; category: string; amount: number; description?: string }) => {
    if (!user?.branchId) {
      toast.error('Branch information not found');
      return;
    }

    try {
      await createExpense.mutateAsync({
        ...data,
        date: new Date().toISOString(),
        branchId: user.branchId,
      });
      toast.success('Expense recorded successfully');
      setIsExpenseFormOpen(false);
    } catch (error) {
      toast.error('Failed to record expense');
      console.error(error);
    }
  };

  const categories = [
    { value: 'ALL', label: 'All' },
    { value: 'FROZEN', label: 'Frozen' },
    { value: 'DRINKS', label: 'Drinks' },
    { value: 'ACCESSORIES', label: 'Accessories' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Check for active session
  if (isSessionLoading) {
    return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }

  if (!activeSession) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Start Session</h1>
          <SessionControls />
        </div>
      </div>
    );
  }

  // Show transaction type selector if no type selected
  if (!transactionType) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Point of Sale
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {user?.firstName
                    ? `Hello, ${user.firstName}`
                    : `Hello, ${user?.username}`}
                </p>
                <span className="text-neutral-300">•</span>
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  {activeSession.name} Session
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Branch</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {user?.branchId || 'N/A'}
                </p>
              </div>
              {/* Add a way to end session here if needed, or keep it in a separate settings area */}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <TransactionTypeSelector onSelect={setTransactionType} />
        </div>
      </div>
    );
  }

  // Show cashback form if cashback selected
  if (transactionType === 'CASHBACK') {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Cashback Service
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {user?.firstName
                  ? `Hello, ${user.firstName}`
                  : `Hello, ${user?.username}`}
              </p>
            </div>
            <Button variant="ghost" onClick={handleBackToSelection}>
              ← Back to Selection
            </Button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <CashbackForm
              availableCapital={branch?.cashbackCapital || 0}
              onComplete={handleCompleteCashback}
              onCancel={handleBackToSelection}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show purchase interface
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Point of Sale - Purchase
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {user?.firstName
                ? `Hello, ${user.firstName}`
                : `Hello, ${user?.username}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Branch</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {user?.branchId || 'N/A'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsExpenseFormOpen(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Record Expense
            </Button>
            <Button variant="ghost" onClick={handleBackToSelection}>
              ← Back to Selection
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsSessionModalOpen(true)}>
              <LogOut className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 dark:border-neutral-700">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <ProductSearch
              onSearch={handleSearch}
              onProductFound={handleProductFound}
              searchQuery={searchQuery}
            />
          </div>

          <div className="px-4 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {category.label}
                  <span className="ml-2 text-xs opacity-75">
                    ({categoryCounts[category.value] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ProductTable
              products={filteredProducts}
              variants={variants}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="w-full md:w-96 lg:w-[400px] flex flex-col border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <Cart onCheckout={handleCheckout} />
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        onComplete={handleCompletePurchase}
      />

      <ReceiptPreview
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setCompletedSaleId(null);
        }}
        receiptData={
          receiptData && receiptData.success && 'receipt' in receiptData.data
            ? (receiptData.data as any).receipt
            : null
        }
      />

      {/* Session Control Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsSessionModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Session Management</h2>
            <SessionControls />
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {isExpenseFormOpen && (
        <QuickExpenseForm
          onSubmit={handleExpenseSubmit}
          onCancel={() => setIsExpenseFormOpen(false)}
          isLoading={createExpense.isPending}
          categories={expenseCategories}
        />
      )}
    </div>
  );
};
