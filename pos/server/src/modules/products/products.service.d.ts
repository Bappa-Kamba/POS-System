import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class ProductsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private buildAccessibleProductsWhere;
    private verifyProductAccess;
    create(data: CreateProductDto, userId: string, user: AuthenticatedRequestUser): Promise<{
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
    }>;
    findAll(params: FindAllProductsDto, user?: AuthenticatedRequestUser): Promise<{
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
        })[];
    }>;
    findOne(id: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    update(id: string, data: UpdateProductDto, userId: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    remove(id: string, userId: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    checkStock(productId: string, quantity?: number): Promise<boolean>;
    generateBarcode(): Promise<string>;
    findByBarcode(barcode: string): Promise<{
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
    } | null>;
    search(query: string, limit?: number): Promise<{
        id: string;
        name: string;
        sku: string;
        barcode: string | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
    }[]>;
    private logAudit;
}
