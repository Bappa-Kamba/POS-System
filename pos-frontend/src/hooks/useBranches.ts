import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '../services/branch.service';
import type {
  CreateBranchPayload,
  UpdateBranchPayload,
  FindAllBranchesParams,
} from '../services/branch.service';
import { toast } from 'react-hot-toast';

export function useBranches(params?: FindAllBranchesParams) {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: () => branchService.getAll(params),
  });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: ['branches', id],
    queryFn: () => branchService.getOne(id),
    enabled: !!id,
  });
}

export function useBranchStatistics(id: string) {
  return useQuery({
    queryKey: ['branches', id, 'statistics'],
    queryFn: () => branchService.getStatistics(id),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchPayload) => branchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create branch');
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchPayload }) =>
      branchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete branch');
    },
  });
}
