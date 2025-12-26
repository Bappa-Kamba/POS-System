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
                username: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
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
            expenses: {
                category: string;
                branchId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                amount: number;
                sessionId: string | null;
                title: string;
                date: Date;
                createdById: string | null;
            }[];
            openedBy: {
                username: string;
                email: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                branchId: string;
                assignedSubdivisionId: string | null;
                isActive: boolean;
                id: string;
                passwordHash: string;
                refreshTokenHash: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            closedBy: {
                username: string;
                email: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                branchId: string;
                assignedSubdivisionId: string | null;
                isActive: boolean;
                id: string;
                passwordHash: string;
                refreshTokenHash: string | null;
                createdAt: Date;
                updatedAt: Date;
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
