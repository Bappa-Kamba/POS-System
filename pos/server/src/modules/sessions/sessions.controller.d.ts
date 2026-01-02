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
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            startTime: Date;
            endTime: Date | null;
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
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            startTime: Date;
            endTime: Date | null;
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
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            startTime: Date;
            endTime: Date | null;
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
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            startTime: Date;
            endTime: Date | null;
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
                        id: string;
                        name: string;
                        category: {
                            id: string;
                            name: string;
                        } | null;
                    };
                    variant: {
                        id: string;
                        name: string;
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
            expenses: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                category: string;
                branchId: string;
                sessionId: string | null;
                amount: number;
                title: string;
                date: Date;
                createdById: string | null;
            }[];
            openedBy: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                branchId: string;
                username: string;
                passwordHash: string;
                refreshTokenHash: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                assignedSubdivisionId: string | null;
            };
            closedBy: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                branchId: string;
                username: string;
                passwordHash: string;
                refreshTokenHash: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                assignedSubdivisionId: string | null;
            } | null;
            id: string;
            name: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            startTime: Date;
            endTime: Date | null;
            openingBalance: number;
            closingBalance: number | null;
            openedById: string;
            closedById: string | null;
        };
    }>;
}
export {};
