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
        branchId: string;
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sku: string;
        barcode: string | null;
        hasVariants: boolean;
        costPrice: number | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
        lowStockThreshold: number | null;
        categoryId: string | null;
        trackInventory: boolean;
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
        } & {
            branchId: string;
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            categoryId: string | null;
            trackInventory: boolean;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        variants?: ({
            product: {
                category: {
                    name: string;
                    id: string;
                } | null;
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
    } & {
        branchId: string;
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sku: string;
        barcode: string | null;
        hasVariants: boolean;
        costPrice: number | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
        lowStockThreshold: number | null;
        categoryId: string | null;
        trackInventory: boolean;
    }>;
    update(id: string, data: UpdateProductDto, userId: string, user?: AuthenticatedRequestUser): Promise<{
        branch: {
            name: string;
            id: string;
        };
    } & {
        branchId: string;
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sku: string;
        barcode: string | null;
        hasVariants: boolean;
        costPrice: number | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
        lowStockThreshold: number | null;
        categoryId: string | null;
        trackInventory: boolean;
    }>;
    remove(id: string, userId: string, user?: AuthenticatedRequestUser): Promise<{
        branch: {
            name: string;
            id: string;
        };
    } & {
        branchId: string;
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        sku: string;
        barcode: string | null;
        hasVariants: boolean;
        costPrice: number | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
        lowStockThreshold: number | null;
        categoryId: string | null;
        trackInventory: boolean;
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
        } & {
            branchId: string;
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            sku: string;
            barcode: string | null;
            hasVariants: boolean;
            costPrice: number | null;
            sellingPrice: number | null;
            quantityInStock: number | null;
            unitType: import("@prisma/client").$Enums.UnitType;
            lowStockThreshold: number | null;
            categoryId: string | null;
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
                isActive: boolean;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                sku: string;
                barcode: string | null;
                hasVariants: boolean;
                costPrice: number | null;
                sellingPrice: number | null;
                quantityInStock: number | null;
                unitType: import("@prisma/client").$Enums.UnitType;
                lowStockThreshold: number | null;
                categoryId: string | null;
                trackInventory: boolean;
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
    } | null>;
    search(query: string, limit?: number): Promise<{
        name: string;
        id: string;
        sku: string;
        barcode: string | null;
        sellingPrice: number | null;
        quantityInStock: number | null;
        unitType: import("@prisma/client").$Enums.UnitType;
    }[]>;
    private logAudit;
}
