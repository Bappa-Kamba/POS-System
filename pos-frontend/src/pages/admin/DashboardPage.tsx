import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats, useLowStockItems } from '../../hooks/useReports';
import { StatCard } from '../../components/dashboard/StatCard';
import { SalesChart } from '../../components/dashboard/SalesChart';
import { RecentSales } from '../../components/dashboard/RecentSales';
import { LowStockAlert } from '../../components/dashboard/LowStockAlert';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Warehouse,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: lowStockItems } = useLowStockItems();

  if (statsLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <p className="text-neutral-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Welcome back, {user?.firstName ?? user?.username}! 🎉
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={stats.salesOverview.todaySalesCount}
          subtitle={formatCurrency(stats.salesOverview.todayRevenue)}
          change={stats.salesOverview.salesCountChange}
          icon={<ShoppingCart className="w-6 h-6 text-primary-600" />}
          variant="default"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.salesOverview.todayRevenue)}
          change={stats.salesOverview.revenueChange}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          variant="success"
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(stats.profit.grossProfit)}
          subtitle={`Margin: ${formatPercentage(stats.profit.profitMargin)}`}
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          variant="default"
        />
        <div
          onClick={() => navigate('/inventory')}
          className="cursor-pointer"
        >
          <StatCard
            title="Inventory Status"
            value={stats.inventory.totalProducts}
            subtitle={`${stats.inventory.lowStockCount} low stock, ${stats.inventory.outOfStockCount} out of stock`}
            icon={<Package className="w-6 h-6 text-yellow-600" />}
            variant={stats.inventory.lowStockCount > 0 ? 'warning' : 'default'}
          />
        </div>
      </div>

      {/* Sales Chart */}
      <SalesChart data={stats.chartData} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <RecentSales sales={stats.recentSales} />

        {/* Low Stock Alerts */}
        <div className="space-y-4">
          <LowStockAlert
            items={lowStockItems || []}
            onRestock={() => {
              navigate('/inventory');
            }}
          />
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/inventory')}
              className="w-full"
            >
              <Warehouse className="w-4 h-4 mr-2" />
              View Full Inventory
            </Button>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Top Selling Products (This Week)
            </h3>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {product.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {product.quantity} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(product.revenue)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Summary */}
      {stats.expenses.monthTotal > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Monthly Expenses
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(stats.expenses.monthTotal)}
              </p>
              {stats.expenses.topCategory && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Top category: {stats.expenses.topCategory.category} (
                  {formatCurrency(stats.expenses.topCategory.amount)})
                </p>
              )}
            </div>
            <DollarSign className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
          </div>
        </div>
      )}
    </div>
  );
};
