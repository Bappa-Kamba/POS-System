import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
export declare class VariantsController {
    private readonly variantsService;
    constructor(variantsService: VariantsService);
    create(productId: string, createVariantDto: CreateVariantDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    findAll(productId: string): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(id: string, updateVariantDto: UpdateVariantDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    adjustStock(id: string, body: {
        quantityChange: number;
        changeType: string;
        reason?: string;
        notes?: string;
    }, user: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
}
export declare class VariantsGlobalController {
    private readonly variantsService;
    constructor(variantsService: VariantsService);
    getLowStock(branchId?: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getExpiring(days?: number, branchId?: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
}
