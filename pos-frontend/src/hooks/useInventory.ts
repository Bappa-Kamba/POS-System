import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import inventoryService, {
  type AdjustStockPayload,
  type AllInventory,
  type ExpiringItem,
} from '../services/inventory.service';

export interface FindAllLogsParams {
  page?: number;
  limit?: number;
  productId?: string;
  variantId?: string;
  changeType?: string;
  startDate?: string;
  endDate?: string;
}

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdjustStockPayload) =>
      inventoryService.adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useInventoryLogs = (params?: FindAllLogsParams) => {
  return useQuery({
    queryKey: ['inventory', 'logs', params],
    queryFn: async () => {
      const res = await inventoryService.getInventoryLogs(params as any);
      if (res.success && 'data' in res) {
        return res;
      }
      throw new Error('Failed to fetch inventory logs');
    },
  });
};

export const useAllInventory = () => {
  return useQuery<AllInventory>({
    queryKey: ['inventory', 'all'],
    queryFn: async () => {
      const res = await inventoryService.getAllInventory();
      if (res.success && 'data' in res) {
        return res.data;
      }
      throw new Error('Failed to fetch inventory');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExpiringItems = (days: number = 30) => {
  return useQuery<ExpiringItem[]>({
    queryKey: ['inventory', 'expiring', days],
    queryFn: async () => {
      const res = await inventoryService.getExpiringItems(days);
      if (res.success && 'data' in res) {
        return res.data;
      }
      throw new Error('Failed to fetch expiring items');
    },
  });
};

