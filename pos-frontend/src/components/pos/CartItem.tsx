import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem as CartItemType } from '../../store/cartStore';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  const [localQuantity, setLocalQuantity] = useState<string>(item.quantity.toString());

  const itemSubtotal = item.unitPrice * item.quantity;
  const itemTotal = itemSubtotal; // No tax

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Sync local quantity when item quantity changes externally
  React.useEffect(() => {
    setLocalQuantity(item.quantity.toString());
  }, [item.quantity]);

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuantity(value);
    // Don't update cart yet - wait for blur
  };

  const handleQuantityInputBlur = () => {
    const newQuantity = parseFloat(localQuantity) || 0;
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onQuantityChange(item.id, newQuantity);
    }
  };

  const handleQuantityInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
            {item.productName}
          </h4>
          {item.variantName && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.variantName}</p>
          )}
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">SKU: {item.sku}</p>
        </div>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 ml-2"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="p-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={localQuantity}
            onChange={handleQuantityInputChange}
            onBlur={handleQuantityInputBlur}
            onKeyDown={handleQuantityInputKeyDown}
            className="w-16 text-center text-sm font-medium border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            min="0"
            max={item.availableStock}
          />
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="p-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatCurrency(item.unitPrice)} × {item.quantity}
          </p>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(itemTotal)}
          </p>
        </div>
      </div>

      {/* Stock Warning */}
      {item.quantity > item.availableStock && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
          ⚠️ Only {item.availableStock} available in stock
        </div>
      )}
    </div>
  );
};

