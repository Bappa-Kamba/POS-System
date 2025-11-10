import { useQuery } from '@tanstack/react-query';
import reportService, { type DashboardStats, type LowStockItem } from '../services/report.service';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await reportService.getDashboardStats();
      if (res.success && 'data' in res) {
        return res.data;
      }
      throw new Error('Failed to fetch dashboard stats');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useLowStockItems = () => {
  return useQuery<LowStockItem[]>({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: async () => {
      const res = await reportService.getLowStockItems();
      if (res.success && 'data' in res) {
        return res.data;
      }
      throw new Error('Failed to fetch low stock items');
    },
    staleTime: 5 * 60 * 1000,
  });
};

