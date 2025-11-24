import React, { useMemo } from 'react';
import { ShoppingCart, Trash2, CreditCard, ArrowLeftRight } from 'lucide-react';
import { Button } from '../common/Button';
import { CartItem } from './CartItem';
import { useCartStore } from '../../store/cartStore';

interface CartProps {
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTaxAmount, getTotal } =
    useCartStore();

  const summary = useMemo(() => {
    const subtotal = getSubtotal();
    const taxAmount = getTaxAmount();
    const total = getTotal();

    return { subtotal, taxAmount, total };
  }, [items, getSubtotal, getTaxAmount, getTotal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ShoppingCart className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Cart is Empty
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Add products to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Cart
          </h2>
          <span className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-3 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Subtotal:</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>
          {summary.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Tax:</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(summary.taxAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-neutral-900 dark:text-neutral-100">Total:</span>
            <span className="text-primary-600 dark:text-primary-400">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          className="w-full"
          size="lg"
          disabled={items.length === 0}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

