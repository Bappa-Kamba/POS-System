"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SessionsService = class SessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSession(branchId, userId, dto) {
        const activeSession = await this.prisma.session.findFirst({
            where: {
                branchId,
                openedById: userId,
                status: client_1.SessionStatus.OPEN,
            },
        });
        if (activeSession) {
            throw new common_1.BadRequestException('You already have an active session in this branch.');
        }
        return this.prisma.session.create({
            data: {
                branchId,
                openedById: userId,
                name: dto.name,
                openingBalance: dto.openingBalance || 0,
                status: client_1.SessionStatus.OPEN,
                startTime: new Date(),
            },
        });
    }
    async endSession(sessionId, userId, dto) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        if (session.status === client_1.SessionStatus.CLOSED) {
            throw new common_1.BadRequestException('Session is already closed');
        }
        return this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: client_1.SessionStatus.CLOSED,
                endTime: new Date(),
                closingBalance: dto.closingBalance,
                closedById: userId,
            },
        });
    }
    async getActiveSession(branchId, userId) {
        return this.prisma.session.findFirst({
            where: {
                branchId,
                openedById: userId,
                status: client_1.SessionStatus.OPEN,
            },
            include: {
                openedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
        });
    }
    async getSessionHistory(branchId) {
        return this.prisma.session.findMany({
            where: {
                branchId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
            include: {
                openedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                closedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
    async getSessionDetails(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                openedBy: true,
                closedBy: true,
                sales: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        category: {
                                            select: {
                                                id: true,
                                                name: true,
                                            },
                                        },
                                    },
                                },
                                variant: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                        payments: true,
                    },
                },
                expenses: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const purchaseSales = session.sales.filter((s) => s.transactionType === 'PURCHASE');
        const cashbackSales = session.sales.filter((s) => s.transactionType === 'CASHBACK');
        const totalSales = purchaseSales.length;
        const totalRevenue = purchaseSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const paymentBreakdown = {
            cash: { count: 0, amount: 0 },
            transfer: { count: 0, amount: 0 },
            card: { count: 0, amount: 0 },
            pos: { count: 0, amount: 0 },
        };
        session.sales.forEach((sale) => {
            sale.payments.forEach((payment) => {
                const method = payment.method.toLowerCase();
                if (paymentBreakdown[method]) {
                    paymentBreakdown[method].count++;
                    paymentBreakdown[method].amount += payment.amount;
                }
            });
        });
        const cashbackSummary = {
            count: cashbackSales.length,
            totalAmount: cashbackSales.reduce((sum, s) => sum + s.totalAmount, 0),
            totalServiceCharge: cashbackSales.reduce((sum, s) => sum + (s.subtotal - s.totalAmount), 0),
            totalReceived: cashbackSales.reduce((sum, s) => sum + s.amountPaid, 0),
        };
        const expensesByCategory = {};
        session.expenses.forEach((expense) => {
            const categoryName = expense.category || 'Uncategorized';
            expensesByCategory[categoryName] =
                (expensesByCategory[categoryName] || 0) + expense.amount;
        });
        const totalExpenses = session.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const cashSalesAmount = paymentBreakdown.cash.amount;
        const cashbackPaid = cashbackSummary.totalAmount;
        const expectedCashInDrawer = session.openingBalance + cashSalesAmount - cashbackPaid - totalExpenses;
        const actualCash = session.closingBalance || 0;
        const variance = actualCash - expectedCashInDrawer;
        const variancePercentage = expectedCashInDrawer > 0 ? (variance / expectedCashInDrawer) * 100 : 0;
        const durationMinutes = session.endTime
            ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
            : null;
        const hourlyBreakdown = [];
        if (session.startTime) {
            const hourlyData = {};
            purchaseSales.forEach((sale) => {
                const hour = new Date(sale.createdAt).getHours();
                const hourKey = `${hour.toString().padStart(2, '0')}:00`;
                if (!hourlyData[hourKey]) {
                    hourlyData[hourKey] = { count: 0, revenue: 0 };
                }
                hourlyData[hourKey].count++;
                hourlyData[hourKey].revenue += sale.totalAmount;
            });
            hourlyBreakdown.push(...Object.entries(hourlyData)
                .map(([hour, data]) => ({
                hour,
                salesCount: data.count,
                revenue: data.revenue,
            }))
                .sort((a, b) => a.hour.localeCompare(b.hour)));
        }
        const productSales = {};
        purchaseSales.forEach((sale) => {
            sale.items.forEach((item) => {
                const productKey = item.variantId || item.productId;
                const productName = item.variant
                    ? `${item.product.name} - ${item.variant.name}`
                    : item.product.name;
                if (!productSales[productKey]) {
                    productSales[productKey] = {
                        name: productName,
                        quantity: 0,
                        revenue: 0,
                    };
                }
                productSales[productKey].quantity += item.quantity;
                productSales[productKey].revenue += item.total;
            });
        });
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
        const categoryBreakdown = {};
        purchaseSales.forEach((sale) => {
            sale.items.forEach((item) => {
                const categoryName = item.product.category?.name || 'Uncategorized';
                if (!categoryBreakdown[categoryName]) {
                    categoryBreakdown[categoryName] = { itemsSold: 0, revenue: 0 };
                }
                categoryBreakdown[categoryName].itemsSold += item.quantity;
                categoryBreakdown[categoryName].revenue += item.total;
            });
        });
        const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([name, data]) => ({
            categoryName: name,
            itemsSold: data.itemsSold,
            revenue: data.revenue,
        }));
        return {
            ...session,
            summary: {
                totalSales,
                totalRevenue,
                payments: paymentBreakdown,
                cashback: cashbackSummary,
                expenses: {
                    count: session.expenses.length,
                    totalAmount: totalExpenses,
                    byCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
                        category,
                        amount,
                    })),
                },
                cashFlow: {
                    openingBalance: session.openingBalance,
                    cashSales: cashSalesAmount,
                    cashbackPaid: cashbackPaid,
                    expensesPaid: totalExpenses,
                    expectedCash: expectedCashInDrawer,
                    actualCash: actualCash,
                    variance: variance,
                    variancePercentage: variancePercentage,
                    isBalanced: Math.abs(variance) < 0.01,
                },
                durationMinutes,
                hourlyBreakdown,
                topProducts,
                categoryBreakdown: categoryBreakdownArray,
            },
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map