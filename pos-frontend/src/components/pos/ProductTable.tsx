import React, { useState } from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { VariantSelector } from './VariantSelector';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';

interface ProductTableProps {
  products: Product[];
  variants?: Variant[];
  onAddToCart: (product: Product, variant?: Variant | null) => void;
  isLoading?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  variants = [],
  onAddToCart,
  isLoading = false,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

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
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  const getVariantStockBadge = (variant: Variant) => {
    if (variant.quantityInStock === 0) {
      return <Badge variant="error">Out of Stock</Badge>;
    } else if (variant.quantityInStock <= variant.lowStockThreshold) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  const handleProductClick = (product: Product) => {
    if (product.hasVariants) {
      setSelectedProduct(product);
      setIsVariantModalOpen(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleVariantClick = (variant: Variant) => {
    if (variant.product) {
      const parentProduct: Product = {
        id: variant.product.id,
        name: variant.product.name,
        category: variant.product.category as any,
        hasVariants: true,
        sku: variant.product.id,
        taxable: true,
        isActive: true,
        branchId: variant.product.id,
        createdAt: '',
        updatedAt: '',
      };
      onAddToCart(parentProduct, variant);
    }
  };

  const handleVariantSelected = (variant: Variant) => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, variant);
      setIsVariantModalOpen(false);
      setSelectedProduct(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasResults = products.length > 0 || variants.length > 0;

  if (!hasResults) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          No Products Found
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {/* Variants first (if any) */}
            {variants.map((variant) => (
              <tr
                key={`variant-${variant.id}`}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {variant.product?.name || 'Unknown Product'}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {variant.name}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-mono">
                  {variant.sku}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {formatCurrency(variant.sellingPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getVariantStockBadge(variant)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Button
                    size="sm"
                    onClick={() => handleVariantClick(variant)}
                    disabled={variant.quantityInStock === 0 || !variant.isActive}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </td>
              </tr>
            ))}

            {/* Products */}
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {product.name}
                  </div>
                  {product.description && (
                    <div className="text-xs text-neutral-500 truncate max-w-xs mt-0.5">
                      {product.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-mono">
                  {product.sku}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {product.hasVariants ? (
                    <span className="text-neutral-500">See variants</span>
                  ) : (
                    formatCurrency(product.sellingPrice)
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{getStockBadge(product)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {product.hasVariants ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setIsVariantModalOpen(true);
                      }}
                    >
                      Select Variant
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      disabled={product.quantityInStock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Variant Selector Modal */}
      {selectedProduct && (
        <VariantSelector
          product={selectedProduct}
          isOpen={isVariantModalOpen}
          onClose={() => {
            setIsVariantModalOpen(false);
            setSelectedProduct(null);
          }}
          onSelect={handleVariantSelected}
        />
      )}
    </>
  );
};

