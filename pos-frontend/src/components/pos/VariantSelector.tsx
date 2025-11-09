import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useVariants } from '../../hooks/useVariants';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';

interface VariantSelectorProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (variant: Variant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  isOpen,
  onClose,
  onSelect,
}) => {
  const { data, isLoading } = useVariants(product.id);
  const variants = (data && 'data' in data ? data.data : []) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getStockBadge = (variant: Variant) => {
    if (variant.quantityInStock === 0) {
      return <Badge variant="error">Out of Stock</Badge>;
    } else if (variant.quantityInStock <= variant.lowStockThreshold) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select Variant - ${product.name}`} size="md">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            No variants available for this product
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  if (variant.quantityInStock > 0) {
                    onSelect(variant);
                  }
                }}
                disabled={variant.quantityInStock === 0 || !variant.isActive}
                className="w-full text-left p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {variant.name}
                      </h4>
                      {getStockBadge(variant)}
                    </div>
                    <p className="text-sm text-neutral-500">SKU: {variant.sku}</p>
                    <p className="text-sm text-neutral-500">
                      Stock: {variant.quantityInStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(variant.sellingPrice)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

