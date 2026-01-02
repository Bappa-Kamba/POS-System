import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            branch: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            isActive: boolean;
            costPrice: number | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            categoryId: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            trackInventory: boolean;
        };
        message: string;
    }>;
    findAll(query: FindAllProductsDto, user: AuthenticatedRequestUser): Promise<{
        variants?: ({
            product: {
                id: string;
                name: string;
                category: {
                    id: string;
                    name: string;
                } | null;
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
        })[] | undefined;
        success: boolean;
        data: ({
            branch: {
                id: string;
                name: string;
            };
            category: {
                id: string;
                name: string;
            } | null;
            variants: {
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
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            isActive: boolean;
            costPrice: number | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            categoryId: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            trackInventory: boolean;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    search(query: string, limit?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            sku: string;
            barcode: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
        }[];
    }>;
    generateBarcode(): Promise<{
        success: boolean;
        data: {
            barcode: string;
            format: string;
        };
    }>;
    findByBarcode(barcode: string): Promise<{
        success: boolean;
        error: {
            code: string;
            message: string;
        };
        statusCode: number;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            type: "product";
            data: {
                branch: {
                    id: string;
                    name: string;
                };
                variants: {
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
            } & {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                isActive: boolean;
                costPrice: number | null;
                sku: string;
                barcode: string | null;
                hasVariants: boolean;
                categoryId: string | null;
                sellingPrice: number | null;
                quantityInStock: number | null;
                unitType: import("@prisma/client").$Enums.UnitType;
                lowStockThreshold: number | null;
                trackInventory: boolean;
            };
        } | {
            type: "variant";
            data: {
                product: {
                    branch: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    name: string;
                    description: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    branchId: string;
                    isActive: boolean;
                    costPrice: number | null;
                    sku: string;
                    barcode: string | null;
                    hasVariants: boolean;
                    categoryId: string | null;
                    sellingPrice: number | null;
                    quantityInStock: number | null;
                    unitType: import("@prisma/client").$Enums.UnitType;
                    lowStockThreshold: number | null;
                    trackInventory: boolean;
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
        };
        error?: undefined;
        statusCode?: undefined;
    }>;
    findOne(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            branch: {
                id: string;
                name: string;
            };
            category: {
                id: string;
                name: string;
            } | null;
            variants: {
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
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            isActive: boolean;
            costPrice: number | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            categoryId: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            trackInventory: boolean;
        };
    }>;
    update(id: string, updateProductDto: UpdateProductDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            branch: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            isActive: boolean;
            costPrice: number | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            categoryId: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            trackInventory: boolean;
        };
        message: string;
    }>;
    remove(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            branch: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            isActive: boolean;
            costPrice: number | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            categoryId: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            trackInventory: boolean;
        };
        message: string;
    }>;
}
