export enum ProductCategory {
  FROZEN = 'FROZEN',
  DRINKS = 'DRINKS',
  ACCESSORIES = 'ACCESSORIES',
  OTHER = 'OTHER',
}

export enum UnitType {
  PIECE = 'PIECE',
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
}

export interface Branch {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: ProductCategory;
  hasVariants: boolean;
  costPrice?: number;
  sellingPrice?: number;
  quantityInStock?: number;
  unitType?: UnitType;
  lowStockThreshold?: number;
  taxable: boolean;
  taxRate?: number;
  trackInventory: boolean;
  isActive: boolean;
  branchId: string;
  branch?: Branch;
  createdAt: string;
  updatedAt: string;
}

