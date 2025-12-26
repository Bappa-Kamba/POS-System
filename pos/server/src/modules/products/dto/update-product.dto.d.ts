import { UnitType } from '@prisma/client';
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    sku?: string;
    barcode?: string;
    category?: string;
    hasVariants?: boolean;
    costPrice?: number;
    sellingPrice?: number;
    quantityInStock?: number;
    unitType?: UnitType;
    lowStockThreshold?: number;
    branchId?: string;
}
