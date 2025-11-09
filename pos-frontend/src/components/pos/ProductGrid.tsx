import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { ProductCard } from '../products/ProductCard';
import { VariantSelector } from './VariantSelector';
import type { Product } from '../../services/product.service';
import type { Variant } from '../../services/variant.service';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, variant?: Variant | null) => void;
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  isLoading = false,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    if (product.hasVariants) {
      setSelectedProduct(product);
      setIsVariantModalOpen(true);
    } else {
      onAddToCart(product);
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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-neutral-600 mb-2">
          No Products Found
        </h3>
        <p className="text-sm text-neutral-500">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="cursor-pointer"
          >
            <ProductCard
              product={product}
              onAddToCart={
                product.hasVariants ? undefined : () => onAddToCart(product)
              }
              showBarcode={false}
            />
          </div>
        ))}
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

