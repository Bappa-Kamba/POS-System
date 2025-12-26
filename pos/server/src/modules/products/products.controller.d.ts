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
            name: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            categoryId: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            branchId: string;
            id: string;
            trackInventory: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    findAll(query: FindAllProductsDto, user: AuthenticatedRequestUser): Promise<{
        variants?: ({
            product: {
                name: string;
                branchId: string;
                id: string;
                category: {
                    name: string;
                    id: string;
                } | null;
            };
        } & {
            name: string;
            sku: string;
            barcode: string | null;
            costPrice: number;
            sellingPrice: number;
            quantityInStock: number;
            lowStockThreshold: number;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
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
                name: string;
                sku: string;
                barcode: string | null;
                costPrice: number;
                sellingPrice: number;
                quantityInStock: number;
                lowStockThreshold: number;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                attributes: string | null;
                expiryDate: Date | null;
            }[];
        } & {
            name: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            categoryId: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            branchId: string;
            id: string;
            trackInventory: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            sku: string;
            barcode: string | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            id: string;
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
                    name: string;
                    sku: string;
                    barcode: string | null;
                    costPrice: number;
                    sellingPrice: number;
                    quantityInStock: number;
                    lowStockThreshold: number;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: string;
                    attributes: string | null;
                    expiryDate: Date | null;
                }[];
            } & {
                name: string;
                description: string | null;
                sku: string;
                barcode: string | null;
                categoryId: string | null;
                hasVariants: boolean;
                costPrice: number | null;
                sellingPrice: number | null;
                quantityInStock: number | null;
                unitType: import("@prisma/client").$Enums.UnitType;
                lowStockThreshold: number | null;
                branchId: string;
                id: string;
                trackInventory: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
                    name: string;
                    description: string | null;
                    sku: string;
                    barcode: string | null;
                    categoryId: string | null;
                    hasVariants: boolean;
                    costPrice: number | null;
                    sellingPrice: number | null;
                    quantityInStock: number | null;
                    unitType: import("@prisma/client").$Enums.UnitType;
                    lowStockThreshold: number | null;
                    branchId: string;
                    id: string;
                    trackInventory: boolean;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                name: string;
                sku: string;
                barcode: string | null;
                costPrice: number;
                sellingPrice: number;
                quantityInStock: number;
                lowStockThreshold: number;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
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
                name: string;
                sku: string;
                barcode: string | null;
                costPrice: number;
                sellingPrice: number;
                quantityInStock: number;
                lowStockThreshold: number;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                attributes: string | null;
                expiryDate: Date | null;
            }[];
        } & {
            name: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            categoryId: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            branchId: string;
            id: string;
            trackInventory: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            name: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            categoryId: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            branchId: string;
            id: string;
            trackInventory: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
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
            name: string;
            description: string | null;
            sku: string;
            barcode: string | null;
            categoryId: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            branchId: string;
            id: string;
            trackInventory: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
}
