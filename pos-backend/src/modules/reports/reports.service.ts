import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   */
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
      },
    });

    // Calculate today's metrics
    const todayRevenue = todaySales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const todayProfit = todaySales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce(
        (itemSum, item) =>
          itemSum + (item.unitPrice - item.costPrice) * item.quantity,
        0,
      );
      return sum + saleProfit;
    }, 0);
    const todaySalesCount = todaySales.length;

    // Calculate yesterday's metrics
    const yesterdayRevenue = yesterdaySales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const yesterdaySalesCount = yesterdaySales.length;

    // Revenue comparison
    const revenueChange =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
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
      todayRevenue > 0 ? (todayProfit / todayRevenue) * 100 : 0;

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
        todayRevenue,
        revenueChange,
        salesCountChange,
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
}
