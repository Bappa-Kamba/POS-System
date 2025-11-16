import { useState, useMemo } from 'react';
import { Package, AlertTriangle, Calendar, History, Plus } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { StockAdjustmentModal } from '../../components/inventory/StockAdjustmentModal';
import { InventoryLogsTable } from '../../components/inventory/InventoryLogsTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ProductForm } from '../../components/products/ProductForm';
import { useAllInventory, useInventoryLogs, useExpiringItems } from '../../hooks/useInventory';
import { useDashboardStats, useLowStockItems } from '../../hooks/useReports';
import { useCreateProduct } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import type { InventoryItem } from '../../services/inventory.service';

type TabType = 'all' | 'low-stock' | 'expiring' | 'logs';

export const InventoryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  
  const createProduct = useCreateProduct();

  const { data: inventory, isLoading: inventoryLoading } = useAllInventory();
  const { data: stats } = useDashboardStats();
  const { data: lowStockItems } = useLowStockItems();
  const { data: expiringItems } = useExpiringItems(30);
  const { data: logsData, isLoading: logsLoading } = useInventoryLogs({
    page: logsPage,
    limit: 50,
  });

  const allItems = useMemo(() => {
    if (!inventory) return [];
    return [...inventory.products, ...inventory.variants];
  }, [inventory]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'low-stock') {
      // Convert LowStockItem to InventoryItem format
      return (lowStockItems || []).map((item): InventoryItem => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        productId: item.productId,
        category: 'OTHER', // LowStockItem doesn't have category
        quantityInStock: item.currentStock,
        lowStockThreshold: item.threshold,
        unitType: item.unitType,
        isVariant: item.isVariant,
      }));
    }
    if (activeTab === 'expiring') {
      // Convert ExpiringItem to InventoryItem format
      return (expiringItems || []).map((item): InventoryItem => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        productId: item.productId,
        category: item.category,
        quantityInStock: item.currentStock,
        lowStockThreshold: 0, // Not relevant for expiring items
        unitType: 'PIECE',
        isVariant: true,
      }));
    }
    return allItems;
  }, [activeTab, allItems, lowStockItems, expiringItems]);

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSuccess = () => {
    // Refetch data will happen automatically via query invalidation
  };

  const handleCreateProduct = async (data: any) => {
    try {
      await createProduct.mutateAsync(data);
      setIsCreateProductModalOpen(false);
    } catch (error: any) {
      alert(
        error?.response?.data?.error?.message ||
          'Failed to create product. Please try again.'
      );
    }
  };

  const getStockBadge = (stock: number, threshold: number) => {
    if (stock === 0) {
      return <Badge variant="error">Out of Stock</Badge>;
    } else if (stock <= threshold) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Inventory Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage stock levels and track inventory changes
          </p>
        </div>
        <Button
          onClick={() => setIsCreateProductModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={allItems.length}
          icon={<Package className="w-6 h-6 text-primary-600" />}
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.inventory.lowStockCount || 0}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
          variant={(stats?.inventory.lowStockCount || 0) > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Out of Stock"
          value={stats?.inventory.outOfStockCount || 0}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          variant={(stats?.inventory.outOfStockCount || 0) > 0 ? 'error' : 'default'}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringItems?.length || 0}
          subtitle={`Within 30 days`}
          icon={<Calendar className="w-6 h-6 text-orange-600" />}
          variant={expiringItems && expiringItems.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex gap-2 px-6 pt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('low-stock')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'low-stock'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Low Stock ({lowStockItems?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('expiring')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'expiring'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              Expiring ({expiringItems?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'logs'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Inventory Logs
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* All Products / Low Stock / Expiring Tab */}
          {activeTab !== 'logs' && (
            <>
              {inventoryLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <p>
                    {activeTab === 'low-stock'
                      ? 'No low stock items'
                      : activeTab === 'expiring'
                        ? 'No expiring items'
                        : 'No products found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Threshold
                        </th>
                        {activeTab === 'expiring' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Expiry Date
                          </th>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                      {filteredItems.map((item) => {
                        const expiringItem =
                          activeTab === 'expiring'
                            ? expiringItems?.find((e) => e.id === item.id)
                            : null;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {item.name}
                              </div>
                              {item.isVariant && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Variant of {item.productName}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                              {item.sku}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {getStockBadge(
                                item.quantityInStock,
                                item.lowStockThreshold
                              )}
                              <div className="text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                                {item.quantityInStock}{' '}
                                {item.unitType === 'WEIGHT' ? 'kg' : 'units'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-neutral-500 dark:text-neutral-400">
                              {item.lowStockThreshold}{' '}
                              {item.unitType === 'WEIGHT' ? 'kg' : 'units'}
                            </td>
                            {activeTab === 'expiring' && expiringItem && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="text-neutral-900 dark:text-neutral-100">
                                  {formatDate(expiringItem.expiryDate, 'medium')}
                                </div>
                                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                  {expiringItem.daysUntilExpiry} days
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAdjustStock(item)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Adjust
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Inventory Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <InventoryLogsTable
                logs={logsData?.data || []}
                isLoading={logsLoading}
              />
              {logsData && logsData.meta.lastPage > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Page {logsData.meta.page} of {logsData.meta.lastPage} (
                    {logsData.meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                      disabled={logsPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setLogsPage((p) =>
                          Math.min(logsData.meta.lastPage, p + 1)
                        )
                      }
                      disabled={logsPage >= logsData.meta.lastPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSuccess={handleAdjustSuccess}
      />

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateProductModalOpen}
        onClose={() => setIsCreateProductModalOpen(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setIsCreateProductModalOpen(false)}
          isLoading={createProduct.isPending}
          branchId={user?.branchId}
        />
      </Modal>
    </div>
  );
};

