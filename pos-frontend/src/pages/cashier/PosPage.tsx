import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ProductSearch } from '../../components/pos/ProductSearch';
import { ProductTable } from '../../components/pos/ProductTable';
import { Cart } from '../../components/pos/Cart';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { ReceiptPreview } from '../../components/pos/ReceiptPreview';
import { useProducts } from '../../hooks/useProducts';
import { useCartStore } from '../../store/cartStore';
import { useCreateSale, useReceipt } from '../../hooks/useSales';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';
import type { Payment } from '../../services/sale.service';
import { ProductCategory } from '../../types/product';

export const PosPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { items, getTotal, clearCart } = useCartStore();
  const createSaleMutation = useCreateSale();
  const { data: receiptData } = useReceipt(completedSaleId || '');

  const total = getTotal();

  // Fetch products
  const { data, isLoading } = useProducts({
    search: searchQuery || undefined,
    category:
      selectedCategory !== 'ALL'
        ? (selectedCategory as ProductCategory)
        : undefined,
    isActive: true,
    branchId: user?.branchId,
  });

  const products = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const variants = useMemo(() => {
    // Extract variants from response if they exist
    const allVariants = (data as any)?.variants || [];
    // Filter variants by category if category is selected
    if (selectedCategory === 'ALL') return allVariants;
    return allVariants.filter(
      (v: Variant) => v.product?.category === selectedCategory
    );
  }, [data, selectedCategory]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Category counts
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
        // For products with variants, we'd need to show variant selector
        // For now, just add the product (will need variant selection)
        return;
      }
      addItem(productData);
    } else {
      // Variant found - need to get the parent product
      const variant = product as Variant;
      if (variant.product) {
        const parentProduct: Product = {
          id: variant.product.id,
          name: variant.product.name,
          category: variant.product.category as ProductCategory,
          hasVariants: true,
          sku: variant.product.id, // Temporary
          taxable: true,
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

  const handleCompleteSale = async (payment: Payment) => {
    try {
      // Prepare sale items from cart
      const saleItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      // Create sale with single payment
      const response = await createSaleMutation.mutateAsync({
        items: saleItems,
        payments: [payment],
      });

      if (response.success && response.data) {
        // Clear cart
        clearCart();

        // Close payment modal
        setIsPaymentModalOpen(false);

        // Set completed sale ID and open receipt
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

  const handleNewSale = () => {
    setIsReceiptModalOpen(false);
    setCompletedSaleId(null);
    clearCart();
  };

  const categories = [
    { value: 'ALL', label: 'All' },
    { value: 'FROZEN', label: 'Frozen' },
    { value: 'DRINKS', label: 'Drinks' },
    { value: 'ACCESSORIES', label: 'Accessories' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Point of Sale
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {user?.firstName
                ? `Hello, ${user.firstName}`
                : `Hello, ${user?.username}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Branch</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {user?.branchId || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Product Selection (70%) */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-200 dark:border-neutral-700">
          {/* Search Bar */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <ProductSearch
              onSearch={handleSearch}
              onProductFound={handleProductFound}
              searchQuery={searchQuery}
            />
          </div>

          {/* Category Filter Tabs */}
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

          {/* Product Table */}
          <div className="flex-1 overflow-y-auto p-4">
            <ProductTable
              products={filteredProducts}
              variants={variants}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Right Panel - Cart (30%) */}
        <div className="w-full md:w-96 lg:w-[400px] flex flex-col border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <Cart onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        onComplete={handleCompleteSale}
      />

      {/* Receipt Preview Modal */}
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
        onNewSale={handleNewSale}
      />
    </div>
  );
};
