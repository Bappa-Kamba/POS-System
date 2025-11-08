import React from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Product } from '../../services/product.service';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showBarcode?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  showBarcode = true,
}) => {
  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getStockBadge = () => {
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

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
      DRINKS: 'info',
      FROZEN: 'success',
      ACCESSORIES: 'warning',
      OTHER: 'neutral',
    };

    return <Badge variant={variants[category] || 'neutral'}>{category}</Badge>;
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-lg transition-shadow">
      {/* Product Image Placeholder */}
      <div className="w-full h-48 bg-neutral-100 dark:bg-neutral-700 rounded-lg mb-4 flex items-center justify-center">
        <Package className="w-16 h-16 text-neutral-400" />
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
        </div>

        {/* SKU and Barcode */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>SKU:</span>
            <span className="font-mono">{product.sku}</span>
          </div>
          {showBarcode && product.barcode && (
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Barcode:</span>
              <span className="font-mono">{product.barcode}</span>
            </div>
          )}
        </div>

        {/* Category and Stock */}
        <div className="flex items-center gap-2 flex-wrap">
          {getCategoryBadge(product.category)}
          {getStockBadge()}
        </div>

        {/* Price */}
        {!product.hasVariants && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-500">Price:</span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(product.sellingPrice)}
              </span>
            </div>
            {product.quantityInStock != null && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-neutral-500">Stock:</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {product.quantityInStock} {product.unitType || 'units'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        {onAddToCart && !product.hasVariants && (
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full mt-4"
            disabled={product.quantityInStock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.quantityInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}

        {product.hasVariants && (
          <div className="text-center text-sm text-neutral-500 mt-2">
            Product has variants
          </div>
        )}
      </div>
    </div>
  );
};

