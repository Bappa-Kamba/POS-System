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
  // Receipt Configuration Overrides
  receiptBusinessName?: string | null;
  receiptAddress?: string | null;
  receiptPhone?: string | null;
  receiptFooter?: string | null;
  receiptLogoAssetId?: string | null;
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
  receiptBusinessName?: string | null;
  receiptAddress?: string | null;
  receiptPhone?: string | null;
  receiptFooter?: string | null;
  receiptLogoAssetId?: string | null;
};

export interface AssignSubdivisionDto {
  branchId: string;
  subdivisionId: string;
}
