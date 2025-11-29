import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subdivisionService } from '../services/subdivision.service';
import type {
  CreateSubdivisionDto,
  UpdateSubdivisionDto,
  AssignSubdivisionDto,
} from '../types/subdivision';

export const useSubdivisions = () => {
  return useQuery({
    queryKey: ['subdivisions'],
    queryFn: () => subdivisionService.getAll(),
  });
};

export const useSubdivision = (id: string) => {
  return useQuery({
    queryKey: ['subdivisions', id],
    queryFn: () => subdivisionService.getOne(id),
    enabled: !!id,
  });
};

export const useBranchSubdivisions = (branchId: string) => {
  return useQuery({
    queryKey: ['subdivisions', 'branch', branchId],
    queryFn: () => subdivisionService.getByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useCreateSubdivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubdivisionDto) => subdivisionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subdivisions'] });
    },
  });
};

export const useUpdateSubdivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubdivisionDto }) =>
      subdivisionService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subdivisions'] });
      queryClient.invalidateQueries({ queryKey: ['subdivisions', id] });
    },
  });
};

export const useToggleSubdivisionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subdivisionService.toggleStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subdivisions'] });
      queryClient.invalidateQueries({ queryKey: ['subdivisions', id] });
    },
  });
};

export const useAssignSubdivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignSubdivisionDto) =>
      subdivisionService.assignToBranch(data),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['subdivisions', 'branch', branchId] });
      queryClient.invalidateQueries({ queryKey: ['branches', branchId] });
    },
  });
};

export const useRemoveSubdivisionFromBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      subdivisionId,
    }: {
      branchId: string;
      subdivisionId: string;
    }) => subdivisionService.removeFromBranch(branchId, subdivisionId),
    onSuccess: (_, { branchId }) => {
      queryClient.invalidateQueries({ queryKey: ['subdivisions', 'branch', branchId] });
      queryClient.invalidateQueries({ queryKey: ['branches', branchId] });
    },
  });
};
