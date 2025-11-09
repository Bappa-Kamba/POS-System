import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import saleService, {
  type CreateSalePayload,
  type FindAllSalesParams,
} from '../services/sale.service';

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalePayload) => saleService.create(data),
    onSuccess: () => {
      // Invalidate sales list and products (for stock updates)
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useSales = (params?: FindAllSalesParams) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleService.getOne(id),
    enabled: !!id,
  });
};

export const useReceipt = (id: string) => {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: () => saleService.getReceipt(id),
    enabled: !!id,
  });
};

export const useDailySummary = (date?: string) => {
  return useQuery({
    queryKey: ['daily-summary', date],
    queryFn: () => saleService.getDailySummary(date),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

