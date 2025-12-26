import { PrismaService } from '../../prisma/prisma.service';
import { AdjustStockDto, FindAllLogsDto } from './dto';
export declare class InventoryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    adjustStock(data: AdjustStockDto, userId: string, branchId: string): Promise<{
        product: {
            name: string;
            id: string;
            sku: string;
        };
        variant: {
            name: string;
            id: string;
            sku: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        quantityChange: number;
        changeType: import("@prisma/client").$Enums.InventoryChangeType;
        reason: string | null;
        notes: string | null;
        previousQuantity: number;
        newQuantity: number;
        variantId: string | null;
        saleId: string | null;
    }>;
    getInventoryLogs(params: FindAllLogsDto, branchId: string): Promise<{
        data: ({
            product: {
                name: string;
                id: string;
                sku: string;
            };
            variant: {
                name: string;
                id: string;
                sku: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            productId: string;
            quantityChange: number;
            changeType: import("@prisma/client").$Enums.InventoryChangeType;
            reason: string | null;
            notes: string | null;
            previousQuantity: number;
            newQuantity: number;
            variantId: string | null;
            saleId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    getExpiringItems(branchId: string, days?: number): Promise<{
        id: string;
        name: string;
        sku: string;
        productId: string;
        productName: string;
        category: string | null;
        currentStock: number;
        expiryDate: Date | null;
        daysUntilExpiry: number | null;
    }[]>;
    getAllInventory(branchId: string): Promise<{
        products: {
            category: string | null;
            isVariant: boolean;
            name: string;
            id: string;
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
    }>;
    private logAudit;
}
