import { SalesService } from './sales.service';
import { CreateSaleDto, FindAllSalesDto, AddPaymentDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: ({
            items: {
                productId: string;
                variantId: string | null;
                quantity: number;
                unitPrice: number;
                id: string;
                subtotal: number;
                taxAmount: number;
                createdAt: Date;
                taxRate: number;
                itemName: string;
                itemSku: string;
                costPrice: number;
                total: number;
                saleId: string;
            }[];
            payments: {
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                notes: string | null;
                id: string;
                createdAt: Date;
                saleId: string;
            }[];
            branch: {
                name: string;
                id: string;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            notes: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            customerName: string | null;
            customerPhone: string | null;
            isCreditSale: boolean;
            creditReference: string | null;
            id: string;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
            sessionId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null;
        message: string;
    }>;
    findAll(query: FindAllSalesDto, user: AuthenticatedRequestUser): Promise<{
        data: ({
            items: ({
                product: {
                    name: string;
                    id: string;
                    branchId: string;
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
                variant: {
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
                } | null;
            } & {
                productId: string;
                variantId: string | null;
                quantity: number;
                unitPrice: number;
                id: string;
                subtotal: number;
                taxAmount: number;
                createdAt: Date;
                taxRate: number;
                itemName: string;
                itemSku: string;
                costPrice: number;
                total: number;
                saleId: string;
            })[];
            payments: {
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                notes: string | null;
                id: string;
                createdAt: Date;
                saleId: string;
            }[];
            branch: {
                name: string;
                id: string;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            notes: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            customerName: string | null;
            customerPhone: string | null;
            isCreditSale: boolean;
            creditReference: string | null;
            id: string;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
            sessionId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
            items: ({
                product: {
                    name: string;
                    id: string;
                    branchId: string;
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
                variant: {
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
                } | null;
            } & {
                productId: string;
                variantId: string | null;
                quantity: number;
                unitPrice: number;
                id: string;
                subtotal: number;
                taxAmount: number;
                createdAt: Date;
                taxRate: number;
                itemName: string;
                itemSku: string;
                costPrice: number;
                total: number;
                saleId: string;
            })[];
            payments: {
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                notes: string | null;
                id: string;
                createdAt: Date;
                saleId: string;
            }[];
            branch: {
                name: string;
                id: string;
                taxRate: number;
                currency: string;
                receiptFooter: string | null;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            notes: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            customerName: string | null;
            customerPhone: string | null;
            isCreditSale: boolean;
            creditReference: string | null;
            id: string;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
            sessionId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    addPayment(id: string, addPaymentDto: AddPaymentDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            items: ({
                product: {
                    name: string;
                    id: string;
                    branchId: string;
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
                variant: {
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
                } | null;
            } & {
                productId: string;
                variantId: string | null;
                quantity: number;
                unitPrice: number;
                id: string;
                subtotal: number;
                taxAmount: number;
                createdAt: Date;
                taxRate: number;
                itemName: string;
                itemSku: string;
                costPrice: number;
                total: number;
                saleId: string;
            })[];
            payments: {
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
                notes: string | null;
                id: string;
                createdAt: Date;
                saleId: string;
            }[];
            branch: {
                name: string;
                id: string;
            };
            cashier: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            notes: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            customerName: string | null;
            customerPhone: string | null;
            isCreditSale: boolean;
            creditReference: string | null;
            id: string;
            receiptNumber: string;
            cashierId: string;
            branchId: string;
            subdivisionId: string | null;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
            sessionId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
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
