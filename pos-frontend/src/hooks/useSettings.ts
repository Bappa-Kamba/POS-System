import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  settingsService,
  type UpdateBranchData,
  type AdjustCashbackCapitalData,
} from '../services/settings.service';

export const useBranch = () => {
  return useQuery({
    queryKey: ["branch"],
    queryFn: () => settingsService.getBranch(),
    retry: false,
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBranchData) => settingsService.updateBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch'] });
    },
  });
};

export const useAdjustCashbackCapital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustCashbackCapitalData) =>
      settingsService.adjustCashbackCapital(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch'] });
    },
  });
};

