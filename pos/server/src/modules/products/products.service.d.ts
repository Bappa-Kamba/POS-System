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
    }>;
    update(id: string, data: UpdateProductDto, userId: string, user?: AuthenticatedRequestUser): Promise<{
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
    }>;
    remove(id: string, userId: string, user?: AuthenticatedRequestUser): Promise<{
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
