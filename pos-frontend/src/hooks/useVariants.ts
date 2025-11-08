import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import variantService, {
  type CreateVariantPayload,
  type UpdateVariantPayload,
} from "../services/variant.service";

export const useVariants = (productId: string) => {
  return useQuery({
    queryKey: ["variants", productId],
    queryFn: () => variantService.getAll(productId),
    enabled: !!productId,
  });
};

export const useVariant = (productId: string, variantId: string) => {
  return useQuery({
    queryKey: ["variants", productId, variantId],
    queryFn: () => variantService.getOne(productId, variantId),
    enabled: !!productId && !!variantId,
  });
};

export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateVariantPayload;
    }) => variantService.create(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: UpdateVariantPayload;
    }) => variantService.update(productId, variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.productId, variables.variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => variantService.delete(productId, variantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAdjustVariantStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: {
        quantityChange: number;
        changeType: string;
        reason?: string;
        notes?: string;
      };
    }) => variantService.adjustStock(productId, variantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.productId, variables.variantId],
      });
    },
  });
};

export const useLowStockVariants = (branchId?: string) => {
  return useQuery({
    queryKey: ["variants", "low-stock", branchId],
    queryFn: () => variantService.getLowStock(branchId),
  });
};

export const useExpiringVariants = (days?: number, branchId?: string) => {
  return useQuery({
    queryKey: ["variants", "expiring", days, branchId],
    queryFn: () => variantService.getExpiring(days, branchId),
  });
};

