import { SalesService } from './sales.service';
import { CreateSaleDto, FindAllSalesDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: ({
            branch: {
                id: string;
                name: string;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
            items: {
                id: string;
                createdAt: Date;
                taxRate: number;
                subtotal: number;
                taxAmount: number;
                itemName: string;
                itemSku: string;
                quantity: number;
                unitPrice: number;
                costPrice: number;
                total: number;
                productId: string;
                variantId: string | null;
                saleId: string;
            }[];
            payments: {
                id: string;
                createdAt: Date;
                notes: string | null;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                saleId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            notes: string | null;
            customerName: string | null;
            customerPhone: string | null;
            sessionId: string | null;
        }) | null;
        message: string;
    }>;
    findAll(query: FindAllSalesDto, user: AuthenticatedRequestUser): Promise<{
        data: ({
            branch: {
                id: string;
                name: string;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
            items: ({
                product: {
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
                variant: {
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
                } | null;
            } & {
                id: string;
                createdAt: Date;
                taxRate: number;
                subtotal: number;
                taxAmount: number;
                itemName: string;
                itemSku: string;
                quantity: number;
                unitPrice: number;
                costPrice: number;
                total: number;
                productId: string;
                variantId: string | null;
                saleId: string;
            })[];
            payments: {
                id: string;
                createdAt: Date;
                notes: string | null;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                saleId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            notes: string | null;
            customerName: string | null;
            customerPhone: string | null;
            sessionId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        success: boolean;
    }>;
    getDailySummary(user: AuthenticatedRequestUser, date?: string): Promise<{
        success: boolean;
        data: {
            date: string;
            totalSales: number;
            totalRevenue: number;
            totalProfit: number;
            paymentBreakdown: Record<string, number>;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            branch: {
                id: string;
                name: string;
                taxRate: number;
                currency: string;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
            items: ({
                product: {
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
                variant: {
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
                } | null;
            } & {
                id: string;
                createdAt: Date;
                taxRate: number;
                subtotal: number;
                taxAmount: number;
                itemName: string;
                itemSku: string;
                quantity: number;
                unitPrice: number;
                costPrice: number;
                total: number;
                productId: string;
                variantId: string | null;
                saleId: string;
            })[];
            payments: {
                id: string;
                createdAt: Date;
                notes: string | null;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                saleId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            notes: string | null;
            customerName: string | null;
            customerPhone: string | null;
            sessionId: string | null;
        };
    }>;
    getReceipt(id: string): Promise<{
        success: boolean;
        data: {
            receipt: {
                business: {
                    name: string;
                    address: string;
                    phone: string;
                };
                branch: string;
                receiptNumber: string;
                transactionType: "PURCHASE";
                date: Date;
                cashier: string;
                items: {
                    name: string;
                    sku: string;
                    quantity: number;
                    unitPrice: number;
                    taxRate: number;
                    taxAmount: number;
                    subtotal: number;
                    total: number;
                }[];
                subtotal: number;
                tax: number;
                discount: number;
                total: number;
                payments: {
                    method: import("@prisma/client").$Enums.PaymentMethod;
                    amount: number;
                    reference: string | null;
                }[];
                change: number;
                footer: string;
                currency: string;
            };
        };
    }>;
}
