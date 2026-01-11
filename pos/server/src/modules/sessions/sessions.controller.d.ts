import { SessionsService } from './sessions.service';
import { StartSessionDto, EndSessionDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
interface AuthenticatedRequest extends Request {
    user: AuthenticatedRequestUser;
}
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    startSession(req: AuthenticatedRequest, dto: StartSessionDto): Promise<{
        success: boolean;
        data: {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
            status: import("@prisma/client").$Enums.SessionStatus;
            openingBalance: number;
            closingBalance: number | null;
            openedById: string;
            closedById: string | null;
        };
        message: string;
    }>;
    endSession(req: AuthenticatedRequest, id: string, dto: EndSessionDto): Promise<{
        success: boolean;
        data: {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
            status: import("@prisma/client").$Enums.SessionStatus;
            openingBalance: number;
            closingBalance: number | null;
            openedById: string;
            closedById: string | null;
        };
        message: string;
    }>;
    getActiveSession(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: ({
            openedBy: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
            status: import("@prisma/client").$Enums.SessionStatus;
            openingBalance: number;
            closingBalance: number | null;
            openedById: string;
            closedById: string | null;
        }) | null;
    }>;
    getSessionHistory(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: ({
            openedBy: {
                firstName: string | null;
                lastName: string | null;
            };
            closedBy: {
                firstName: string | null;
                lastName: string | null;
            } | null;
        } & {
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
            status: import("@prisma/client").$Enums.SessionStatus;
            openingBalance: number;
            closingBalance: number | null;
            openedById: string;
            closedById: string | null;
        })[];
    }>;
    getSessionDetails(id: string): Promise<{
        success: boolean;
        data: {
            summary: {
                totalSales: number;
                totalRevenue: number;
                payments: {
                    cash: {
                        count: number;
                        amount: number;
                    };
                    transfer: {
                        count: number;
                        amount: number;
                    };
                    card: {
                        count: number;
                        amount: number;
                    };
                    pos: {
                        count: number;
                        amount: number;
                    };
                };
                cashback: {
                    count: number;
                    totalAmount: number;
                    totalServiceCharge: number;
                    totalReceived: number;
                };
                expenses: {
                    count: number;
                    totalAmount: number;
                    byCategory: {
                        category: string;
                        amount: number;
                    }[];
                };
                cashFlow: {
                    openingBalance: number;
                    cashSales: number;
                    cashbackPaid: number;
                    expensesPaid: number;
                    expectedCash: number;
                    actualCash: number;
                    variance: number;
                    variancePercentage: number;
                    isBalanced: boolean;
                };
                durationMinutes: number | null;
                hourlyBreakdown: {
                    hour: string;
                    salesCount: number;
                    revenue: number;
                }[];
                topProducts: {
                    name: string;
                    quantity: number;
                    revenue: number;
                }[];
                categoryBreakdown: {
                    categoryName: string;
                    itemsSold: number;
                    revenue: number;
                }[];
            };
            sales: ({
                items: ({
                    product: {
                        category: {
                            name: string;
                            id: string;
                        } | null;
                        name: string;
                        id: string;
                    };
                    variant: {
                        name: string;
                        id: string;
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
            } & {
                notes: string | null;
                transactionType: import("@prisma/client").$Enums.TransactionType;
                customerName: string | null;
                customerPhone: string | null;
                isCreditSale: boolean;
                creditReference: string | null;
                cashierId: string;
                branchId: string;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                creditStatus: import("@prisma/client").$Enums.CreditStatus | null;
                id: string;
                receiptNumber: string;
                subdivisionId: string | null;
                subtotal: number;
                taxAmount: number;
                discountAmount: number;
                totalAmount: number;
                amountPaid: number;
                amountDue: number;
                changeGiven: number;
                sessionId: string | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            expenses: {
                amount: number;
                branchId: string;
                category: string;
                id: string;
                sessionId: string | null;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                date: Date;
                createdById: string | null;
            }[];
            openedBy: {
                branchId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                email: string | null;
                passwordHash: string;
                refreshTokenHash: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                assignedSubdivisionId: string | null;
            };
            closedBy: {
                branchId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                email: string | null;
                passwordHash: string;
                refreshTokenHash: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                assignedSubdivisionId: string | null;
            } | null;
            branchId: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
            status: import("@prisma/client").$Enums.SessionStatus;
            openingBalance: number;
            closingBalance: number | null;
            openedById: string;
            closedById: string | null;
        };
    }>;
}
export {};
