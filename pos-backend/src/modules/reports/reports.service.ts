import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import {
  SalesReportDto,
  ProfitLossDto,
  ExportReportDto,
  ReportType,
  ExportFormat,
  ReportFrequency,
} from './dto';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autotable plugin properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

type SaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            name: true;
            category: { select: { id: true; name: true } };
          };
        };
        variant: { select: { id: true; name: true } };
      };
    };
    cashier: {
      select: { id: true; firstName: true; lastName: true; username: true };
    };
    payments: true;
  };
}>;

type SalesReportData = Awaited<ReturnType<ReportsService['getSalesReport']>>;
type ProfitLossReportData = Awaited<
  ReturnType<ReportsService['getProfitLossReport']>
>;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate date range based on report frequency
   * Used to automatically determine start and end dates for reports
   */
  private getDateRangeByFrequency(
    frequency: ReportFrequency,
    referenceDate: Date = new Date(),
  ): { startDate: Date; endDate: Date; label: string } {
    const endDate = endOfDay(referenceDate);

    switch (frequency) {
      case ReportFrequency.DAILY:
        return {
          startDate: startOfDay(referenceDate),
          endDate,
          label: `Daily Report - ${format(referenceDate, 'MMM dd, yyyy')}`,
        };

      case ReportFrequency.WEEKLY:
        return {
          startDate: startOfDay(
            startOfWeek(referenceDate, { weekStartsOn: 1 }),
          ),
          endDate,
          label: `Weekly Report - Week of ${format(startOfWeek(referenceDate, { weekStartsOn: 1 }), 'MMM dd, yyyy')}`,
        };

      case ReportFrequency.MONTHLY:
        return {
          startDate: startOfDay(startOfMonth(referenceDate)),
          endDate,
          label: `Monthly Report - ${format(referenceDate, 'MMMM yyyy')}`,
        };

      case ReportFrequency.QUARTERLY: {
        const quarter = Math.floor(referenceDate.getMonth() / 3);
        const quarterStart = new Date(
          referenceDate.getFullYear(),
          quarter * 3,
          1,
        );
        return {
          startDate: startOfDay(quarterStart),
          endDate,
          label: `Q${quarter + 1} ${referenceDate.getFullYear()} Report`,
        };
      }

      case ReportFrequency.SEMI_ANNUAL: {
        const halfYear = referenceDate.getMonth() >= 6 ? 1 : 0;
        const halfYearStart = new Date(
          referenceDate.getFullYear(),
          halfYear * 6,
          1,
        );
        return {
          startDate: startOfDay(halfYearStart),
          endDate,
          label: `${halfYear === 0 ? 'H1' : 'H2'} ${referenceDate.getFullYear()} Report`,
        };
      }

      case ReportFrequency.YEARLY:
        return {
          startDate: startOfDay(startOfYear(referenceDate)),
          endDate,
          label: `Annual Report - ${referenceDate.getFullYear()}`,
        };

      default:
        return {
          startDate: startOfDay(referenceDate),
          endDate,
          label: `Report - ${format(referenceDate, 'MMM dd, yyyy')}`,
        };
    }
  }

  /**
   * Get list of sessions in a report with frequency annotations
   * Shows session count, user count, and total sales per frequency period
   */
  async getSessionsReport(
    branchId: string,
    startDate: Date,
    endDate: Date,
    frequency: ReportFrequency,
  ) {
    const sessions = await this.prisma.session.findMany({
      where: {
        branchId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CLOSED', // Only closed sessions
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

    // Group sessions by frequency period
    const groupedSessions = this.groupByFrequency(sessions, frequency);

    // Annotate sessions with frequency information
    return {
      frequency,
      period: this.getDateRangeByFrequency(frequency, endDate),
      totalSessions: sessions.length,
      groupedSessions,
      sessions: sessions.map((session) => ({
        ...session,
        summary: {
          totalSalesCount: session.sales.length,
          totalRevenue: session.sales.reduce(
            (sum, s) => sum + s.totalAmount,
            0,
          ),
          durationMinutes: session.endTime
            ? Math.round(
                (session.endTime.getTime() - session.startTime.getTime()) /
                  60000,
              )
            : 0,
          cashVariance:
            (session.closingBalance || 0) -
            (session.openingBalance +
              session.sales
                .filter((s) => s.transactionType === 'PURCHASE')
                .reduce((sum, s) => sum + s.totalAmount, 0)),
        },
      })),
    };
  }

  /**
   * Group sessions by frequency period
   */
  private groupByFrequency(
    sessions: Array<{ startTime: Date; [key: string]: unknown }>,
    frequency: ReportFrequency,
  ): Record<string, Array<{ startTime: Date; [key: string]: unknown }>> {
    const grouped: Record<
      string,
      Array<{ startTime: Date; [key: string]: unknown }>
    > = {};

    sessions.forEach((session) => {
      let key: string;

      switch (frequency) {
        case ReportFrequency.DAILY:
          key = format(session.startTime, 'yyyy-MM-dd');
          break;
        case ReportFrequency.WEEKLY: {
          const weekStart = startOfWeek(session.startTime, {
            weekStartsOn: 1,
          });
          key = `Week of ${format(weekStart, 'yyyy-MM-dd')}`;
          break;
        }
        case ReportFrequency.MONTHLY:
          key = format(session.startTime, 'yyyy-MM');
          break;
        case ReportFrequency.QUARTERLY: {
          const quarter = Math.floor(session.startTime.getMonth() / 3);
          key = `Q${quarter + 1} ${session.startTime.getFullYear()}`;
          break;
        }
        case ReportFrequency.SEMI_ANNUAL: {
          const halfYear = session.startTime.getMonth() >= 6 ? 'H2' : 'H1';
          key = `${halfYear} ${session.startTime.getFullYear()}`;
          break;
        }
        case ReportFrequency.YEARLY:
          key = `${session.startTime.getFullYear()}`;
          break;
        default:
          key = format(session.startTime, 'yyyy-MM-dd');
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(session);
    });

    return grouped;
  }
  async getDashboardStats(branchId: string) {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);
    const monthStart = startOfDay(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );

    // Today's sales
    const todaySales = await this.prisma.sale.findMany({
      where: {
        branchId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        items: true,
        payments: true, // Need payments for cashback profit calculation
      },
    });

    // Yesterday's sales
    const yesterdaySales = await this.prisma.sale.findMany({
      where: {
        branchId,
        createdAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        items: true,
        payments: true, // Need payments for cashback profit calculation
      },
    });

    // Separate purchase and cashback for today
    const todayPurchaseSales = todaySales.filter(
      (sale) => sale.transactionType === 'PURCHASE',
    );
    const todayCashbackSales = todaySales.filter(
      (sale) => sale.transactionType === 'CASHBACK',
    );

    // Calculate today's metrics (net)
    // salesOverview should only reflect PURCHASE transactions
    const todayPurchaseRevenue = todayPurchaseSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    // Cashback stats
    const todayCashbackGiven = todayCashbackSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    // Cashback profit = service charge (total received - amount given)
    const todayCashbackProfit = todayCashbackSales.reduce((sum, sale) => {
      // Get payments to calculate service charge
      const totalReceived = sale.payments.reduce(
        (pSum, p) => pSum + p.amount,
        0,
      );
      const serviceCharge = totalReceived - sale.totalAmount; // This is the profit
      return sum + serviceCharge;
    }, 0);

    const todayPurchaseProfit = todayPurchaseSales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce(
        (itemSum, item) =>
          itemSum + (item.unitPrice - item.costPrice) * item.quantity,
        0,
      );
      return sum + saleProfit;
    }, 0);

    const todayProfit = todayPurchaseProfit + todayCashbackProfit; // Net profit (purchase profit + cashback service charge)
    const todaySalesCount = todayPurchaseSales.length; // Only count purchases for sales count

    // Separate purchase and cashback for yesterday
    const yesterdayPurchaseSales = yesterdaySales.filter(
      (sale) => sale.transactionType === 'PURCHASE',
    );

    // Calculate yesterday's metrics (net)
    const yesterdayPurchaseRevenue = yesterdayPurchaseSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const yesterdaySalesCount = yesterdayPurchaseSales.length;

    // Revenue comparison
    const revenueChange =
      yesterdayPurchaseRevenue > 0
        ? ((todayPurchaseRevenue - yesterdayPurchaseRevenue) /
            yesterdayPurchaseRevenue) *
          100
        : todayPurchaseRevenue > 0
          ? 100
          : 0;

    // Sales count comparison
    const salesCountChange =
      yesterdaySalesCount > 0
        ? ((todaySalesCount - yesterdaySalesCount) / yesterdaySalesCount) * 100
        : todaySalesCount > 0
          ? 100
          : 0;

    // Net profit (gross profit - expenses)
    const monthExpenses = await this.getMonthExpenses(branchId, monthStart);
    const netProfit = todayProfit - monthExpenses / 30; // Approximate daily expense

    // Profit margin
    const profitMargin =
      todayPurchaseRevenue > 0 ? (todayProfit / todayPurchaseRevenue) * 100 : 0;

    // Inventory stats
    const inventoryStats = await this.getInventoryStats(branchId);

    // Last 7 days sales data for chart
    const last7DaysSales = await this.getLast7DaysSales(branchId);

    // Recent sales (last 10)
    const recentSales = await this.prisma.sale.findMany({
      where: {
        branchId,
        paymentStatus: PaymentStatus.PAID,
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

    // Top selling products (this week)
    const weekStart = startOfDay(subDays(today, 7));
    const topProducts = await this.getTopSellingProducts(branchId, weekStart);

    return {
      salesOverview: {
        todaySalesCount,
        todayRevenue: todayPurchaseRevenue,
        revenueChange,
        salesCountChange,
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

  /**
   * Get inventory statistics
   */
  private async getInventoryStats(branchId: string) {
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

    // Check products without variants
    products.forEach((product) => {
      if (
        product.quantityInStock === null ||
        product.quantityInStock === undefined
      ) {
        return;
      }
      if (product.quantityInStock === 0) {
        outOfStockCount++;
      } else if (
        product.lowStockThreshold !== null &&
        product.lowStockThreshold !== undefined &&
        product.quantityInStock <= product.lowStockThreshold
      ) {
        lowStockCount++;
      }
    });

    // Check variants
    variants.forEach((variant) => {
      totalProducts++;
      if (
        variant.quantityInStock === null ||
        variant.quantityInStock === undefined
      ) {
        return;
      }
      if (variant.quantityInStock === 0) {
        outOfStockCount++;
      } else if (
        variant.lowStockThreshold !== null &&
        variant.lowStockThreshold !== undefined &&
        variant.quantityInStock <= variant.lowStockThreshold
      ) {
        lowStockCount++;
      }
    });

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
    };
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(branchId: string) {
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
      .filter(
        (p) =>
          p.quantityInStock !== null &&
          p.lowStockThreshold !== null &&
          p.quantityInStock <= p.lowStockThreshold,
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.quantityInStock!,
        threshold: p.lowStockThreshold!,
        unitType: p.unitType,
        isVariant: false,
      }));

    const lowStockVariants = variants
      .filter(
        (v) =>
          v.quantityInStock !== null &&
          v.lowStockThreshold !== null &&
          v.quantityInStock <= v.lowStockThreshold,
      )
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

    return [...lowStockProducts, ...lowStockVariants].sort(
      (a, b) => a.currentStock - b.currentStock,
    );
  }

  /**
   * Get last 7 days sales data
   */
  private async getLast7DaysSales(branchId: string) {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const sales = await this.prisma.sale.findMany({
        where: {
          branchId,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          paymentStatus: PaymentStatus.PAID,
        },
        include: {
          items: true,
        },
      });

      const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const profit = sales.reduce((sum, sale) => {
        const saleProfit = sale.items.reduce(
          (itemSum, item) =>
            itemSum + (item.unitPrice - item.costPrice) * item.quantity,
          0,
        );
        return sum + saleProfit;
      }, 0);

      days.push({
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM dd'),
        revenue,
        profit,
        salesCount: sales.length,
      });
    }

    return days;
  }

  /**
   * Get top selling products
   */
  private async getTopSellingProducts(branchId: string, startDate: Date) {
    const sales = await this.prisma.sale.findMany({
      where: {
        branchId,
        createdAt: {
          gte: startDate,
        },
        paymentStatus: PaymentStatus.PAID,
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

    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

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

  /**
   * Get month expenses
   */
  private async getMonthExpenses(branchId: string, monthStart: Date) {
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

  /**
   * Get top expense category
   */
  private async getTopExpenseCategory(branchId: string, monthStart: Date) {
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

    const categoryMap = new Map<string, number>();

    expenses.forEach((expense) => {
      const existing = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, existing + expense.amount);
    });

    if (categoryMap.size === 0) {
      return null;
    }

    const sorted = Array.from(categoryMap.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    return {
      category: sorted[0][0],
      amount: sorted[0][1],
    };
  }

  /**
   * Generate sales report
   */
  async getSalesReport(branchId: string, params: SalesReportDto) {
    const startDate = startOfDay(new Date(params.startDate));
    const endDate = endOfDay(new Date(params.endDate));

    // Build where clause
    const where: Prisma.SaleWhereInput = {
      branchId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: PaymentStatus.PAID,
      ...(params.cashierId && { cashierId: params.cashierId }),
      ...(params.transactionType && {
        transactionType: params.transactionType,
      }),
      ...(params.sessionId && { sessionId: params.sessionId }),
    };

    // Fetch all sales with items and payments
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
        payments: true, // Need payments for cashback profit calculation
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

    // Separate purchase and cashback transactions
    const purchaseSales = sales.filter(
      (sale) => sale.transactionType === 'PURCHASE',
    );
    const cashbackSales = sales.filter(
      (sale) => sale.transactionType === 'CASHBACK',
    );

    // Calculate summary for purchases
    const purchaseTotalSales = purchaseSales.length;
    const purchaseTotalRevenue = purchaseSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const purchaseTotalProfit = purchaseSales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce(
        (itemSum, item) =>
          itemSum + (item.unitPrice - item.costPrice) * item.quantity,
        0,
      );
      return sum + saleProfit;
    }, 0);

    // Calculate summary for cashbacks
    // For cashback: revenue = amount given (negative), profit = service charge (positive)
    const cashbackTotalSales = cashbackSales.length;
    const cashbackTotalRevenue = cashbackSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    // Cashback profit is the service charge, which is stored in notes or calculated from payments
    // Service charge = total received - amount given
    // We can extract it from payments (total payment amount - sale total amount)
    const cashbackTotalProfit = cashbackSales.reduce((sum, sale) => {
      // For cashback, profit is the service charge
      // Customer sends: amount + service charge
      // We give: amount
      // Profit: service charge = total received - amount given
      const totalReceived = sale.payments.reduce(
        (pSum, p) => pSum + p.amount,
        0,
      );
      const serviceCharge = totalReceived - sale.totalAmount; // This is the profit
      return sum + serviceCharge;
    }, 0);

    // Overall totals
    const totalSales = sales.length;
    const totalRevenue = purchaseTotalRevenue - cashbackTotalRevenue; // Net revenue
    const totalProfit = purchaseTotalProfit + cashbackTotalProfit; // Net profit (Purchase Profit + Cashback Service Charge)
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Group by period
    const groupBy = params.groupBy || 'day';
    const breakdown = this.groupSalesByPeriod(
      sales,
      startDate,
      endDate,
      groupBy,
    );

    // Top selling products
    const topProducts = this.getTopSellingProductsFromSales(sales);

    // Category breakdown
    const categoryBreakdown = this.getCategoryBreakdown(sales);

    // Payment method breakdown
    const paymentBreakdown = await this.getPaymentBreakdown(
      branchId,
      startDate,
      endDate,
    );

    // Sales by cashier
    // Sales by cashier
    const salesByCashier = this.getSalesByCashier(sales);

    // Get available cashback capital
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { cashbackCapital: true },
    });

    return {
      period: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      },
      availableCapital: branch?.cashbackCapital || 0,
      summary: {
        totalSales,
        totalRevenue,
        totalProfit,
        averageOrderValue,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        // Separate purchase and cashback metrics
        purchase: {
          totalSales: purchaseTotalSales,
          totalRevenue: purchaseTotalRevenue,
          totalProfit: purchaseTotalProfit,
        },
        cashback: {
          totalSales: cashbackTotalSales,
          totalRevenue: cashbackTotalRevenue,
          totalProfit: cashbackTotalProfit,
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
        paymentStatus: sale.paymentStatus,
      })),
    };
  }

  /**
   * Get session report
   */
  async getSessionReport(branchId: string, sessionId: string) {
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

  /**
   * Generate profit & loss report
   */
  async getProfitLossReport(branchId: string, params: ProfitLossDto) {
    const startDate = startOfDay(new Date(params.startDate));
    const endDate = endOfDay(new Date(params.endDate));

    // Get all sales in period
    const sales = await this.prisma.sale.findMany({
      where: {
        branchId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        items: true,
      },
    });

    // Calculate revenue
    const salesRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Calculate COGS (Cost of Goods Sold)
    const costOfGoodsSold = sales.reduce((sum, sale) => {
      const saleCOGS = sale.items.reduce(
        (itemSum, item) => itemSum + item.costPrice * item.quantity,
        0,
      );
      return sum + saleCOGS;
    }, 0);

    // Calculate gross profit
    const grossProfit = salesRevenue - costOfGoodsSold;
    const grossProfitMargin =
      salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0;

    // Get expenses in period
    const expenses = await this.prisma.expense.findMany({
      where: {
        branchId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Expense breakdown by category
    const expenseBreakdown = expenses.reduce(
      (acc, expense) => {
        const existing = acc.find((e) => e.category === expense.category);
        if (existing) {
          existing.amount += expense.amount;
        } else {
          acc.push({
            category: expense.category,
            amount: expense.amount,
          });
        }
        return acc;
      },
      [] as Array<{ category: string; amount: number }>,
    );

    // Calculate net profit
    const netProfit = grossProfit - totalExpenses;
    const netProfitMargin =
      salesRevenue > 0 ? (netProfit / salesRevenue) * 100 : 0;

    return {
      period: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
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

  /**
   * Export report as CSV or PDF
   */
  async exportReport(
    branchId: string,
    params: ExportReportDto,
  ): Promise<{ data: Buffer; filename: string; mimeType: string }> {
    let filename: string;

    // Generate report data based on type
    if (params.reportType === ReportType.SALES) {
      const reportData = await this.getSalesReport(branchId, {
        startDate: params.startDate,
        endDate: params.endDate,
        ...params.filters,
      });
      filename = `sales-report-${format(new Date(params.startDate), 'yyyyMMdd')}-${format(new Date(params.endDate), 'yyyyMMdd')}`;

      // Generate file based on format
      if (params.format === ExportFormat.EXCEL) {
        return this.generateExcelReport(
          reportData,
          params.reportType,
          filename,
        );
      } else {
        return this.generatePDFReport(reportData, params.reportType, filename);
      }
    } else if (params.reportType === ReportType.PROFIT_LOSS) {
      const reportData = await this.getProfitLossReport(branchId, {
        startDate: params.startDate,
        endDate: params.endDate,
      });
      filename = `profit-loss-${format(new Date(params.startDate), 'yyyyMMdd')}-${format(new Date(params.endDate), 'yyyyMMdd')}`;

      // Generate file based on format
      if (params.format === ExportFormat.EXCEL) {
        return this.generateExcelReport(
          reportData,
          params.reportType,
          filename,
        );
      } else {
        return this.generatePDFReport(reportData, params.reportType, filename);
      }
    } else if (params.reportType === ReportType.CASHBACK) {
      const reportData = await this.getSalesReport(branchId, {
        startDate: params.startDate,
        endDate: params.endDate,
        transactionType: 'CASHBACK',
      });
      filename = `cashback-report-${format(new Date(params.startDate), 'yyyyMMdd')}-${format(new Date(params.endDate), 'yyyyMMdd')}`;

      // Generate file based on format
      if (params.format === ExportFormat.EXCEL) {
        return this.generateExcelReport(
          reportData,
          params.reportType,
          filename,
        );
      } else {
        return this.generatePDFReport(reportData, params.reportType, filename);
      }
    } else {
      throw new Error('Unsupported report type');
    }
  }

  /**
   * Group sales by period
   */
  private groupSalesByPeriod(
    sales: SaleWithRelations[],
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month',
  ) {
    const grouped = new Map<
      string,
      { sales: number; revenue: number; profit: number }
    >();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      let key: string;

      switch (groupBy) {
        case 'week':
          key = format(startOfWeek(saleDate), 'yyyy-MM-dd');
          break;
        case 'month':
          key = format(startOfMonth(saleDate), 'yyyy-MM');
          break;
        default:
          key = format(saleDate, 'yyyy-MM-dd');
      }

      const existing = grouped.get(key) || { sales: 0, revenue: 0, profit: 0 };

      let saleProfit = 0;
      if (sale.transactionType === 'CASHBACK') {
        // For cashback, profit is the service charge
        const totalReceived = sale.payments.reduce(
          (pSum, p) => pSum + p.amount,
          0,
        );
        saleProfit = totalReceived - sale.totalAmount;
      } else {
        // For purchases, profit is (price - cost) * quantity
        saleProfit = sale.items.reduce(
          (sum: number, item) =>
            sum + (item.unitPrice - item.costPrice) * item.quantity,
          0,
        );
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

  /**
   * Get top selling products from sales
   */
  private getTopSellingProductsFromSales(sales: SaleWithRelations[]) {
    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

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

  /**
   * Get category breakdown
   */
  private getCategoryBreakdown(sales: SaleWithRelations[]) {
    const categoryMap = new Map<string, number>();

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

  /**
   * Get payment breakdown
   */
  private async getPaymentBreakdown(
    branchId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const payments = await this.prisma.payment.findMany({
      where: {
        sale: {
          branchId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: PaymentStatus.PAID,
        },
      },
      select: {
        method: true,
        amount: true,
      },
    });

    const breakdown = payments.reduce(
      (acc, payment) => {
        const existing = acc.find((p) => p.method === payment.method);
        if (existing) {
          existing.amount += payment.amount;
        } else {
          acc.push({
            method: payment.method,
            amount: payment.amount,
          });
        }
        return acc;
      },
      [] as Array<{ method: string; amount: number }>,
    );

    return breakdown;
  }

  /**
   * Get sales by cashier
   */
  private getSalesByCashier(sales: SaleWithRelations[]) {
    const cashierMap = new Map<
      string,
      { name: string; sales: number; revenue: number }
    >();

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

    return Array.from(cashierMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );
  }

  /**
   * Generate Excel report
   */
  private generateExcelReport(
    reportData: SalesReportData | ProfitLossReportData,
    reportType: ReportType,
    filename: string,
  ): { data: Buffer; filename: string; mimeType: string } {
    const workbook = XLSX.utils.book_new();

    if (reportType === ReportType.SALES) {
      const salesData = reportData as SalesReportData;
      this.addSalesReportToWorkbook(workbook, salesData);
    } else if (reportType === ReportType.PROFIT_LOSS) {
      const profitLossData = reportData as ProfitLossReportData;
      this.addProfitLossReportToWorkbook(workbook, profitLossData);
    } else if (reportType === ReportType.CASHBACK) {
      const salesData = reportData as SalesReportData;
      this.addCashbackReportToWorkbook(workbook, salesData);
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;

    return {
      data: excelBuffer,
      filename: `${filename}.xlsx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /**
   * Generate PDF report
   */
  private generatePDFReport(
    reportData: SalesReportData | ProfitLossReportData,
    reportType: ReportType,
    filename: string,
  ): { data: Buffer; filename: string; mimeType: string } {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    if (reportType === ReportType.SALES) {
      this.addSalesReportToPDF(doc, reportData as SalesReportData);
    } else if (reportType === ReportType.PROFIT_LOSS) {
      this.addProfitLossReportToPDF(doc, reportData as ProfitLossReportData);
    } else if (reportType === ReportType.CASHBACK) {
      this.addCashbackReportToPDF(doc, reportData as SalesReportData);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return {
      data: pdfBuffer,
      filename: `${filename}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  /**
   * Generate CSV for sales report
   */
  private generateSalesReportCSV(reportData: SalesReportData): string {
    const lines: string[] = [];

    // Header
    lines.push('Sales Report');
    lines.push(
      `Period: ${reportData.period.start} to ${reportData.period.end}`,
    );
    lines.push('');

    // Summary
    lines.push('Summary');
    lines.push(`Total Sales,${reportData.summary.totalSales}`);
    lines.push(`Total Revenue,${reportData.summary.totalRevenue.toFixed(2)}`);
    lines.push(`Total Profit,${reportData.summary.totalProfit.toFixed(2)}`);
    lines.push(
      `Average Order Value,${reportData.summary.averageOrderValue.toFixed(2)}`,
    );
    lines.push('');

    // Breakdown
    lines.push('Daily Breakdown');
    lines.push('Date,Sales,Revenue,Profit');
    reportData.breakdown.forEach((item) => {
      lines.push(
        `${item.date},${item.sales},${item.revenue.toFixed(2)},${item.profit.toFixed(2)}`,
      );
    });
    lines.push('');

    // Top Products
    lines.push('Top Products');
    lines.push('Product,Quantity,Revenue');
    reportData.topProducts.forEach((product) => {
      lines.push(
        `${product.name},${product.quantity},${product.revenue.toFixed(2)}`,
      );
    });

    return lines.join('\n');
  }

  /**
   * Generate CSV for profit & loss report
   */
  private generateProfitLossReportCSV(
    reportData: ProfitLossReportData,
  ): string {
    const lines: string[] = [];

    // Header
    lines.push('Profit & Loss Report');
    lines.push(
      `Period: ${reportData.period.start} to ${reportData.period.end}`,
    );
    lines.push('');

    // Revenue
    lines.push('Revenue');
    lines.push(`Sales,${reportData.revenue.sales.toFixed(2)}`);
    lines.push(`Total Revenue,${reportData.revenue.total.toFixed(2)}`);
    lines.push('');

    // Costs
    lines.push('Costs');
    lines.push(
      `Cost of Goods Sold,${reportData.costs.costOfGoodsSold.toFixed(2)}`,
    );
    lines.push(`Operating Expenses,${reportData.costs.expenses.toFixed(2)}`);
    lines.push(`Total Costs,${reportData.costs.total.toFixed(2)}`);
    lines.push('');

    // Profit
    lines.push('Profit');
    lines.push(`Gross Profit,${reportData.profit.gross.toFixed(2)}`);
    lines.push(`Gross Margin,${reportData.profit.grossMargin.toFixed(2)}%`);
    lines.push(`Net Profit,${reportData.profit.net.toFixed(2)}`);
    lines.push(`Net Margin,${reportData.profit.netMargin.toFixed(2)}%`);
    lines.push('');

    // Expense Breakdown
    lines.push('Expense Breakdown');
    lines.push('Category,Amount');
    reportData.expenseBreakdown.forEach((expense) => {
      lines.push(`${expense.category},${expense.amount.toFixed(2)}`);
    });

    return lines.join('\n');
  }

  /**
   * Add sales report data to Excel workbook
   */
  private addSalesReportToWorkbook(
    workbook: XLSX.WorkBook,
    reportData: SalesReportData,
  ) {
    // Summary sheet
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

    // Breakdown sheet
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

    // Top Products sheet
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

    // Transactions sheet
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
        format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
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

  /**
   * Add profit & loss report data to Excel workbook
   */
  private addProfitLossReportToWorkbook(
    workbook: XLSX.WorkBook,
    reportData: ProfitLossReportData,
  ) {
    // Summary sheet
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

    // Expense Breakdown sheet
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

  /**
   * Add sales report to PDF document
   */
  private addSalesReportToPDF(
    doc: jsPDFWithAutoTable,
    reportData: SalesReportData,
  ) {
    // Title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 20);

    // Period
    doc.setFontSize(12);
    doc.text(
      `Period: ${reportData.period.start} to ${reportData.period.end}`,
      14,
      30,
    );

    let yPos = 45;

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, yPos);
    yPos += 10;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Sales', reportData.summary.totalSales.toString()],
      ['Total Revenue', `₦${reportData.summary.totalRevenue.toFixed(2)}`],
      ['Total Profit', `₦${reportData.summary.totalProfit.toFixed(2)}`],
      [
        'Average Order Value',
        `₦${reportData.summary.averageOrderValue.toFixed(2)}`,
      ],
      ['Profit Margin', `${reportData.summary.profitMargin.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

    // Breakdown table
    doc.setFontSize(14);
    doc.text('Daily Breakdown', 14, yPos);
    yPos += 10;

    const breakdownData = reportData.breakdown.map((item) => [
      item.date,
      item.sales.toString(),
      `₦${item.revenue.toFixed(2)}`,
      `₦${item.profit.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Sales', 'Revenue', 'Profit']],
      body: breakdownData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

    // Top Products
    doc.setFontSize(14);
    doc.text('Top Products', 14, yPos);
    yPos += 10;

    const topProductsData = reportData.topProducts.map((product) => [
      product.name,
      product.quantity.toString(),
      `₦${product.revenue.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Product', 'Quantity', 'Revenue']],
      body: topProductsData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });
  }

  /**
   * Add profit & loss report to PDF document
   */
  private addProfitLossReportToPDF(
    doc: jsPDFWithAutoTable,
    reportData: ProfitLossReportData,
  ) {
    // Title
    doc.setFontSize(18);
    doc.text('Profit & Loss Report', 14, 20);

    // Period
    doc.setFontSize(12);
    doc.text(
      `Period: ${reportData.period.start} to ${reportData.period.end}`,
      14,
      30,
    );

    let yPos = 45;

    // Revenue
    doc.setFontSize(14);
    doc.text('Revenue', 14, yPos);
    yPos += 10;

    const revenueData = [
      ['Sales', `₦${reportData.revenue.sales.toFixed(2)}`],
      ['Total Revenue', `₦${reportData.revenue.total.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPos,
      body: revenueData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

    // Costs
    doc.setFontSize(14);
    doc.text('Costs', 14, yPos);
    yPos += 10;

    const costsData = [
      ['Cost of Goods Sold', `₦${reportData.costs.costOfGoodsSold.toFixed(2)}`],
      ['Operating Expenses', `₦${reportData.costs.expenses.toFixed(2)}`],
      ['Total Costs', `₦${reportData.costs.total.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: yPos,
      body: costsData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

    // Profit
    doc.setFontSize(14);
    doc.text('Profit', 14, yPos);
    yPos += 10;

    const profitData = [
      ['Gross Profit', `₦${reportData.profit.gross.toFixed(2)}`],
      ['Gross Margin', `${reportData.profit.grossMargin.toFixed(2)}%`],
      ['Net Profit', `₦${reportData.profit.net.toFixed(2)}`],
      ['Net Margin', `${reportData.profit.netMargin.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      body: profitData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

    // Expense Breakdown
    doc.setFontSize(14);
    doc.text('Expense Breakdown', 14, yPos);
    yPos += 10;

    const expenseData = reportData.expenseBreakdown.map((expense) => [
      expense.category,
      `₦${expense.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Amount']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });
  }

  /**
   * Add cashback report data to Excel workbook
   */
  private addCashbackReportToWorkbook(
    workbook: XLSX.WorkBook,
    reportData: SalesReportData,
  ) {
    // Summary sheet
    const summaryData = [
      ['Cashback Report Summary'],
      ['Period', `${reportData.period.start} to ${reportData.period.end}`],
      [],
      ['Metric', 'Value'],
      ['Total Transactions', reportData.summary.cashback.totalSales],
      ['Total Amount Given', reportData.summary.cashback.totalRevenue],
      [
        'Total Service Charge (Profit)',
        reportData.summary.cashback.totalProfit,
      ],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Transactions sheet
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
          format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
          tx.cashier,
          tx.totalAmount, // Amount Given
          0, // Placeholder for Service Charge - we need to fix this
          tx.totalAmount, // Placeholder for Total Received
          tx.paymentStatus,
        ];
      }),
    ];
    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
  }

  /**
   * Add cashback report to PDF document
   */
  private addCashbackReportToPDF(
    doc: jsPDFWithAutoTable,
    reportData: SalesReportData,
  ) {
    // Title
    doc.setFontSize(18);
    doc.text('Cashback Report', 14, 20);

    // Period
    doc.setFontSize(12);
    doc.text(
      `Period: ${reportData.period.start} to ${reportData.period.end}`,
      14,
      30,
    );

    let yPos = 45;

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, yPos);
    yPos += 10;

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Transactions', reportData.summary.cashback.totalSales.toString()],
      [
        'Total Amount Given',
        `₦${reportData.summary.cashback.totalRevenue.toFixed(2)}`,
      ],
      [
        'Total Service Charge',
        `₦${reportData.summary.cashback.totalProfit.toFixed(2)}`,
      ],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] }, // Orange for cashback
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

    // Transactions table
    doc.setFontSize(14);
    doc.text('Transactions', 14, yPos);
    yPos += 10;

    const transactionsData = reportData.transactions.map((tx) => [
      tx.receiptNumber,
      format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
      tx.cashier,
      `₦${tx.totalAmount.toFixed(2)}`,
      // We need service charge here too
      '-',
      '-',
      tx.paymentStatus,
    ]);

    autoTable(doc, {
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
}
