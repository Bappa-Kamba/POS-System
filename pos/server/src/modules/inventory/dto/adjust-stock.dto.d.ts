import { InventoryChangeType } from '@prisma/client';
export declare class AdjustStockDto {
    productId: string;
    variantId?: string;
    quantityChange: number;
    changeType: InventoryChangeType;
    reason?: string;
    notes?: string;
}
