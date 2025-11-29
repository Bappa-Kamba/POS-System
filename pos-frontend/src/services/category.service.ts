import { api } from './api';
import type { ApiResponse } from '../types/api';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
} from '../types/category';

export const categoryService = {
  async getAll(subdivisionId?: string): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams();
    if (subdivisionId) queryParams.append('subdivisionId', subdivisionId);

    const response = await api.get<ApiResponse<Category[]>>(
      `/categories?${queryParams.toString()}`
    );
    return response.data;
  },

  async getOne(id: string): Promise<ApiResponse<Category>> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  async getBySubdivision(subdivisionId: string): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>(
      `/categories/subdivision/${subdivisionId}`
    );
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateCategoryDto
  ): Promise<ApiResponse<Category>> {
    const response = await api.patch<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return response.data;
  },

  async remove(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  },

  async reorder(data: ReorderCategoriesDto): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/categories/reorder', data);
    return response.data;
  },
};
