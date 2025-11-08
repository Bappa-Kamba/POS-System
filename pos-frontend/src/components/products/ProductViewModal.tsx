import React, { useState } from 'react';
import { Edit, Printer, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { VariantManager } from './VariantManager';
import { BarcodePrint } from './BarcodePrint';
import type { Product } from '../../services/product.service';

interface ProductViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {product.name}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                SKU: {product.sku} {product.barcode && `• Barcode: ${product.barcode}`}
              </p>
            </div>
            <div className="flex gap-2">
              {product.barcode && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPrintModalOpen(true)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Barcode
                </Button>
              )}
              <Button size="sm" onClick={() => onEdit(product)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Product Info Card */}
          <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Product Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-neutral-500">Category</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  {product.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <div className="mt-1">
                  {product.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="error">Inactive</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Has Variants</p>
                <div className="mt-1">
                  {product.hasVariants ? (
                    <Badge variant="info">Yes</Badge>
                  ) : (
                    <Badge variant="neutral">No</Badge>
                  )}
                </div>
              </div>

              {!product.hasVariants && (
                <>
                  <div>
                    <p className="text-sm text-neutral-500">Cost Price</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatCurrency(product.costPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Selling Price</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                      {formatCurrency(product.sellingPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Stock</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                      {product.quantityInStock} {product.unitType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Low Stock Threshold</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                      {product.lowStockThreshold}
                    </p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-neutral-500">Taxable</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  {product.taxable ? 'Yes' : 'No'}
                </p>
              </div>

              {product.description && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-neutral-500">Description</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Variants Section */}
          {product.hasVariants && (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-6">
              <VariantManager
                productId={product.id}
                productName={product.name}
                productSku={product.sku}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button variant="secondary" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button onClick={() => onEdit(product)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Barcode Print Modal */}
      {product.barcode && (
        <BarcodePrint
          barcode={product.barcode}
          productName={product.name}
          sku={product.sku}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </>
  );
};

