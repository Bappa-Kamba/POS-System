import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
export declare class VariantsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(productId: string, data: CreateVariantDto): Promise<{
        product: {
            category: {
                name: string;
                id: string;
            } | null;
            name: string;
            id: string;
        };
    } & {
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    findAllByProduct(productId: string): Promise<{
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        product: {
            category: {
                name: string;
                id: string;
            } | null;
            name: string;
            id: string;
        };
    } & {
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    update(id: string, data: UpdateVariantDto): Promise<{
        product: {
            category: {
                name: string;
                id: string;
            } | null;
            name: string;
            id: string;
        };
    } & {
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    remove(id: string): Promise<{
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    checkStock(id: string, quantity: number): Promise<boolean>;
    adjustStock(params: {
        id: string;
        quantityChange: number;
        changeType: string;
        reason?: string;
        notes?: string;
        userId: string;
    }): Promise<{
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    getLowStock(branchId?: string): Promise<({
        product: {
            branchId: string;
            name: string;
            id: string;
        };
    } & {
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    })[]>;
    getExpiring(days?: number, branchId?: string): Promise<({
        product: {
            category: {
                name: string;
                id: string;
            } | null;
            name: string;
            id: string;
        };
    } & {
        productId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    })[]>;
}
