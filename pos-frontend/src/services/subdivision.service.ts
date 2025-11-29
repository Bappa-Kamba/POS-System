import { api } from './api';
import type { ApiResponse } from '../types/api';
import type {
  Subdivision,
  CreateSubdivisionDto,
  UpdateSubdivisionDto,
  AssignSubdivisionDto,
} from '../types/subdivision';

export const subdivisionService = {
  async getAll(): Promise<ApiResponse<Subdivision[]>> {
    const response = await api.get<ApiResponse<Subdivision[]>>('/subdivisions');
    return response.data;
  },

  async getOne(id: string): Promise<ApiResponse<Subdivision>> {
    const response = await api.get<ApiResponse<Subdivision>>(`/subdivisions/${id}`);
    return response.data;
  },

  async getByBranch(branchId: string): Promise<ApiResponse<Subdivision[]>> {
    const response = await api.get<ApiResponse<Subdivision[]>>(
      `/subdivisions/branch/${branchId}`
    );
    return response.data;
  },

  async getBranchSubdivisions(branchId: string): Promise<ApiResponse<Subdivision[]>> {
    const response = await api.get<ApiResponse<Subdivision[]>>(
      `/subdivisions/branch/${branchId}/details`
    );
    return response.data;
  },

  async create(data: CreateSubdivisionDto): Promise<ApiResponse<Subdivision>> {
    const response = await api.post<ApiResponse<Subdivision>>('/subdivisions', data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateSubdivisionDto
  ): Promise<ApiResponse<Subdivision>> {
    const response = await api.patch<ApiResponse<Subdivision>>(
      `/subdivisions/${id}`,
      data
    );
    return response.data;
  },

  async toggleStatus(id: string): Promise<ApiResponse<Subdivision>> {
    const response = await api.patch<ApiResponse<Subdivision>>(
      `/subdivisions/${id}/status`
    );
    return response.data;
  },

  async assignToBranch(
    data: AssignSubdivisionDto
  ): Promise<ApiResponse<Subdivision>> {
    const response = await api.post<ApiResponse<Subdivision>>(
      '/subdivisions/assign',
      data
    );
    return response.data;
  },

  async removeFromBranch(
    branchId: string,
    subdivisionId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `/subdivisions/branch/${branchId}/subdivision/${subdivisionId}`
    );
    return response.data;
  },
};
