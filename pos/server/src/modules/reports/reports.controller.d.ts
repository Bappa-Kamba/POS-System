import type { Response } from 'express';
import { ReportsService } from './reports.service';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
import { SalesReportDto, ProfitLossDto, ExportReportDto } from './dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboardStats(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            salesOverview: {
                todaySalesCount: number;
                todayRevenue: number;
                revenueChange: number;
                salesCountChange: number;
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
        };
    }>;
    getLowStockItems(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    getSalesReport(query: SalesReportDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getProfitLossReport(query: ProfitLossDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    exportReport(body: ExportReportDto, user: AuthenticatedRequestUser, res: Response): Promise<void>;
}
