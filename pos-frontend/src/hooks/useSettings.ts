import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type UpdateBranchData } from '../services/settings.service';

export const useBranch = () => {
  return useQuery({
    queryKey: ['branch'],
    queryFn: () => settingsService.getBranch(),
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

