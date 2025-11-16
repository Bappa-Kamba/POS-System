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
  ): Promise<PaginatedApiResponse<Product> & { variants?: any[] }> {
    // Build query params manually to handle 'all' for isActive
    const queryParams: Record<string, string> = {};
    if (params?.skip !== undefined) queryParams.skip = String(params.skip);
    if (params?.take !== undefined) queryParams.take = String(params.take);
    if (params?.search) queryParams.search = params.search;
    if (params?.category) queryParams.category = params.category;
    if (params?.hasVariants !== undefined) queryParams.hasVariants = String(params.hasVariants);
    if (params?.lowStock !== undefined) queryParams.lowStock = String(params.lowStock);
    if (params?.branchId) queryParams.branchId = params.branchId;
    // Handle isActive parameter
    // When true: send 'true' (active products) - this is the default
    // When false: send 'false' (inactive products)
    // When undefined: send 'all' (all products - explicitly requested)
    if (params?.isActive === true) {
      queryParams.isActive = 'true';
    } else if (params?.isActive === false) {
      queryParams.isActive = 'false';
    } else {
      // When undefined, send 'all' to explicitly request all products
      queryParams.isActive = 'all';
    }

    const response = await api.get<PaginatedApiResponse<Product> & { variants?: any[] }>("/products", {
      params: queryParams,
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
