import { useQuery, useMutation } from '@tanstack/react-query';
import reportService, {
  type DashboardStats,
  type LowStockItem,
  type SalesReport,
  type SalesReportParams,
  type ProfitLossReport,
  type ProfitLossReportParams,
  type ExportReportParams,
} from '../services/report.service';

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

export const useSalesReport = (params: SalesReportParams, enabled = true) => {
  return useQuery<SalesReport>({
    queryKey: ['reports', 'sales', params],
    queryFn: async () => {
      const res = await reportService.getSalesReport(params);
      if (res.success && 'data' in res) {
        return res.data;
      }
      throw new Error('Failed to fetch sales report');
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useProfitLossReport = (
  params: ProfitLossReportParams,
  enabled = true,
) => {
  return useQuery<ProfitLossReport>({
    queryKey: ['reports', 'profit-loss', params],
    queryFn: async () => {
      const res = await reportService.getProfitLossReport(params);
      if (res.success && 'data' in res) {
        return res.data;
      }
      throw new Error('Failed to fetch profit & loss report');
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: async (params: ExportReportParams) => {
      const blob = await reportService.exportReport(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Determine file extension
      const extension = params.format === 'excel' ? '.csv' : '.json';
      a.download = `${params.reportType}-${params.startDate}-${params.endDate}${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
  });
};

