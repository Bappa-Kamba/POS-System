/**
 * Product Subdivision Types for Frontend
 */

export enum ProductSubdivision {
  CASHBACK_ACCESSORIES = "CASHBACK_ACCESSORIES",
  FROZEN_DRINKS = "FROZEN_DRINKS",
}

export enum SubdivisionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Subdivision {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  status: SubdivisionStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    categories: number;
    branchSubdivisions: number;
  };
}

export interface CreateSubdivisionDto {
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
}

export type UpdateSubdivisionDto = Partial<CreateSubdivisionDto> & {
  status?: SubdivisionStatus;
};

export interface AssignSubdivisionDto {
  branchId: string;
  subdivisionId: string;
}

export const SubdivisionLabels: Record<ProductSubdivision, string> = {
  [ProductSubdivision.CASHBACK_ACCESSORIES]: "Cashback & Accessories",
  [ProductSubdivision.FROZEN_DRINKS]: "Frozen Products & Drinks",
};

export const SubdivisionColors: Record<ProductSubdivision, string> = {
  [ProductSubdivision.CASHBACK_ACCESSORIES]:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  [ProductSubdivision.FROZEN_DRINKS]:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

export const SubdivisionBgColors: Record<ProductSubdivision, string> = {
  [ProductSubdivision.CASHBACK_ACCESSORIES]:
    "bg-orange-50 dark:bg-orange-950/20",
  [ProductSubdivision.FROZEN_DRINKS]: "bg-blue-50 dark:bg-blue-950/20",
};
