import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
export declare class VariantsController {
    private readonly variantsService;
    constructor(variantsService: VariantsService);
    create(productId: string, createVariantDto: CreateVariantDto): Promise<{
        success: boolean;
        data: {
            product: {
                category: {
                    name: string;
                    id: string;
                } | null;
                name: string;
                id: string;
            };
        } & {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
            attributes: string | null;
            expiryDate: Date | null;
        };
        message: string;
    }>;
    findAll(productId: string): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
            attributes: string | null;
            expiryDate: Date | null;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            product: {
                category: {
                    name: string;
                    id: string;
                } | null;
                name: string;
                id: string;
            };
        } & {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
            attributes: string | null;
            expiryDate: Date | null;
        };
    }>;
    update(id: string, updateVariantDto: UpdateVariantDto): Promise<{
        success: boolean;
        data: {
            product: {
                category: {
                    name: string;
                    id: string;
                } | null;
                name: string;
                id: string;
            };
        } & {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
            attributes: string | null;
            expiryDate: Date | null;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
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
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
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
                branchId: string;
                name: string;
                id: string;
            };
        } & {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
            attributes: string | null;
            expiryDate: Date | null;
        })[];
    }>;
    getExpiring(days?: number, branchId?: string): Promise<{
        success: boolean;
        data: ({
            product: {
                category: {
                    name: string;
                    id: string;
                } | null;
                name: string;
                id: string;
            };
        } & {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            productId: string;
            attributes: string | null;
            expiryDate: Date | null;
        })[];
    }>;
}
