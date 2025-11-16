import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type User, type CreateUserPayload, type UpdateUserPayload, type FindAllUsersParams } from '../services/user.service';
import type { PaginatedApiResponse } from '../types/api';

export const useUsers = (params?: FindAllUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await userService.getAll(params);
      if (response.success && 'data' in response) {
        return response as PaginatedApiResponse<User>;
      }
      throw new Error('Failed to fetch users');
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await userService.getOne(id);
      if (response.success && 'data' in response) {
        return response.data;
      }
      throw new Error('Failed to fetch user');
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => {
      return userService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) => {
      return userService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

