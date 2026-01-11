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
                name: string;
                id: string;
            };
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            costPrice: number | null;
            description: string | null;
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
                branchId: string;
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
        })[] | undefined;
        success: boolean;
        data: ({
            branch: {
                name: string;
                id: string;
            };
            category: {
                name: string;
                id: string;
            } | null;
            variants: {
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
            }[];
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            costPrice: number | null;
            description: string | null;
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
            name: string;
            id: string;
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
                    name: string;
                    id: string;
                };
                variants: {
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
                }[];
            } & {
                branchId: string;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                costPrice: number | null;
                description: string | null;
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
                        name: string;
                        id: string;
                    };
                } & {
                    branchId: string;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    costPrice: number | null;
                    description: string | null;
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
            };
        };
        error?: undefined;
        statusCode?: undefined;
    }>;
    findOne(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            branch: {
                name: string;
                id: string;
            };
            category: {
                name: string;
                id: string;
            } | null;
            variants: {
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
            }[];
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            costPrice: number | null;
            description: string | null;
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
                name: string;
                id: string;
            };
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            costPrice: number | null;
            description: string | null;
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
                name: string;
                id: string;
            };
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            costPrice: number | null;
            description: string | null;
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
