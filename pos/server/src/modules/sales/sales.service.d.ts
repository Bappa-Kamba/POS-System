import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto, FindAllSalesDto, AddPaymentDto } from './dto';
import { SessionsService } from '../sessions/sessions.service';
import { ReceiptResolutionService } from '../settings/receipt-resolution.service';
export declare class SalesService {
    private readonly prisma;
    private readonly sessionsService;
    private readonly receiptResolutionService;
    private readonly logger;
    constructor(prisma: PrismaService, sessionsService: SessionsService, receiptResolutionService: ReceiptResolutionService);
    generateReceiptNumber(date?: Date): Promise<string>;
    create(data: CreateSaleDto, cashierId: string, branchId: string): Promise<({
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
        isCreditSale: boolean;
        creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
        creditReference: string | null;
        sessionId: string | null;
    }) | null>;
    addPayment(saleId: string, paymentData: AddPaymentDto): Promise<{
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
        isCreditSale: boolean;
        creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
        creditReference: string | null;
        sessionId: string | null;
    }>;
    findAll(params: FindAllSalesDto): Promise<{
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
            isCreditSale: boolean;
            creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
            creditReference: string | null;
            sessionId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<{
        branch: {
            id: string;
            name: string;
            receiptFooter: string | null;
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
        isCreditSale: boolean;
        creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
        creditReference: string | null;
        sessionId: string | null;
    }>;
    getReceiptData(id: string): Promise<{
        receipt: {
            logoUrl: string | undefined;
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
    }>;
    getDailySummary(cashierId: string, branchId: string, date?: Date): Promise<{
        date: string;
        totalSales: number;
        totalRevenue: number;
        totalProfit: number;
        paymentBreakdown: Record<string, number>;
    }>;
}
