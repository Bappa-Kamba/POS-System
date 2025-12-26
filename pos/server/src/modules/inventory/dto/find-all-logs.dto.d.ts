import { InventoryChangeType } from '@prisma/client';
export declare class FindAllLogsDto {
    page?: string;
    limit?: string;
    productId?: string;
    variantId?: string;
    changeType?: InventoryChangeType;
    startDate?: string;
    endDate?: string;
}
