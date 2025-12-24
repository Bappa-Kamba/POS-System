import React, { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ProductTable } from '../../components/products/ProductTable';
import { ProductForm } from '../../components/products/ProductForm';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../services/product.service';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(true);
  const [showLowStock, setShowLowStock] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const limit = 20;
  const skip = (page - 1) * limit;

  const { data, isLoading, refetch } = useProducts({
    skip,
    take: limit,
    search: search || undefined,
    categoryId: category || undefined,
    isActive,
    lowStock: showLowStock || undefined,
    branchId: user?.branchId,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setIsActive(undefined);
    } else {
      setIsActive(value === 'active');
    }
    setPage(1);
  };

  const handleCreate = async (formData: any) => {
    try {
      await createProduct.mutateAsync({
        ...formData,
        branchId: user?.branchId || '',
      });
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedProduct) return;

    try {
      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        data: {
          ...formData,
          branchId: user?.branchId || '',
        },
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    console.log(product);
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(product.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };


  const totalPages = data?.meta?.lastPage || 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Products
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your product inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProducts.size > 0 && (
            <Button
              variant="danger"
              onClick={async () => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${selectedProducts.size} product(s)?`,
                  )
                ) {
                  for (const id of selectedProducts) {
                    await deleteProduct.mutateAsync(id);
                  }
                  setSelectedProducts(new Set());
                  refetch();
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedProducts.size} Selected
            </Button>
          )}
          <Button onClick={() => setIsCreateModalOpen(true)} respectLicense>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="">All Categories</option>
              <option value="DRINKS">Drinks</option>
              <option value="FROZEN">Frozen</option>
              <option value="ACCESSORIES">Accessories</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => {
                setShowLowStock(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-primary-600 border-neutral-300 dark:border-neutral-600 rounded focus:ring-primary-500 bg-white dark:bg-neutral-800"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Show Low Stock Only
            </span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <ProductTable
            products={data?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            selectedProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
          />

        {/* Pagination */}
        {data && data.data.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {skip + 1} to {Math.min(skip + limit, data.meta.total)} of{' '}
              {data.meta.total} products
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1)
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-neutral-500 dark:text-neutral-400">...</span>
                      )}
                      <Button
                        variant={p === page ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createProduct.isPending}
          branchId={user?.branchId}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Edit Product"
        size="lg"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
            isLoading={updateProduct.isPending}
            branchId={user?.branchId}
          />
        )}
      </Modal>
    </div>
  );
};
