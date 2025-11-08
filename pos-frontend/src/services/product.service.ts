import { api } from "./api";
import type { ApiResponse, PaginatedApiResponse } from "../types/api";

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: "FROZEN" | "DRINKS" | "ACCESSORIES" | "OTHER";
  hasVariants: boolean;
  costPrice?: number;
  sellingPrice?: number;
  quantityInStock?: number;
  unitType?: "PIECE" | "WEIGHT" | "VOLUME";
  lowStockThreshold?: number;
  taxable: boolean;
  taxRate?: number;
  isActive: boolean;
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  hasVariants?: boolean;
  costPrice?: number;
  sellingPrice?: number;
  quantityInStock?: number;
  unitType?: string;
  lowStockThreshold?: number;
  taxable?: boolean;
  taxRate?: number;
  branchId: string;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface FindAllProductsParams {
  skip?: number;
  take?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  hasVariants?: boolean;
  lowStock?: boolean;
  branchId?: string;
}

const productService = {
  async getAll(
    params?: FindAllProductsParams
  ): Promise<PaginatedApiResponse<Product>> {
    const response = await api.get<PaginatedApiResponse<Product>>("/products", {
      params,
    });
    return response.data;
  },

  async getOne(id: string): Promise<ApiResponse<Product>> {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductPayload): Promise<ApiResponse<Product>> {
    const response = await api.post<ApiResponse<Product>>("/products", data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateProductPayload
  ): Promise<ApiResponse<Product>> {
    const response = await api.patch<ApiResponse<Product>>(
      `/products/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<Product>> {
    const response = await api.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async search(query: string, limit?: number): Promise<ApiResponse<Product[]>> {
    const response = await api.get<ApiResponse<Product[]>>("/products/search", {
      params: { q: query, limit },
    });
    return response.data;
  },

  async generateBarcode(): Promise<
    ApiResponse<{ barcode: string; format: string }>
  > {
    const response = await api.get<
      ApiResponse<{ barcode: string; format: string }>
    >("/products/generate-barcode");
    return response.data;
  },

  async findByBarcode(barcode: string): Promise<
    ApiResponse<{
      type: 'product' | 'variant';
      data: Product | any; // Variant type would need to be defined
    }>
  > {
    const response = await api.get<
      ApiResponse<{
        type: 'product' | 'variant';
        data: Product | any;
      }>
    >(`/products/by-barcode/${barcode}`);
    return response.data;
  },
};

export default productService;
