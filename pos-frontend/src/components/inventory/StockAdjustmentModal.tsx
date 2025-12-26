import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAdjustStock } from '../../hooks/useInventory';
import { InventoryChangeType } from '../../services/inventory.service';
import type { InventoryItem } from '../../services/inventory.service';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSuccess?: () => void;
}

const changeTypeOptions = [
  { value: InventoryChangeType.RESTOCK, label: 'Restock' },
  { value: InventoryChangeType.ADJUSTMENT, label: 'Adjustment' },
  { value: InventoryChangeType.EXPIRY, label: 'Expiry' },
  { value: InventoryChangeType.DAMAGE, label: 'Damage' },
  { value: InventoryChangeType.RETURN, label: 'Return' },
];

const reasonOptions = [
  { value: 'New stock arrived', label: 'New stock arrived' },
  { value: 'Stock count correction', label: 'Stock count correction' },
  { value: 'Damaged goods', label: 'Damaged goods' },
  { value: 'Expired items', label: 'Expired items' },
  { value: 'Returned items', label: 'Returned items' },
  { value: 'Other', label: 'Other' },
];

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const [quantityChange, setQuantityChange] = useState('');
  const [changeType, setChangeType] = useState<InventoryChangeType>(
    InventoryChangeType.ADJUSTMENT
  );
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const adjustStockMutation = useAdjustStock();

  useEffect(() => {
    if (isOpen && item) {
      setQuantityChange('');
      setChangeType(InventoryChangeType.ADJUSTMENT);
      setReason('');
      setNotes('');
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    const quantity = parseFloat(quantityChange);
    if (isNaN(quantity) || quantity === 0) {
      alert('Please enter a valid quantity change');
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        productId: item.isVariant ? item.productId! : item.id,
        variantId: item.isVariant ? item.id : undefined,
        quantityChange: quantity,
        changeType,
        reason: reason || undefined,
        notes: notes || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.message ||
          'Failed to adjust stock. Please try again.'
      );
    }
  };

  if (!item) return null;

  const currentStock = item.quantityInStock;
  const newStock = currentStock + (parseFloat(quantityChange) || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Item Info */}
        <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {item.name}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            SKU: {item.sku}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Current Stock: <span className="font-medium">{currentStock}</span>{' '}
            {item.unitType === 'WEIGHT' ? 'kg' : 'units'}
          </p>
        </div>

        {/* Quantity Change */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Quantity Change *
          </label>
          <Input
            type="text"
            value={quantityChange}
            onChange={(e) => setQuantityChange(e.target.value)}
            placeholder="Enter positive or negative number"
            required
            autoFocus
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Use positive numbers to add stock, negative to reduce
          </p>
          {quantityChange && !isNaN(parseFloat(quantityChange)) && (
            <p className="text-sm mt-2 text-neutral-600 dark:text-neutral-400">
              New Stock:{' '}
              <span
                className={`font-semibold ${
                  newStock < 0
                    ? 'text-red-600 dark:text-red-400'
                    : newStock < item.lowStockThreshold
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                }`}
              >
                {newStock.toFixed(item.unitType === 'WEIGHT' ? 1 : 0)}{' '}
                {item.unitType === 'WEIGHT' ? 'kg' : 'units'}
              </span>
            </p>
          )}
        </div>

        {/* Change Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Change Type *
          </label>
          <select
            value={changeType}
            onChange={(e) => setChangeType(e.target.value as InventoryChangeType)}
            className="w-full px-3 py-2 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800"
            required
          >
            {changeTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800"
          >
            <option value="">Select a reason (optional)</option>
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={adjustStockMutation.isPending}
            disabled={!quantityChange || parseFloat(quantityChange) === 0}
            respectLicense
          >
            Adjust Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
};

