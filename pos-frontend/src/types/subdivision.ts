/**
 * Product Subdivision Types for Frontend
 */

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
