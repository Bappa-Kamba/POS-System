import { InventoryService } from './inventory.service';
import { AdjustStockDto, FindAllLogsDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    adjustStock(adjustStockDto: AdjustStockDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            product: {
                id: string;
                name: string;
                sku: string;
            };
            variant: {
                id: string;
                name: string;
                sku: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            productId: string;
            variantId: string | null;
            saleId: string | null;
            changeType: import("@prisma/client").$Enums.InventoryChangeType;
            quantityChange: number;
            previousQuantity: number;
            newQuantity: number;
            reason: string | null;
        };
        message: string;
    }>;
    getInventoryLogs(findAllLogsDto: FindAllLogsDto, user: AuthenticatedRequestUser): Promise<{
        data: ({
            product: {
                id: string;
                name: string;
                sku: string;
            };
            variant: {
                id: string;
                name: string;
                sku: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            productId: string;
            variantId: string | null;
            saleId: string | null;
            changeType: import("@prisma/client").$Enums.InventoryChangeType;
            quantityChange: number;
            previousQuantity: number;
            newQuantity: number;
            reason: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        success: boolean;
    }>;
    getAllInventory(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            products: {
                category: string | null;
                isVariant: boolean;
                id: string;
                name: string;
                sku: string;
                quantityInStock: number | null;
                unitType: import("@prisma/client").$Enums.UnitType;
                lowStockThreshold: number | null;
            }[];
            variants: {
                id: string;
                name: string;
                sku: string;
                productId: string;
                productName: string;
                category: string | null;
                quantityInStock: number;
                lowStockThreshold: number;
                unitType: "PIECE";
                isVariant: boolean;
            }[];
        };
    }>;
    getExpiringItems(user: AuthenticatedRequestUser, days?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            sku: string;
            productId: string;
            productName: string;
            category: string | null;
            currentStock: number;
            expiryDate: Date | null;
            daysUntilExpiry: number | null;
        }[];
    }>;
}
