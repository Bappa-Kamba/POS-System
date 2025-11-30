import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProductSearch } from '../../components/pos/ProductSearch';
import { ProductTable } from '../../components/pos/ProductTable';
import { Cart } from '../../components/pos/Cart';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { ReceiptPreview } from '../../components/pos/ReceiptPreview';
import { CashbackForm } from '../../components/pos/CashbackForm';
import { Button } from '../../components/common/Button';
import { useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { useCreateSale, useReceipt } from '../../hooks/useSales';
import { useBranch } from '../../hooks/useSettings';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';
import type { Payment } from '../../services/sale.service';

import { useSession } from '../../contexts/SessionContext';
import { SessionControls } from '../../components/session/SessionControls';
import { SessionEndModal } from '../../components/session/SessionEndModal';
import { LogOut, Receipt, DollarSign } from 'lucide-react';
import { QuickExpenseForm } from '../../components/pos/QuickExpenseForm';
import { useCreateExpense, useExpenseCategories } from '../../hooks/useExpenses';
import { useSubdivisionCategories } from '../../hooks/useCategories';
import toast from 'react-hot-toast';

export const PosPage: React.FC = () => {
  const { user } = useAuth();
  const { activeSession, isLoading: isSessionLoading } = useSession();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);

  const createExpense = useCreateExpense();
  const { data: expenseCategories = [] } = useExpenseCategories();
  const { data: categoriesResponse } = useSubdivisionCategories(user?.assignedSubdivisionId || '');

  const addItem = useCartStore((state) => state.addItem);
  const { items, getTotal, clearCart } = useCartStore();
  const createSaleMutation = useCreateSale();
  const { data: receiptData } = useReceipt(completedSaleId || '');
  const { data: branch } = useBranch();

  const total = getTotal();

  // Fetch products
  const { data, isLoading } = useProducts({
    search: searchQuery || undefined,
    isActive: true,
    branchId: user?.branchId,
  });

  const products = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const variants = useMemo(() => {
    const allVariants = (data as any)?.variants || [];
    if (selectedCategory === 'ALL') return allVariants;
    
    // Find the category name for the selected ID
    const apiCategories = categoriesResponse?.success ? categoriesResponse.data : [];
    const selectedCat = apiCategories.find(cat => cat.id === selectedCategory);
    
    if (!selectedCat) return allVariants;
    
    // Filter variants by matching product category name (case-insensitive)
    return allVariants.filter(
      (v: Variant) => v.product?.category?.name?.toUpperCase() === selectedCat.name.toUpperCase()
    );
  }, [data, selectedCategory, categoriesResponse]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') return products;
    
    // Find the category name for the selected ID
    const apiCategories = categoriesResponse?.success ? categoriesResponse.data : [];
    const selectedCat = apiCategories.find(cat => cat.id === selectedCategory);
    
    if (!selectedCat) return products;
    
    // Filter products by matching category ID
    return products.filter((p) => p.category?.id === selectedCategory);
  }, [products, selectedCategory, categoriesResponse]);

  const categories = useMemo(() => {
    const apiCategories = categoriesResponse?.success ? categoriesResponse.data : [];
    
    // Create a map of category names to IDs for matching with product.category enum
    const categoryNameMap: Record<string, string> = {};
    apiCategories.forEach(cat => {
      // Map category names (case-insensitive) to their IDs
      categoryNameMap[cat.name.toUpperCase()] = cat.id;
    });

    // Count products per category
    const counts: Record<string, number> = {
      ALL: products.length,
    };

    apiCategories.forEach(cat => {
      counts[cat.id] = 0;
    });

    products.forEach((product) => {
      // Count products by their category ID
      if (product.category?.id) {
        if (counts[product.category.id] !== undefined) {
          counts[product.category.id]++;
        }
      }
    });

    return [
      { id: 'ALL', name: 'All', count: counts.ALL },
      ...apiCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: counts[cat.id] || 0
      }))
    ];
  }, [categoriesResponse, products]);

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
          category: variant.product.category,
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
    notes?: string,
  ) => {
    try {
      const transactionNotes = notes 
        ? `Service Charge: ${serviceCharge.toFixed(2)} | Override Reason: ${notes}`
        : `Service Charge: ${serviceCharge.toFixed(2)}`;
      
      const response = await createSaleMutation.mutateAsync({
        cashbackAmount: amount,
        serviceCharge,
        payments: [
          {
            method: 'TRANSFER',
            amount: totalReceived,
            reference: `Cashback-${Date.now()}`,
            notes: transactionNotes,
          },
        ],
        transactionType: 'CASHBACK',
        notes: transactionNotes,
      });

      if (response.success && response.data) {
        toast.success('Cashback transaction completed successfully!');
      }
    } catch (error: any) {
      console.error('Cashback creation failed:', error);
      alert(
        error?.response?.data?.error?.message ||
          'Failed to complete cashback. Please try again.'
      );
    }
  };

  const handleCashbackClick = () => {
    // Check if user has access to cashback (admin always has access)
    if (user?.role !== 'ADMIN' && 
        branch?.cashbackSubdivisionId && 
        user?.assignedSubdivisionId !== branch.cashbackSubdivisionId) {
      toast.error('You are not authorized to process cashback transactions. Only cashiers in the designated cashback subdivision can perform this action.');
      return;
    }
    setIsCashbackModalOpen(true);
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

  // Show purchase interface
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Point of Sale • {branch?.name || 'N/A'}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {user?.firstName
                ? `Hello, ${user.firstName}`
                : `Hello, ${user?.username}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Show cashback button if: admin OR no subdivision assigned OR user is in the cashback subdivision */}
            {(user?.role === 'ADMIN' || !branch?.cashbackSubdivisionId || user?.assignedSubdivisionId === branch.cashbackSubdivisionId) && (
              <Button variant="secondary" size="sm" onClick={handleCashbackClick}>
                <DollarSign className="w-4 h-4 mr-2" />
                Cashback
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsExpenseFormOpen(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Expense
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
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <ProductSearch
              onSearch={handleSearch}
              onProductFound={handleProductFound}
              searchQuery={searchQuery}
            />
          </div>

          <div className="px-6 py-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProductTable
              products={filteredProducts}
              variants={variants}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="w-full md:w-96 lg:w-[420px] flex flex-col border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
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

      {/* Session End Modal */}
      <SessionEndModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />

      {/* Expense Form Modal */}
      {isExpenseFormOpen && (
        <QuickExpenseForm
          onSubmit={handleExpenseSubmit}
          onCancel={() => setIsExpenseFormOpen(false)}
          isLoading={createExpense.isPending}
          categories={expenseCategories}
        />
      )}

      {/* Cashback Modal */}
      {isCashbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setIsCashbackModalOpen(false)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">Cashback Service</h2>
              <CashbackForm
                availableCapital={branch?.cashbackCapital || 0}
                standardRate={branch?.cashbackServiceChargeRate || 0.02}
                onComplete={(amount, serviceCharge, totalReceived, notes) => {
                  handleCompleteCashback(amount, serviceCharge, totalReceived, notes);
                  setIsCashbackModalOpen(false);
                }}
                onCancel={() => setIsCashbackModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
