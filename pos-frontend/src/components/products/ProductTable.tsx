import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Product } from '../../services/product.service';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}) => {
  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getStockBadge = (product: Product) => {
    if (product.hasVariants) {
      return <Badge variant="info">Variants</Badge>;
    }

    if (product.quantityInStock == null) {
      return <Badge variant="neutral">N/A</Badge>;
    }

    const stock = product.quantityInStock;
    const threshold = product.lowStockThreshold || 0;

    if (stock === 0) {
      return <Badge variant="error">Out of Stock</Badge>;
    } else if (stock <= threshold) {
      return <Badge variant="warning">Low Stock ({stock})</Badge>;
    } else {
      return <Badge variant="success">In Stock ({stock})</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
      DRINKS: 'info',
      FROZEN: 'success',
      ACCESSORIES: 'warning',
      OTHER: 'neutral',
    };

    return <Badge variant={variants[category] || 'neutral'}>{category}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">No products found</p>
      </div>
    );
  }

  return (
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
              Category
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
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {product.name}
                </div>
                {product.description && (
                  <div className="text-sm text-neutral-500 truncate max-w-xs">
                    {product.description}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                {product.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                {product.barcode || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getCategoryBadge(product.category)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                {product.hasVariants ? (
                  <span className="text-neutral-500">See variants</span>
                ) : (
                  formatCurrency(product.sellingPrice)
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getStockBadge(product)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={product.isActive ? 'success' : 'error'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(product)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    title="Delete Product"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
