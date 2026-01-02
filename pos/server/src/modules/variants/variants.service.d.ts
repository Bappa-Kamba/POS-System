import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
export declare class VariantsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(productId: string, data: CreateVariantDto): Promise<{
        product: {
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            } | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    findAllByProduct(productId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
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
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            } | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
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
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            } | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
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
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
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
            id: string;
            name: string;
            branchId: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
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
            id: string;
            name: string;
            category: {
                id: string;
                name: string;
            } | null;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        costPrice: number;
        productId: string;
        sku: string;
        barcode: string | null;
        sellingPrice: number;
        quantityInStock: number;
        lowStockThreshold: number;
        attributes: string | null;
        expiryDate: Date | null;
    })[]>;
}
