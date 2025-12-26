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
    }>;
    findAll(params: FindAllProductsDto, user?: AuthenticatedRequestUser): Promise<{
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
        })[];
    }>;
    findOne(id: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    update(id: string, data: UpdateProductDto, userId: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    remove(id: string, userId: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    checkStock(productId: string, quantity?: number): Promise<boolean>;
    generateBarcode(): Promise<string>;
    findByBarcode(barcode: string): Promise<{
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
    } | null>;
    search(query: string, limit?: number): Promise<{
        name: string;
        sku: string;
        barcode: string | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
        id: string;
    }[]>;
    private logAudit;
}
