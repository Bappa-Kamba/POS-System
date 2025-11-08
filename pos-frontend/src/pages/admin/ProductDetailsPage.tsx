import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { VariantManager } from '../../components/products/VariantManager';
import { useProducts } from '../../hooks/useProducts';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // For now, we'll fetch all products and find the one we need
  // In a real app, you'd have a useProduct(id) hook
  const { data, isLoading } = useProducts({});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const product = data?.data?.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-neutral-500 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/products')}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              SKU: {product.sku} {product.barcode && `• Barcode: ${product.barcode}`}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/products/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Button>
      </div>

      {/* Product Info Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Product Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-neutral-500">Category</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
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
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(product.costPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Selling Price</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(product.sellingPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Stock</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {product.quantityInStock} {product.unitType}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Low Stock Threshold</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {product.lowStockThreshold}
                </p>
              </div>
            </>
          )}

          <div>
            <p className="text-sm text-neutral-500">Taxable</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
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
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
          <VariantManager 
            productId={product.id} 
            productName={product.name}
            productSku={product.sku}
          />
        </div>
      )}
    </div>
  );
};

