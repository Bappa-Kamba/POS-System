export interface Category {
  id: string;
  name: string;
  description?: string;
  subdivisionId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subdivision?: {
    id: string;
    name: string;
    displayName: string;
  };
  _count?: {
    products: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  subdivisionId: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean;
}

export interface ReorderCategoriesDto {
  categoryIds: string[];
}
