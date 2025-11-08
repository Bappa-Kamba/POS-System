import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { VariantForm } from './VariantForm';
import {
  useVariants,
  useDeleteVariant,
} from '../../hooks/useVariants';
import type { Variant } from '../../services/variant.service';

interface VariantManagerProps {
  productId: string;
  productName: string;
  productSku: string;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  productId,
  productName,
  productSku,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const { data, isLoading, refetch } = useVariants(productId);
  const deleteVariant = useDeleteVariant();

  const variants = (data && 'data' in data ? data.data : []) || [];

  const handleEdit = (variant: Variant) => {
    setSelectedVariant(variant);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (variant: Variant) => {
    if (!confirm(`Are you sure you want to delete variant "${variant.name}"?`)) {
      return;
    }

    try {
      await deleteVariant.mutateAsync({
        productId,
        variantId: variant.id,
      });
      refetch();
    } catch (error) {
      console.error('Failed to delete variant:', error);
      alert('Failed to delete variant');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getStockBadge = (variant: Variant) => {
    const stock = variant.quantityInStock;
    const threshold = variant.lowStockThreshold;

    if (stock === 0) {
      return <Badge variant="error">Out of Stock</Badge>;
    } else if (stock <= threshold) {
      return <Badge variant="warning">Low Stock ({stock})</Badge>;
    } else {
      return <Badge variant="success">In Stock ({stock})</Badge>;
    }
  };

  const parseAttributes = (attributesJson?: string) => {
    if (!attributesJson) return null;
    try {
      return JSON.parse(attributesJson);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Product Variants
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Manage variants for {productName}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Variants List */}
      {variants.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
          <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No Variants Yet
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            Add variants like sizes, colors, or other options
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Variant
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Attributes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {variants.map((variant: Variant) => {
                const attributes = parseAttributes(variant.attributes);
                return (
                  <tr key={variant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {variant.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">{variant.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">
                        {variant.barcode || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {attributes ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(attributes).map(([key, value]) => (
                            <Badge key={key} variant="neutral">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(variant.sellingPrice)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Cost: {formatCurrency(variant.costPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStockBadge(variant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {variant.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="error">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variant)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Variant"
        size="lg"
      >
        <VariantForm
          productId={productId}
          productSku={productSku}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVariant(null);
        }}
        title="Edit Variant"
        size="lg"
      >
        {selectedVariant && (
          <VariantForm
            productId={productId}
            productSku={productSku}
            variant={selectedVariant}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedVariant(null);
              refetch();
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedVariant(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

