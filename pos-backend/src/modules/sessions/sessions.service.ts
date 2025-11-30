import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StartSessionDto, EndSessionDto } from './dto';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(branchId: string, userId: string, dto: StartSessionDto) {
    // Check if this user already has an open session in this branch
    const activeSession = await this.prisma.session.findFirst({
      where: {
        branchId,
        openedById: userId,
        status: SessionStatus.OPEN,
      },
    });

    if (activeSession) {
      throw new BadRequestException(
        'You already have an active session in this branch.',
      );
    }

    return this.prisma.session.create({
      data: {
        branchId,
        openedById: userId,
        name: dto.name,
        openingBalance: dto.openingBalance || 0,
        status: SessionStatus.OPEN,
        startTime: new Date(),
      },
    });
  }

  async endSession(sessionId: string, userId: string, dto: EndSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === SessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed');
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.CLOSED,
        endTime: new Date(),
        closingBalance: dto.closingBalance,
        closedById: userId,
      },
    });
  }

  async getActiveSession(branchId: string, userId: string) {
    return this.prisma.session.findFirst({
      where: {
        branchId,
        openedById: userId,
        status: SessionStatus.OPEN,
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

  async getSessionHistory(branchId: string) {
    return this.prisma.session.findMany({
      where: {
        branchId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to last 20 sessions
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

  async getSessionDetails(sessionId: string) {
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
      throw new NotFoundException('Session not found');
    }

    // Separate sales by transaction type
    const purchaseSales = session.sales.filter(
      (s) => s.transactionType === 'PURCHASE',
    );
    const cashbackSales = session.sales.filter(
      (s) => s.transactionType === 'CASHBACK',
    );

    // Calculate session totals
    const totalSales = purchaseSales.length;
    const totalRevenue = purchaseSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    // Payment method breakdown
    const paymentBreakdown = {
      cash: { count: 0, amount: 0 },
      transfer: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      pos: { count: 0, amount: 0 },
    };

    session.sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const method =
          payment.method.toLowerCase() as keyof typeof paymentBreakdown;
        if (paymentBreakdown[method]) {
          paymentBreakdown[method].count++;
          paymentBreakdown[method].amount += payment.amount;
        }
      });
    });

    // Cashback summary
    const cashbackSummary = {
      count: cashbackSales.length,
      totalAmount: cashbackSales.reduce((sum, s) => sum + s.totalAmount, 0),
      totalServiceCharge: cashbackSales.reduce(
        (sum, s) => sum + (s.subtotal - s.totalAmount),
        0,
      ),
      totalReceived: cashbackSales.reduce((sum, s) => sum + s.amountPaid, 0),
    };

    // Expenses breakdown by category
    const expensesByCategory: Record<string, number> = {};
    session.expenses.forEach((expense) => {
      const categoryName = expense.category || 'Uncategorized';
      expensesByCategory[categoryName] =
        (expensesByCategory[categoryName] || 0) + expense.amount;
    });

    const totalExpenses = session.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Calculate expected cash in drawer
    const cashSalesAmount = paymentBreakdown.cash.amount;
    const cashbackPaid = cashbackSummary.totalAmount;
    const expectedCashInDrawer =
      session.openingBalance + cashSalesAmount - cashbackPaid - totalExpenses;

    // Calculate variance
    const actualCash = session.closingBalance || 0;
    const variance = actualCash - expectedCashInDrawer;
    const variancePercentage =
      expectedCashInDrawer > 0 ? (variance / expectedCashInDrawer) * 100 : 0;

    // Session duration
    const durationMinutes = session.endTime
      ? Math.round(
          (session.endTime.getTime() - session.startTime.getTime()) / 60000,
        )
      : null;

    // Hourly breakdown
    const hourlyBreakdown: Array<{
      hour: string;
      salesCount: number;
      revenue: number;
    }> = [];

    if (session.startTime) {
      const hourlyData: Record<string, { count: number; revenue: number }> = {};

      purchaseSales.forEach((sale) => {
        const hour = new Date(sale.createdAt).getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;

        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = { count: 0, revenue: 0 };
        }

        hourlyData[hourKey].count++;
        hourlyData[hourKey].revenue += sale.totalAmount;
      });

      // Convert to array and sort
      hourlyBreakdown.push(
        ...Object.entries(hourlyData)
          .map(([hour, data]) => ({
            hour,
            salesCount: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => a.hour.localeCompare(b.hour)),
      );
    }

    // Top products
    const productSales: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

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

    // Category breakdown
    const categoryBreakdown: Record<
      string,
      { itemsSold: number; revenue: number }
    > = {};

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

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(
      ([name, data]) => ({
        categoryName: name,
        itemsSold: data.itemsSold,
        revenue: data.revenue,
      }),
    );

    return {
      ...session,
      summary: {
        // Sales totals
        totalSales,
        totalRevenue,

        // Payment breakdown
        payments: paymentBreakdown,

        // Cashback
        cashback: cashbackSummary,

        // Expenses
        expenses: {
          count: session.expenses.length,
          totalAmount: totalExpenses,
          byCategory: Object.entries(expensesByCategory).map(
            ([category, amount]) => ({
              category,
              amount,
            }),
          ),
        },

        // Cash flow reconciliation
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

        // Session info
        durationMinutes,

        // Detailed breakdowns
        hourlyBreakdown,
        topProducts,
        categoryBreakdown: categoryBreakdownArray,
      },
    };
  }
}
