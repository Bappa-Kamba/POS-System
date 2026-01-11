"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const dto_1 = require("./dto");
const XLSX = __importStar(require("xlsx"));
const jspdf_1 = __importDefault(require("jspdf"));
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDateRangeByFrequency(frequency, referenceDate = new Date()) {
        const endDate = (0, date_fns_1.endOfDay)(referenceDate);
        switch (frequency) {
            case dto_1.ReportFrequency.DAILY:
                return {
                    startDate: (0, date_fns_1.startOfDay)(referenceDate),
                    endDate,
                    label: `Daily Report - ${(0, date_fns_1.format)(referenceDate, 'MMM dd, yyyy')}`,
                };
            case dto_1.ReportFrequency.WEEKLY:
                return {
                    startDate: (0, date_fns_1.startOfDay)((0, date_fns_1.startOfWeek)(referenceDate, { weekStartsOn: 1 })),
                    endDate,
                    label: `Weekly Report - Week of ${(0, date_fns_1.format)((0, date_fns_1.startOfWeek)(referenceDate, { weekStartsOn: 1 }), 'MMM dd, yyyy')}`,
                };
            case dto_1.ReportFrequency.MONTHLY:
                return {
                    startDate: (0, date_fns_1.startOfDay)((0, date_fns_1.startOfMonth)(referenceDate)),
                    endDate,
                    label: `Monthly Report - ${(0, date_fns_1.format)(referenceDate, 'MMMM yyyy')}`,
                };
            case dto_1.ReportFrequency.QUARTERLY: {
                const quarter = Math.floor(referenceDate.getMonth() / 3);
                const quarterStart = new Date(referenceDate.getFullYear(), quarter * 3, 1);
                return {
                    startDate: (0, date_fns_1.startOfDay)(quarterStart),
                    endDate,
                    label: `Q${quarter + 1} ${referenceDate.getFullYear()} Report`,
                };
            }
            case dto_1.ReportFrequency.SEMI_ANNUAL: {
                const halfYear = referenceDate.getMonth() >= 6 ? 1 : 0;
                const halfYearStart = new Date(referenceDate.getFullYear(), halfYear * 6, 1);
                return {
                    startDate: (0, date_fns_1.startOfDay)(halfYearStart),
                    endDate,
                    label: `${halfYear === 0 ? 'H1' : 'H2'} ${referenceDate.getFullYear()} Report`,
                };
            }
            case dto_1.ReportFrequency.YEARLY:
                return {
                    startDate: (0, date_fns_1.startOfDay)((0, date_fns_1.startOfYear)(referenceDate)),
                    endDate,
                    label: `Annual Report - ${referenceDate.getFullYear()}`,
                };
            default:
                return {
                    startDate: (0, date_fns_1.startOfDay)(referenceDate),
                    endDate,
                    label: `Report - ${(0, date_fns_1.format)(referenceDate, 'MMM dd, yyyy')}`,
                };
        }
    }
    async getSessionsReport(branchId, startDate, endDate, frequency) {
        const sessions = await this.prisma.session.findMany({
            where: {
                branchId,
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'CLOSED',
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
                closedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
                sales: {
                    select: {
                        totalAmount: true,
                        transactionType: true,
                    },
                },
            },
            orderBy: {
                startTime: 'desc',
            },
        });
        const groupedSessions = this.groupByFrequency(sessions, frequency);
        return {
            frequency,
            period: this.getDateRangeByFrequency(frequency, endDate),
            totalSessions: sessions.length,
            groupedSessions,
            sessions: sessions.map((session) => ({
                ...session,
                summary: {
                    totalSalesCount: session.sales.length,
                    totalRevenue: session.sales.reduce((sum, s) => sum + s.totalAmount, 0),
                    durationMinutes: session.endTime
                        ? Math.round((session.endTime.getTime() - session.startTime.getTime()) /
                            60000)
                        : 0,
                    cashVariance: (session.closingBalance || 0) -
                        (session.openingBalance +
                            session.sales
                                .filter((s) => s.transactionType === 'PURCHASE')
                                .reduce((sum, s) => sum + s.totalAmount, 0)),
                },
            })),
        };
    }
    groupByFrequency(sessions, frequency) {
        const grouped = {};
        sessions.forEach((session) => {
            let key;
            switch (frequency) {
                case dto_1.ReportFrequency.DAILY:
                    key = (0, date_fns_1.format)(session.startTime, 'yyyy-MM-dd');
                    break;
                case dto_1.ReportFrequency.WEEKLY: {
                    const weekStart = (0, date_fns_1.startOfWeek)(session.startTime, {
                        weekStartsOn: 1,
                    });
                    key = `Week of ${(0, date_fns_1.format)(weekStart, 'yyyy-MM-dd')}`;
                    break;
                }
                case dto_1.ReportFrequency.MONTHLY:
                    key = (0, date_fns_1.format)(session.startTime, 'yyyy-MM');
                    break;
                case dto_1.ReportFrequency.QUARTERLY: {
                    const quarter = Math.floor(session.startTime.getMonth() / 3);
                    key = `Q${quarter + 1} ${session.startTime.getFullYear()}`;
                    break;
                }
                case dto_1.ReportFrequency.SEMI_ANNUAL: {
                    const halfYear = session.startTime.getMonth() >= 6 ? 'H2' : 'H1';
                    key = `${halfYear} ${session.startTime.getFullYear()}`;
                    break;
                }
                case dto_1.ReportFrequency.YEARLY:
                    key = `${session.startTime.getFullYear()}`;
                    break;
                default:
                    key = (0, date_fns_1.format)(session.startTime, 'yyyy-MM-dd');
            }
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(session);
        });
        return grouped;
    }
    async getDashboardStats(branchId) {
        const today = new Date();
        const yesterday = (0, date_fns_1.subDays)(today, 1);
        const todayStart = (0, date_fns_1.startOfDay)(today);
        const todayEnd = (0, date_fns_1.endOfDay)(today);
        const yesterdayStart = (0, date_fns_1.startOfDay)(yesterday);
        const yesterdayEnd = (0, date_fns_1.endOfDay)(yesterday);
        const monthStart = (0, date_fns_1.startOfDay)(new Date(today.getFullYear(), today.getMonth(), 1));
        const todaySales = await this.prisma.sale.findMany({
            where: {
                branchId,
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: {
                items: true,
                payments: true,
            },
        });
        const yesterdaySales = await this.prisma.sale.findMany({
            where: {
                branchId,
                createdAt: {
                    gte: yesterdayStart,
                    lte: yesterdayEnd,
                },
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: {
                items: true,
                payments: true,
            },
        });
        const todayPurchaseSales = todaySales.filter((sale) => sale.transactionType === 'PURCHASE');
        const todayCashbackSales = todaySales.filter((sale) => sale.transactionType === 'CASHBACK');
        const todayPurchaseRevenue = todayPurchaseSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const todayCashbackGiven = todayCashbackSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const todayCashbackProfit = todayCashbackSales.reduce((sum, sale) => {
            const totalReceived = sale.payments.reduce((pSum, p) => pSum + p.amount, 0);
            const serviceCharge = totalReceived - sale.totalAmount;
            return sum + serviceCharge;
        }, 0);
        const todayPurchaseProfit = todayPurchaseSales.reduce((sum, sale) => {
            const saleProfit = sale.items.reduce((itemSum, item) => itemSum + (item.unitPrice - item.costPrice) * item.quantity, 0);
            return sum + saleProfit;
        }, 0);
        const todayProfit = todayPurchaseProfit + todayCashbackProfit;
        const todaySalesCount = todayPurchaseSales.length;
        const yesterdayPurchaseSales = yesterdaySales.filter((sale) => sale.transactionType === 'PURCHASE');
        const yesterdayPurchaseRevenue = yesterdayPurchaseSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const yesterdaySalesCount = yesterdayPurchaseSales.length;
        const revenueChange = yesterdayPurchaseRevenue > 0
            ? ((todayPurchaseRevenue - yesterdayPurchaseRevenue) /
                yesterdayPurchaseRevenue) *
                100
            : todayPurchaseRevenue > 0
                ? 100
                : 0;
        const salesCountChange = yesterdaySalesCount > 0
            ? ((todaySalesCount - yesterdaySalesCount) / yesterdaySalesCount) * 100
            : todaySalesCount > 0
                ? 100
                : 0;
        const monthExpenses = await this.getMonthExpenses(branchId, monthStart);
        const netProfit = todayProfit - monthExpenses / 30;
        const profitMargin = todayPurchaseRevenue > 0 ? (todayProfit / todayPurchaseRevenue) * 100 : 0;
        const inventoryStats = await this.getInventoryStats(branchId);
        const last7DaysSales = await this.getLast7DaysSales(branchId);
        const recentSales = await this.prisma.sale.findMany({
            where: {
                branchId,
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: {
                cashier: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
        const weekStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 7));
        const topProducts = await this.getTopSellingProducts(branchId, weekStart);
        const creditSales = await this.prisma.sale.findMany({
            where: {
                branchId,
                isCreditSale: true,
                creditStatus: 'OPEN',
            },
            select: {
                amountDue: true,
            },
        });
        const totalCreditDebt = creditSales.reduce((sum, sale) => sum + sale.amountDue, 0);
        return {
            salesOverview: {
                todaySalesCount,
                todayRevenue: todayPurchaseRevenue,
                revenueChange,
                salesCountChange,
            },
            creditStats: {
                totalDebt: totalCreditDebt,
                count: creditSales.length,
            },
            cashbackStats: {
                count: todayCashbackSales.length,
                totalGiven: todayCashbackGiven,
                totalProfit: todayCashbackProfit,
            },
            profit: {
                grossProfit: todayProfit,
                netProfit,
                profitMargin,
            },
            inventory: inventoryStats,
            expenses: {
                monthTotal: monthExpenses,
                topCategory: await this.getTopExpenseCategory(branchId, monthStart),
            },
            chartData: last7DaysSales,
            recentSales: recentSales.map((sale) => ({
                id: sale.id,
                receiptNumber: sale.receiptNumber,
                createdAt: sale.createdAt,
                transactionType: sale.transactionType,
                cashier: sale.cashier.firstName
                    ? `${sale.cashier.firstName} ${sale.cashier.lastName || ''}`.trim()
                    : sale.cashier.username,
                totalAmount: sale.totalAmount,
                paymentStatus: sale.paymentStatus,
            })),
            topProducts,
        };
    }
    async getInventoryStats(branchId) {
        const products = await this.prisma.product.findMany({
            where: {
                branchId,
                isActive: true,
                hasVariants: false,
            },
            select: {
                id: true,
                quantityInStock: true,
                lowStockThreshold: true,
            },
        });
        const variants = await this.prisma.productVariant.findMany({
            where: {
                isActive: true,
                product: {
                    branchId,
                    isActive: true,
                },
            },
            select: {
                id: true,
                quantityInStock: true,
                lowStockThreshold: true,
            },
        });
        let totalProducts = products.length;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        products.forEach((product) => {
            if (product.quantityInStock === null ||
                product.quantityInStock === undefined) {
                return;
            }
            if (product.quantityInStock === 0) {
                outOfStockCount++;
            }
            else if (product.lowStockThreshold !== null &&
                product.lowStockThreshold !== undefined &&
                product.quantityInStock <= product.lowStockThreshold) {
                lowStockCount++;
            }
        });
        variants.forEach((variant) => {
            totalProducts++;
            if (variant.quantityInStock === null ||
                variant.quantityInStock === undefined) {
                return;
            }
            if (variant.quantityInStock === 0) {
                outOfStockCount++;
            }
            else if (variant.lowStockThreshold !== null &&
                variant.lowStockThreshold !== undefined &&
                variant.quantityInStock <= variant.lowStockThreshold) {
                lowStockCount++;
            }
        });
        return {
            totalProducts,
            lowStockCount,
            outOfStockCount,
        };
    }
    async getLowStockItems(branchId) {
        const products = await this.prisma.product.findMany({
            where: {
                branchId,
                isActive: true,
                hasVariants: false,
                quantityInStock: {
                    not: null,
                },
                lowStockThreshold: {
                    not: null,
                },
            },
            select: {
                id: true,
                name: true,
                sku: true,
                quantityInStock: true,
                lowStockThreshold: true,
                unitType: true,
            },
        });
        const variants = await this.prisma.productVariant.findMany({
            where: {
                isActive: true,
                product: {
                    branchId,
                    isActive: true,
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    },
                },
            },
        });
        const lowStockProducts = products
            .filter((p) => p.quantityInStock !== null &&
            p.lowStockThreshold !== null &&
            p.quantityInStock <= p.lowStockThreshold)
            .map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            currentStock: p.quantityInStock,
            threshold: p.lowStockThreshold,
            unitType: p.unitType,
            isVariant: false,
        }));
        const lowStockVariants = variants
            .filter((v) => v.quantityInStock !== null &&
            v.lowStockThreshold !== null &&
            v.quantityInStock <= v.lowStockThreshold)
            .map((v) => ({
            id: v.id,
            name: `${v.product.name} (${v.name})`,
            sku: v.sku,
            currentStock: v.quantityInStock,
            threshold: v.lowStockThreshold,
            unitType: 'PIECE',
            isVariant: true,
            productId: v.productId,
        }));
        return [...lowStockProducts, ...lowStockVariants].sort((a, b) => a.currentStock - b.currentStock);
    }
    async getLast7DaysSales(branchId) {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = (0, date_fns_1.subDays)(today, i);
            const dayStart = (0, date_fns_1.startOfDay)(date);
            const dayEnd = (0, date_fns_1.endOfDay)(date);
            const sales = await this.prisma.sale.findMany({
                where: {
                    branchId,
                    createdAt: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                    paymentStatus: client_1.PaymentStatus.PAID,
                },
                include: {
                    items: true,
                },
            });
            const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const profit = sales.reduce((sum, sale) => {
                const saleProfit = sale.items.reduce((itemSum, item) => itemSum + (item.unitPrice - item.costPrice) * item.quantity, 0);
                return sum + saleProfit;
            }, 0);
            days.push({
                date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
                label: (0, date_fns_1.format)(date, 'MMM dd'),
                revenue,
                profit,
                salesCount: sales.length,
            });
        }
        return days;
    }
    async getTopSellingProducts(branchId, startDate) {
        const sales = await this.prisma.sale.findMany({
            where: {
                branchId,
                createdAt: {
                    gte: startDate,
                },
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
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
            },
        });
        const productMap = new Map();
        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                const productName = item.variant
                    ? `${item.product.name} (${item.variant.name})`
                    : item.product.name;
                const productId = item.variantId || item.productId;
                const existing = productMap.get(productId) || {
                    name: productName,
                    quantity: 0,
                    revenue: 0,
                };
                productMap.set(productId, {
                    name: productName,
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + item.total,
                });
            });
        });
        return Array.from(productMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }
    async getMonthExpenses(branchId, monthStart) {
        const expenses = await this.prisma.expense.findMany({
            where: {
                branchId,
                date: {
                    gte: monthStart,
                },
            },
            select: {
                amount: true,
            },
        });
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }
    async getTopExpenseCategory(branchId, monthStart) {
        const expenses = await this.prisma.expense.findMany({
            where: {
                branchId,
                date: {
                    gte: monthStart,
                },
            },
            select: {
                category: true,
                amount: true,
            },
        });
        const categoryMap = new Map();
        expenses.forEach((expense) => {
            const existing = categoryMap.get(expense.category) || 0;
            categoryMap.set(expense.category, existing + expense.amount);
        });
        if (categoryMap.size === 0) {
            return null;
        }
        const sorted = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
        return {
            category: sorted[0][0],
            amount: sorted[0][1],
        };
    }
    async getSalesReport(branchId, params) {
        const startDate = (0, date_fns_1.startOfDay)(new Date(params.startDate));
        const endDate = (0, date_fns_1.endOfDay)(new Date(params.endDate));
        const where = {
            branchId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            paymentStatus: client_1.PaymentStatus.PAID,
            ...(params.cashierId && { cashierId: params.cashierId }),
            ...(params.transactionType && {
                transactionType: params.transactionType,
            }),
            ...(params.sessionId && { sessionId: params.sessionId }),
        };
        const sales = await this.prisma.sale.findMany({
            where,
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
                cashier: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const purchaseSales = sales.filter((sale) => sale.transactionType === 'PURCHASE');
        const cashbackSales = sales.filter((sale) => sale.transactionType === 'CASHBACK');
        const purchaseTotalSales = purchaseSales.length;
        const purchaseTotalRevenue = purchaseSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const purchaseTotalProfit = purchaseSales.reduce((sum, sale) => {
            const saleProfit = sale.items.reduce((itemSum, item) => itemSum + (item.unitPrice - item.costPrice) * item.quantity, 0);
            return sum + saleProfit;
        }, 0);
        const cashbackTotalSales = cashbackSales.length;
        const cashbackTotalRevenue = cashbackSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const cashbackTotalProfit = cashbackSales.reduce((sum, sale) => {
            const totalReceived = sale.payments.reduce((pSum, p) => pSum + p.amount, 0);
            const serviceCharge = totalReceived - sale.totalAmount;
            return sum + serviceCharge;
        }, 0);
        const totalSales = purchaseTotalSales;
        const totalRevenue = purchaseTotalRevenue;
        const totalProfit = purchaseTotalProfit + cashbackTotalProfit;
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        const groupBy = params.groupBy || 'day';
        const breakdown = this.groupSalesByPeriod(sales, startDate, endDate, groupBy);
        const topProducts = this.getTopSellingProductsFromSales(sales);
        const categoryBreakdown = this.getCategoryBreakdown(sales);
        const paymentBreakdown = await this.getPaymentBreakdown(branchId, startDate, endDate);
        const salesByCashier = this.getSalesByCashier(sales);
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
            select: { cashbackCapital: true },
        });
        return {
            period: {
                start: (0, date_fns_1.format)(startDate, 'yyyy-MM-dd'),
                end: (0, date_fns_1.format)(endDate, 'yyyy-MM-dd'),
            },
            availableCapital: branch?.cashbackCapital || 0,
            summary: {
                totalSales,
                totalRevenue,
                totalProfit,
                averageOrderValue,
                profitMargin: purchaseTotalRevenue > 0
                    ? (purchaseTotalProfit / purchaseTotalRevenue) * 100
                    : 0,
                purchase: {
                    totalSales: purchaseTotalSales,
                    totalRevenue: purchaseTotalRevenue,
                    totalProfit: purchaseTotalProfit,
                    profitMargin: purchaseTotalRevenue > 0
                        ? (purchaseTotalProfit / purchaseTotalRevenue) * 100
                        : 0,
                },
                cashback: {
                    totalTransactions: cashbackTotalSales,
                    totalGiven: cashbackTotalRevenue,
                    serviceChargeEarned: cashbackTotalProfit,
                    serviceChargeRate: cashbackTotalRevenue > 0
                        ? (cashbackTotalProfit / cashbackTotalRevenue) * 100
                        : 0,
                },
                combined: {
                    totalProfit: purchaseTotalProfit + cashbackTotalProfit,
                    netCashFlow: purchaseTotalRevenue - cashbackTotalRevenue,
                },
            },
            breakdown,
            topProducts,
            categoryBreakdown,
            paymentBreakdown,
            salesByCashier,
            transactions: sales.map((sale) => ({
                id: sale.id,
                receiptNumber: sale.receiptNumber,
                date: sale.createdAt,
                transactionType: sale.transactionType,
                cashier: sale.cashier.firstName
                    ? `${sale.cashier.firstName} ${sale.cashier.lastName || ''}`.trim()
                    : sale.cashier.username,
                itemsCount: sale.items.length,
                subtotal: sale.subtotal,
                taxAmount: sale.taxAmount,
                totalAmount: sale.totalAmount,
                serviceCharge: sale.transactionType === 'CASHBACK'
                    ? sale.subtotal - sale.totalAmount
                    : 0,
                paymentStatus: sale.paymentStatus,
            })),
        };
    }
    async getSessionReport(branchId, sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new Error('Session not found');
        }
        return this.getSalesReport(branchId, {
            startDate: session.startTime.toISOString(),
            endDate: (session.endTime || new Date()).toISOString(),
            sessionId: sessionId,
        });
    }
    async getProfitLossReport(branchId, params) {
        const startDate = (0, date_fns_1.startOfDay)(new Date(params.startDate));
        const endDate = (0, date_fns_1.endOfDay)(new Date(params.endDate));
        const sales = await this.prisma.sale.findMany({
            where: {
                branchId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                paymentStatus: client_1.PaymentStatus.PAID,
                transactionType: 'PURCHASE',
            },
            include: {
                items: true,
            },
        });
        const salesRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const costOfGoodsSold = sales.reduce((sum, sale) => {
            const saleCOGS = sale.items.reduce((itemSum, item) => itemSum + item.costPrice * item.quantity, 0);
            return sum + saleCOGS;
        }, 0);
        const grossProfit = salesRevenue - costOfGoodsSold;
        const grossProfitMargin = salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0;
        const expenses = await this.prisma.expense.findMany({
            where: {
                branchId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const expenseBreakdown = expenses.reduce((acc, expense) => {
            const existing = acc.find((e) => e.category === expense.category);
            if (existing) {
                existing.amount += expense.amount;
            }
            else {
                acc.push({
                    category: expense.category,
                    amount: expense.amount,
                });
            }
            return acc;
        }, []);
        const netProfit = grossProfit - totalExpenses;
        const netProfitMargin = salesRevenue > 0 ? (netProfit / salesRevenue) * 100 : 0;
        return {
            period: {
                start: (0, date_fns_1.format)(startDate, 'yyyy-MM-dd'),
                end: (0, date_fns_1.format)(endDate, 'yyyy-MM-dd'),
            },
            revenue: {
                sales: salesRevenue,
                total: salesRevenue,
            },
            costs: {
                costOfGoodsSold,
                expenses: totalExpenses,
                total: costOfGoodsSold + totalExpenses,
            },
            profit: {
                gross: grossProfit,
                net: netProfit,
                grossMargin: grossProfitMargin,
                netMargin: netProfitMargin,
            },
            expenseBreakdown: expenseBreakdown.sort((a, b) => b.amount - a.amount),
        };
    }
    async exportReport(branchId, params) {
        let filename;
        if (params.reportType === dto_1.ReportType.SALES) {
            const reportData = await this.getSalesReport(branchId, {
                startDate: params.startDate,
                endDate: params.endDate,
                ...params.filters,
            });
            filename = `sales-report-${(0, date_fns_1.format)(new Date(params.startDate), 'yyyyMMdd')}-${(0, date_fns_1.format)(new Date(params.endDate), 'yyyyMMdd')}`;
            if (params.format === dto_1.ExportFormat.EXCEL) {
                return this.generateExcelReport(reportData, params.reportType, filename);
            }
            else if (params.format === dto_1.ExportFormat.CSV) {
                const csvContent = this.generateSalesReportCSV(reportData);
                return {
                    data: Buffer.from(csvContent, 'utf-8'),
                    filename: `${filename}.csv`,
                    mimeType: 'text/csv',
                };
            }
            else {
                return this.generatePDFReport(reportData, params.reportType, filename);
            }
        }
        else if (params.reportType === dto_1.ReportType.PROFIT_LOSS) {
            const reportData = await this.getProfitLossReport(branchId, {
                startDate: params.startDate,
                endDate: params.endDate,
            });
            filename = `profit-loss-${(0, date_fns_1.format)(new Date(params.startDate), 'yyyyMMdd')}-${(0, date_fns_1.format)(new Date(params.endDate), 'yyyyMMdd')}`;
            if (params.format === dto_1.ExportFormat.EXCEL) {
                return this.generateExcelReport(reportData, params.reportType, filename);
            }
            else if (params.format === dto_1.ExportFormat.CSV) {
                const csvContent = this.generateProfitLossReportCSV(reportData);
                return {
                    data: Buffer.from(csvContent, 'utf-8'),
                    filename: `${filename}.csv`,
                    mimeType: 'text/csv',
                };
            }
            else {
                return this.generatePDFReport(reportData, params.reportType, filename);
            }
        }
        else if (params.reportType === dto_1.ReportType.CASHBACK) {
            const reportData = await this.getSalesReport(branchId, {
                startDate: params.startDate,
                endDate: params.endDate,
                transactionType: 'CASHBACK',
            });
            filename = `cashback-report-${(0, date_fns_1.format)(new Date(params.startDate), 'yyyyMMdd')}-${(0, date_fns_1.format)(new Date(params.endDate), 'yyyyMMdd')}`;
            if (params.format === dto_1.ExportFormat.EXCEL) {
                return this.generateExcelReport(reportData, params.reportType, filename);
            }
            else if (params.format === dto_1.ExportFormat.CSV) {
                const csvContent = this.generateSalesReportCSV(reportData);
                return {
                    data: Buffer.from(csvContent, 'utf-8'),
                    filename: `${filename}.csv`,
                    mimeType: 'text/csv',
                };
            }
            else {
                return this.generatePDFReport(reportData, params.reportType, filename);
            }
        }
        else {
            throw new Error('Unsupported report type');
        }
    }
    groupSalesByPeriod(sales, startDate, endDate, groupBy) {
        const grouped = new Map();
        sales.forEach((sale) => {
            const saleDate = new Date(sale.createdAt);
            let key;
            switch (groupBy) {
                case 'week':
                    key = (0, date_fns_1.format)((0, date_fns_1.startOfWeek)(saleDate), 'yyyy-MM-dd');
                    break;
                case 'month':
                    key = (0, date_fns_1.format)((0, date_fns_1.startOfMonth)(saleDate), 'yyyy-MM');
                    break;
                default:
                    key = (0, date_fns_1.format)(saleDate, 'yyyy-MM-dd');
            }
            const existing = grouped.get(key) || { sales: 0, revenue: 0, profit: 0 };
            let saleProfit = 0;
            if (sale.transactionType === 'CASHBACK') {
                const totalReceived = sale.payments.reduce((pSum, p) => pSum + p.amount, 0);
                saleProfit = totalReceived - sale.totalAmount;
            }
            else {
                saleProfit = sale.items.reduce((sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity, 0);
            }
            grouped.set(key, {
                sales: existing.sales + 1,
                revenue: existing.revenue + sale.totalAmount,
                profit: existing.profit + saleProfit,
            });
        });
        return Array.from(grouped.entries()).map(([date, data]) => ({
            date,
            ...data,
        }));
    }
    getTopSellingProductsFromSales(sales) {
        const productMap = new Map();
        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                const productName = item.variant
                    ? `${item.product.name} (${item.variant.name})`
                    : item.product.name;
                const productId = item.variantId ?? item.productId;
                const existing = productMap.get(productId) || {
                    name: productName,
                    quantity: 0,
                    revenue: 0,
                };
                productMap.set(productId, {
                    name: productName,
                    quantity: existing.quantity + item.quantity,
                    revenue: existing.revenue + item.total,
                });
            });
        });
        return Array.from(productMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    }
    getCategoryBreakdown(sales) {
        const categoryMap = new Map();
        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                const categoryName = item.product.category?.name || 'Uncategorized';
                const existing = categoryMap.get(categoryName) || 0;
                categoryMap.set(categoryName, existing + item.total);
            });
        });
        return Array.from(categoryMap.entries()).map(([category, revenue]) => ({
            category,
            revenue,
        }));
    }
    async getPaymentBreakdown(branchId, startDate, endDate) {
        const payments = await this.prisma.payment.findMany({
            where: {
                sale: {
                    branchId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    paymentStatus: client_1.PaymentStatus.PAID,
                },
            },
            select: {
                method: true,
                amount: true,
            },
        });
        const breakdown = payments.reduce((acc, payment) => {
            const existing = acc.find((p) => p.method === payment.method);
            if (existing) {
                existing.amount += payment.amount;
            }
            else {
                acc.push({
                    method: payment.method,
                    amount: payment.amount,
                });
            }
            return acc;
        }, []);
        return breakdown;
    }
    getSalesByCashier(sales) {
        const cashierMap = new Map();
        sales.forEach((sale) => {
            const cashierName = sale.cashier.firstName
                ? `${sale.cashier.firstName} ${sale.cashier.lastName || ''}`.trim()
                : sale.cashier.username;
            const cashierId = sale.cashier.id;
            const existing = cashierMap.get(cashierId) || {
                name: cashierName,
                sales: 0,
                revenue: 0,
            };
            cashierMap.set(cashierId, {
                name: cashierName,
                sales: existing.sales + 1,
                revenue: existing.revenue + sale.totalAmount,
            });
        });
        return Array.from(cashierMap.values()).sort((a, b) => b.revenue - a.revenue);
    }
    generateExcelReport(reportData, reportType, filename) {
        const workbook = XLSX.utils.book_new();
        if (reportType === dto_1.ReportType.SALES) {
            const salesData = reportData;
            this.addSalesReportToWorkbook(workbook, salesData);
        }
        else if (reportType === dto_1.ReportType.PROFIT_LOSS) {
            const profitLossData = reportData;
            this.addProfitLossReportToWorkbook(workbook, profitLossData);
        }
        else if (reportType === dto_1.ReportType.CASHBACK) {
            const salesData = reportData;
            this.addCashbackReportToWorkbook(workbook, salesData);
        }
        const excelBuffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        });
        return {
            data: excelBuffer,
            filename: `${filename}.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
    }
    generatePDFReport(reportData, reportType, filename) {
        const doc = new jspdf_1.default();
        if (reportType === dto_1.ReportType.SALES) {
            this.addSalesReportToPDF(doc, reportData);
        }
        else if (reportType === dto_1.ReportType.PROFIT_LOSS) {
            this.addProfitLossReportToPDF(doc, reportData);
        }
        else if (reportType === dto_1.ReportType.CASHBACK) {
            this.addCashbackReportToPDF(doc, reportData);
        }
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return {
            data: pdfBuffer,
            filename: `${filename}.pdf`,
            mimeType: 'application/pdf',
        };
    }
    generateSalesReportCSV(reportData) {
        const lines = [];
        lines.push('Sales Report');
        lines.push(`Period: ${reportData.period.start} to ${reportData.period.end}`);
        lines.push('');
        lines.push('Summary');
        lines.push(`Total Sales,${reportData.summary.totalSales}`);
        lines.push(`Total Revenue,${reportData.summary.totalRevenue.toFixed(2)}`);
        lines.push(`Total Profit,${reportData.summary.totalProfit.toFixed(2)}`);
        lines.push(`Average Order Value,${reportData.summary.averageOrderValue.toFixed(2)}`);
        lines.push('');
        lines.push('Daily Breakdown');
        lines.push('Date,Sales,Revenue,Profit');
        reportData.breakdown.forEach((item) => {
            lines.push(`${item.date},${item.sales},${item.revenue.toFixed(2)},${item.profit.toFixed(2)}`);
        });
        lines.push('');
        lines.push('Top Products');
        lines.push('Product,Quantity,Revenue');
        reportData.topProducts.forEach((product) => {
            lines.push(`${product.name},${product.quantity},${product.revenue.toFixed(2)}`);
        });
        return lines.join('\n');
    }
    generateProfitLossReportCSV(reportData) {
        const lines = [];
        lines.push('Profit & Loss Report');
        lines.push(`Period: ${reportData.period.start} to ${reportData.period.end}`);
        lines.push('');
        lines.push('Revenue');
        lines.push(`Sales,${reportData.revenue.sales.toFixed(2)}`);
        lines.push(`Total Revenue,${reportData.revenue.total.toFixed(2)}`);
        lines.push('');
        lines.push('Costs');
        lines.push(`Cost of Goods Sold,${reportData.costs.costOfGoodsSold.toFixed(2)}`);
        lines.push(`Operating Expenses,${reportData.costs.expenses.toFixed(2)}`);
        lines.push(`Total Costs,${reportData.costs.total.toFixed(2)}`);
        lines.push('');
        lines.push('Profit');
        lines.push(`Gross Profit,${reportData.profit.gross.toFixed(2)}`);
        lines.push(`Gross Margin,${reportData.profit.grossMargin.toFixed(2)}%`);
        lines.push(`Net Profit,${reportData.profit.net.toFixed(2)}`);
        lines.push(`Net Margin,${reportData.profit.netMargin.toFixed(2)}%`);
        lines.push('');
        lines.push('Expense Breakdown');
        lines.push('Category,Amount');
        reportData.expenseBreakdown.forEach((expense) => {
            lines.push(`${expense.category},${expense.amount.toFixed(2)}`);
        });
        return lines.join('\n');
    }
    addSalesReportToWorkbook(workbook, reportData) {
        const summaryData = [
            ['Sales Report Summary'],
            ['Period', `${reportData.period.start} to ${reportData.period.end}`],
            [],
            ['Metric', 'Value'],
            ['Total Sales', reportData.summary.totalSales],
            ['Total Revenue', reportData.summary.totalRevenue],
            ['Total Profit', reportData.summary.totalProfit],
            ['Average Order Value', reportData.summary.averageOrderValue],
            ['Profit Margin (%)', reportData.summary.profitMargin],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        const purchaseData = [
            ['Purchase Transactions'],
            [],
            ['Metric', 'Value'],
            ['Total Sales', reportData.summary.purchase.totalSales],
            ['Total Revenue', reportData.summary.purchase.totalRevenue],
            ['Total Profit', reportData.summary.purchase.totalProfit],
            ['Profit Margin (%)', reportData.summary.purchase.profitMargin],
        ];
        const purchaseSheet = XLSX.utils.aoa_to_sheet(purchaseData);
        XLSX.utils.book_append_sheet(workbook, purchaseSheet, 'Purchase Details');
        const cashbackData = [
            ['Cashback Service'],
            [],
            ['Metric', 'Value'],
            ['Total Transactions', reportData.summary.cashback.totalTransactions],
            ['Total Given', reportData.summary.cashback.totalGiven],
            [
                'Service Charge Earned',
                reportData.summary.cashback.serviceChargeEarned,
            ],
            [
                'Service Charge Rate (%)',
                reportData.summary.cashback.serviceChargeRate,
            ],
        ];
        const cashbackSheet = XLSX.utils.aoa_to_sheet(cashbackData);
        XLSX.utils.book_append_sheet(workbook, cashbackSheet, 'Cashback Details');
        const breakdownData = [
            ['Date', 'Sales', 'Revenue', 'Profit'],
            ...reportData.breakdown.map((item) => [
                item.date,
                item.sales,
                item.revenue,
                item.profit,
            ]),
        ];
        const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownData);
        XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Breakdown');
        const topProductsData = [
            ['Product', 'Quantity', 'Revenue'],
            ...reportData.topProducts.map((product) => [
                product.name,
                product.quantity,
                product.revenue,
            ]),
        ];
        const topProductsSheet = XLSX.utils.aoa_to_sheet(topProductsData);
        XLSX.utils.book_append_sheet(workbook, topProductsSheet, 'Top Products');
        const transactionsData = [
            [
                'Receipt #',
                'Date',
                'Cashier',
                'Items',
                'Subtotal',
                'Tax',
                'Total',
                'Status',
            ],
            ...reportData.transactions.map((tx) => [
                tx.receiptNumber,
                (0, date_fns_1.format)(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
                tx.cashier,
                tx.itemsCount,
                tx.subtotal,
                tx.taxAmount,
                tx.totalAmount,
                tx.paymentStatus,
            ]),
        ];
        const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    }
    addProfitLossReportToWorkbook(workbook, reportData) {
        const summaryData = [
            ['Profit & Loss Report'],
            ['Period', `${reportData.period.start} to ${reportData.period.end}`],
            [],
            ['Revenue'],
            ['Sales', reportData.revenue.sales],
            ['Total Revenue', reportData.revenue.total],
            [],
            ['Costs'],
            ['Cost of Goods Sold', reportData.costs.costOfGoodsSold],
            ['Operating Expenses', reportData.costs.expenses],
            ['Total Costs', reportData.costs.total],
            [],
            ['Profit'],
            ['Gross Profit', reportData.profit.gross],
            ['Gross Margin (%)', reportData.profit.grossMargin],
            ['Net Profit', reportData.profit.net],
            ['Net Margin (%)', reportData.profit.netMargin],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        const expenseData = [
            ['Category', 'Amount'],
            ...reportData.expenseBreakdown.map((expense) => [
                expense.category,
                expense.amount,
            ]),
        ];
        const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
    }
    addSalesReportToPDF(doc, reportData) {
        doc.setFontSize(18);
        doc.text('Sales Report', 14, 20);
        doc.setFontSize(12);
        doc.text(`Period: ${reportData.period.start} to ${reportData.period.end}`, 14, 30);
        let yPos = 45;
        doc.setFontSize(14);
        doc.text('Summary', 14, yPos);
        yPos += 10;
        const summaryData = [
            ['Metric', 'Value'],
            ['Total Sales', reportData.summary.totalSales.toString()],
            ['Total Revenue', `N${reportData.summary.totalRevenue.toFixed(2)}`],
            ['Total Profit', `N${reportData.summary.totalProfit.toFixed(2)}`],
            [
                'Average Order Value',
                `N${reportData.summary.averageOrderValue.toFixed(2)}`,
            ],
            ['Profit Margin', `${reportData.summary.profitMargin.toFixed(2)}%`],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Purchase Transactions', 14, yPos);
        yPos += 10;
        const purchaseData = [
            ['Metric', 'Value'],
            ['Total Sales', reportData.summary.purchase.totalSales.toString()],
            [
                'Total Revenue',
                `N${reportData.summary.purchase.totalRevenue.toFixed(2)}`,
            ],
            [
                'Total Profit',
                `N${reportData.summary.purchase.totalProfit.toFixed(2)}`,
            ],
            [
                'Profit Margin',
                `${reportData.summary.purchase.profitMargin.toFixed(2)}%`,
            ],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [purchaseData[0]],
            body: purchaseData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [40, 167, 69] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Cashback Service', 14, yPos);
        yPos += 10;
        const cashbackData = [
            ['Metric', 'Value'],
            [
                'Total Transactions',
                reportData.summary.cashback.totalTransactions.toString(),
            ],
            ['Total Given', `N${reportData.summary.cashback.totalGiven.toFixed(2)}`],
            [
                'Service Charge Earned',
                `N${reportData.summary.cashback.serviceChargeEarned.toFixed(2)}`,
            ],
            [
                'Service Charge Rate',
                `${reportData.summary.cashback.serviceChargeRate.toFixed(2)}%`,
            ],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [cashbackData[0]],
            body: cashbackData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [249, 115, 22] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Daily Breakdown', 14, yPos);
        yPos += 10;
        const breakdownData = reportData.breakdown.map((item) => [
            item.date,
            item.sales.toString(),
            `N${item.revenue.toFixed(2)}`,
            `N${item.profit.toFixed(2)}`,
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [['Date', 'Sales', 'Revenue', 'Profit']],
            body: breakdownData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Top Products', 14, yPos);
        yPos += 10;
        const topProductsData = reportData.topProducts.map((product) => [
            product.name,
            product.quantity.toString(),
            `N${product.revenue.toFixed(2)}`,
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [['Product', 'Quantity', 'Revenue']],
            body: topProductsData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
    }
    addProfitLossReportToPDF(doc, reportData) {
        doc.setFontSize(18);
        doc.text('Profit & Loss Report', 14, 20);
        doc.setFontSize(12);
        doc.text(`Period: ${reportData.period.start} to ${reportData.period.end}`, 14, 30);
        let yPos = 45;
        doc.setFontSize(14);
        doc.text('Revenue', 14, yPos);
        yPos += 10;
        const revenueData = [
            ['Sales', `N${reportData.revenue.sales.toFixed(2)}`],
            ['Total Revenue', `N${reportData.revenue.total.toFixed(2)}`],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            body: revenueData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Costs', 14, yPos);
        yPos += 10;
        const costsData = [
            ['Cost of Goods Sold', `N${reportData.costs.costOfGoodsSold.toFixed(2)}`],
            ['Operating Expenses', `N${reportData.costs.expenses.toFixed(2)}`],
            ['Total Costs', `N${reportData.costs.total.toFixed(2)}`],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            body: costsData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Profit', 14, yPos);
        yPos += 10;
        const profitData = [
            ['Gross Profit', `N${reportData.profit.gross.toFixed(2)}`],
            ['Gross Margin', `${reportData.profit.grossMargin.toFixed(2)}%`],
            ['Net Profit', `N${reportData.profit.net.toFixed(2)}`],
            ['Net Margin', `${reportData.profit.netMargin.toFixed(2)}%`],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            body: profitData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Expense Breakdown', 14, yPos);
        yPos += 10;
        const expenseData = reportData.expenseBreakdown.map((expense) => [
            expense.category,
            `N${expense.amount.toFixed(2)}`,
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [['Category', 'Amount']],
            body: expenseData,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] },
        });
    }
    addCashbackReportToWorkbook(workbook, reportData) {
        const summaryData = [
            ['Cashback Report Summary'],
            ['Period', `${reportData.period.start} to ${reportData.period.end}`],
            [],
            ['Metric', 'Value'],
            ['Total Transactions', reportData.summary.cashback.totalTransactions],
            ['Total Amount Given', reportData.summary.cashback.totalGiven],
            [
                'Total Service Charge (Profit)',
                reportData.summary.cashback.serviceChargeEarned,
            ],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        const transactionsData = [
            [
                'Receipt #',
                'Date',
                'Cashier',
                'Amount Given',
                'Service Charge',
                'Total Received',
                'Status',
            ],
            ...reportData.transactions.map((tx) => {
                return [
                    tx.receiptNumber,
                    (0, date_fns_1.format)(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
                    tx.cashier,
                    tx.totalAmount,
                    0,
                    tx.totalAmount,
                    tx.paymentStatus,
                ];
            }),
        ];
        const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
    }
    addCashbackReportToPDF(doc, reportData) {
        doc.setFontSize(18);
        doc.text('Cashback Report', 14, 20);
        doc.setFontSize(12);
        doc.text(`Period: ${reportData.period.start} to ${reportData.period.end}`, 14, 30);
        let yPos = 45;
        doc.setFontSize(14);
        doc.text('Summary', 14, yPos);
        yPos += 10;
        const summaryData = [
            ['Metric', 'Value'],
            [
                'Total Transactions',
                reportData.summary.cashback.totalTransactions.toString(),
            ],
            [
                'Total Amount Given',
                `N${reportData.summary.cashback.totalGiven.toFixed(2)}`,
            ],
            [
                'Total Service Charge',
                `N${reportData.summary.cashback.serviceChargeEarned.toFixed(2)}`,
            ],
        ];
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] },
        });
        yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
        doc.setFontSize(14);
        doc.text('Transactions', 14, yPos);
        yPos += 10;
        const transactionsData = reportData.transactions.map((tx) => [
            tx.receiptNumber,
            (0, date_fns_1.format)(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
            tx.cashier,
            `N${tx.totalAmount.toFixed(2)}`,
            '-',
            '-',
            tx.paymentStatus,
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: yPos,
            head: [
                [
                    'Receipt #',
                    'Date',
                    'Cashier',
                    'Amount',
                    'S. Charge',
                    'Total',
                    'Status',
                ],
            ],
            body: transactionsData,
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] },
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map