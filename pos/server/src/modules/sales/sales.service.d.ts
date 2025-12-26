import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto, FindAllSalesDto } from './dto';
import { SessionsService } from '../sessions/sessions.service';
export declare class SalesService {
    private readonly prisma;
    private readonly sessionsService;
    private readonly logger;
    constructor(prisma: PrismaService, sessionsService: SessionsService);
    generateReceiptNumber(date?: Date): Promise<string>;
    create(data: CreateSaleDto, cashierId: string, branchId: string): Promise<({
        branch: {
            name: string;
            id: string;
        };
        items: {
            id: string;
            createdAt: Date;
            taxRate: number;
            total: number;
            subtotal: number;
            taxAmount: number;
            costPrice: number;
            productId: string;
            variantId: string | null;
            saleId: string;
            quantity: number;
            unitPrice: number;
            itemName: string;
            itemSku: string;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            notes: string | null;
            saleId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: number;
            reference: string | null;
        }[];
        cashier: {
            username: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        branchId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        amountPaid: number;
        amountDue: number;
        changeGiven: number;
        notes: string | null;
        transactionType: import("@prisma/client").$Enums.TransactionType;
        customerName: string | null;
        customerPhone: string | null;
        cashierId: string;
        receiptNumber: string;
        sessionId: string | null;
    }) | null>;
    findAll(params: FindAllSalesDto): Promise<{
        data: ({
            branch: {
                name: string;
                id: string;
            };
            items: ({
                product: {
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
                variant: {
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
                } | null;
            } & {
                id: string;
                createdAt: Date;
                taxRate: number;
                total: number;
                subtotal: number;
                taxAmount: number;
                costPrice: number;
                productId: string;
                variantId: string | null;
                saleId: string;
                quantity: number;
                unitPrice: number;
                itemName: string;
                itemSku: string;
            })[];
            payments: {
                id: string;
                createdAt: Date;
                notes: string | null;
                saleId: string;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: number;
                reference: string | null;
            }[];
            cashier: {
                username: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            };
        } & {
            branchId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            totalAmount: number;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            amountPaid: number;
            amountDue: number;
            changeGiven: number;
            notes: string | null;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            customerName: string | null;
            customerPhone: string | null;
            cashierId: string;
            receiptNumber: string;
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
            name: string;
            id: string;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
        };
        items: ({
            product: {
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
            variant: {
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            taxRate: number;
            total: number;
            subtotal: number;
            taxAmount: number;
            costPrice: number;
            productId: string;
            variantId: string | null;
            saleId: string;
            quantity: number;
            unitPrice: number;
            itemName: string;
            itemSku: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            notes: string | null;
            saleId: string;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: number;
            reference: string | null;
        }[];
        cashier: {
            username: string;
            firstName: string | null;
            lastName: string | null;
            id: string;
        };
    } & {
        branchId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        amountPaid: number;
        amountDue: number;
        changeGiven: number;
        notes: string | null;
        transactionType: import("@prisma/client").$Enums.TransactionType;
        customerName: string | null;
        customerPhone: string | null;
        cashierId: string;
        receiptNumber: string;
        sessionId: string | null;
    }>;
    getReceiptData(id: string): Promise<{
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
    }>;
    getDailySummary(cashierId: string, branchId: string, date?: Date): Promise<{
        date: string;
        totalSales: number;
        totalRevenue: number;
        totalProfit: number;
        paymentBreakdown: Record<string, number>;
    }>;
}
