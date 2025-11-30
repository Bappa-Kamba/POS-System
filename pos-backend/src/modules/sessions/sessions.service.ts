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
            items: true,
            payments: true,
          },
        },
        expenses: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Calculate session totals
    const totalSales = session.sales.length;
    const totalRevenue = session.sales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    // Calculate cash payments specifically (for cash drawer reconciliation)
    const cashPayments = session.sales.reduce((sum: number, sale) => {
      const cashPayment = sale.payments.find((p) => p.method === 'CASH');
      return sum + (cashPayment ? cashPayment.amount : 0);
    }, 0);

    // Calculate total expenses for the session
    const totalExpenses = session.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    // Calculate expected cash in drawer
    // Expected = Opening Balance + Cash Payments (from sales) - Expenses
    // Expenses are deducted because they represent cash paid out during the session
    const expectedCashInDrawer =
      session.openingBalance + cashPayments - totalExpenses;

    // Calculate variance (difference between actual and expected)
    const actualCash = session.closingBalance || 0;
    const variance = actualCash - expectedCashInDrawer;
    const variancePercentage =
      expectedCashInDrawer > 0 ? (variance / expectedCashInDrawer) * 100 : 0;

    // Other payment methods total
    const otherPayments = session.sales.reduce((sum: number, sale) => {
      const otherPayment =
        sale.totalAmount -
        (sale.payments.find((p) => p.method === 'CASH')?.amount || 0);
      return sum + otherPayment;
    }, 0);

    return {
      ...session,
      summary: {
        // Totals
        totalSales,
        totalRevenue,

        // Payment breakdown
        cashPayments,
        otherPayments,

        // Expenses
        totalExpenses,

        // Cash reconciliation
        openingBalance: session.openingBalance,
        expectedCashInDrawer,
        actualCashInDrawer: actualCash,

        // Variance analysis
        variance,
        variancePercentage,
        isBalanced: Math.abs(variance) < 0.01, // Allow for rounding errors

        // Session duration
        durationMinutes: session.endTime
          ? Math.round(
              (session.endTime.getTime() - session.startTime.getTime()) / 60000,
            )
          : null,
      },
    };
  }
}
