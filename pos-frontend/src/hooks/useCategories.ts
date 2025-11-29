import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
} from '../types/category';

export const useCategories = (subdivisionId?: string) => {
  return useQuery({
    queryKey: ['categories', subdivisionId],
    queryFn: () => categoryService.getAll(subdivisionId),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getOne(id),
    enabled: !!id,
  });
};

export const useSubdivisionCategories = (subdivisionId: string) => {
  return useQuery({
    queryKey: ['categories', 'subdivision', subdivisionId],
    queryFn: () => categoryService.getBySubdivision(subdivisionId),
    enabled: !!subdivisionId,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({
        queryKey: ['categories', 'subdivision', variables.subdivisionId],
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoryService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderCategoriesDto) => categoryService.reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
