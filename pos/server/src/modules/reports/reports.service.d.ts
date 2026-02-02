import { PrismaService } from '../../prisma/prisma.service';
import { SalesReportDto, ProfitLossDto, ExportReportDto, ReportFrequency } from './dto';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getDateRangeByFrequency;
    getSessionsReport(branchId: string, startDate: Date, endDate: Date, frequency: ReportFrequency): Promise<{
        frequency: ReportFrequency;
        period: {
            startDate: Date;
            endDate: Date;
            label: string;
        };
        totalSessions: number;
        groupedSessions: Record<string, {
            [key: string]: unknown;
            startTime: Date;
        }[]>;
        sessions: {
            summary: {
                totalSalesCount: number;
                totalRevenue: number;
                durationMinutes: number;
                cashVariance: number;
            };
            sales: {
                transactionType: import("@prisma/client").$Enums.TransactionType;
                totalAmount: number;
            }[];
            openedBy: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            };
            closedBy: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
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
        }[];
    }>;
    private groupByFrequency;
    getDashboardStats(branchId: string): Promise<{
        salesOverview: {
            todaySalesCount: number;
            todayRevenue: number;
            revenueChange: number;
            salesCountChange: number;
        };
        creditStats: {
            totalDebt: number;
            count: number;
        };
        cashbackStats: {
            count: number;
            totalGiven: number;
            totalProfit: number;
        };
        profit: {
            grossProfit: number;
            netProfit: number;
            profitMargin: number;
        };
        inventory: {
            totalProducts: number;
            lowStockCount: number;
            outOfStockCount: number;
        };
        expenses: {
            monthTotal: number;
            topCategory: {
                category: string;
                amount: number;
            } | null;
        };
        chartData: {
            date: string;
            label: string;
            revenue: number;
            profit: number;
            salesCount: number;
        }[];
        recentSales: {
            id: string;
            receiptNumber: string;
            createdAt: Date;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            cashier: string;
            totalAmount: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        }[];
        topProducts: {
            name: string;
            quantity: number;
            revenue: number;
        }[];
    }>;
    private getInventoryStats;
    getLowStockItems(branchId: string): Promise<({
        id: string;
        name: string;
        sku: string;
        currentStock: number;
        threshold: number;
        unitType: import("@prisma/client").$Enums.UnitType;
        isVariant: boolean;
    } | {
        id: string;
        name: string;
        sku: string;
        currentStock: number;
        threshold: number;
        unitType: string;
        isVariant: boolean;
        productId: string;
    })[]>;
    private getLast7DaysSales;
    private getTopSellingProducts;
    private getMonthExpenses;
    private getTopExpenseCategory;
    getSalesReport(branchId: string, params: SalesReportDto): Promise<{
        period: {
            start: string;
            end: string;
        };
        availableCapital: number;
        summary: {
            totalSales: number;
            totalRevenue: number;
            totalProfit: number;
            averageOrderValue: number;
            profitMargin: number;
            purchase: {
                totalSales: number;
                totalRevenue: number;
                totalProfit: number;
                profitMargin: number;
            };
            cashback: {
                totalTransactions: number;
                totalGiven: number;
                serviceChargeEarned: number;
                serviceChargeRate: number;
            };
            combined: {
                totalProfit: number;
                netCashFlow: number;
            };
        };
        breakdown: {
            sales: number;
            revenue: number;
            profit: number;
            date: string;
        }[];
        topProducts: {
            name: string;
            quantity: number;
            revenue: number;
        }[];
        categoryBreakdown: {
            category: string;
            revenue: number;
        }[];
        paymentBreakdown: {
            method: string;
            amount: number;
        }[];
        salesByCashier: {
            name: string;
            sales: number;
            revenue: number;
        }[];
        transactions: {
            id: string;
            receiptNumber: string;
            date: Date;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            cashier: string;
            itemsCount: number;
            subtotal: number;
            taxAmount: number;
            totalAmount: number;
            serviceCharge: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        }[];
    }>;
    getSessionReport(branchId: string, sessionId: string): Promise<{
        period: {
            start: string;
            end: string;
        };
        availableCapital: number;
        summary: {
            totalSales: number;
            totalRevenue: number;
            totalProfit: number;
            averageOrderValue: number;
            profitMargin: number;
            purchase: {
                totalSales: number;
                totalRevenue: number;
                totalProfit: number;
                profitMargin: number;
            };
            cashback: {
                totalTransactions: number;
                totalGiven: number;
                serviceChargeEarned: number;
                serviceChargeRate: number;
            };
            combined: {
                totalProfit: number;
                netCashFlow: number;
            };
        };
        breakdown: {
            sales: number;
            revenue: number;
            profit: number;
            date: string;
        }[];
        topProducts: {
            name: string;
            quantity: number;
            revenue: number;
        }[];
        categoryBreakdown: {
            category: string;
            revenue: number;
        }[];
        paymentBreakdown: {
            method: string;
            amount: number;
        }[];
        salesByCashier: {
            name: string;
            sales: number;
            revenue: number;
        }[];
        transactions: {
            id: string;
            receiptNumber: string;
            date: Date;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            cashier: string;
            itemsCount: number;
            subtotal: number;
            taxAmount: number;
            totalAmount: number;
            serviceCharge: number;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        }[];
    }>;
    getProfitLossReport(branchId: string, params: ProfitLossDto): Promise<{
        period: {
            start: string;
            end: string;
        };
        revenue: {
            sales: number;
            total: number;
        };
        costs: {
            costOfGoodsSold: number;
            expenses: number;
            total: number;
        };
        profit: {
            gross: number;
            net: number;
            grossMargin: number;
            netMargin: number;
        };
        expenseBreakdown: {
            category: string;
            amount: number;
        }[];
    }>;
    exportReport(branchId: string, params: ExportReportDto): Promise<{
        data: Buffer;
        filename: string;
        mimeType: string;
    }>;
    private groupSalesByPeriod;
    private getTopSellingProductsFromSales;
    private getCategoryBreakdown;
    private getPaymentBreakdown;
    private getSalesByCashier;
    private generateExcelReport;
    private generatePDFReport;
    private generateSalesReportCSV;
    private generateProfitLossReportCSV;
    private addSalesReportToWorkbook;
    private addProfitLossReportToWorkbook;
    private addSalesReportToPDF;
    private addProfitLossReportToPDF;
    private addCashbackReportToWorkbook;
    private addCashbackReportToPDF;
}
