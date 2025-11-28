import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto, FindAllExpensesDto } from './dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new expense
   */
  async create(data: CreateExpenseDto, userId: string) {
    // Validate date
    const expenseDate = new Date(data.date);
    if (isNaN(expenseDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const expense = await this.prisma.expense.create({
      data: {
        title: data.title,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: expenseDate,
        branchId: data.branchId,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: 'CREATE',
      entity: 'Expense',
      entityId: expense.id,
      newValues: JSON.stringify(expense),
    });

    return expense;
  }

  /**
   * Get all expenses with filtering and pagination
   */
  async findAll(params: FindAllExpensesDto) {
    const {
      skip = 0,
      take = 20,
      search,
      category,
      startDate,
      endDate,
      branchId,
    } = params;

    const where: Prisma.ExpenseWhereInput = {
      ...(branchId && { branchId }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
        ],
      }),
      ...(startDate &&
        endDate && {
          date: {
            gte: startOfDay(new Date(startDate)),
            lte: endOfDay(new Date(endDate)),
          },
        }),
      ...(startDate &&
        !endDate && {
          date: {
            gte: startOfDay(new Date(startDate)),
          },
        }),
      ...(!startDate &&
        endDate && {
          date: {
            lte: endOfDay(new Date(endDate)),
          },
        }),
    };

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get single expense by ID
   */
  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  /**
   * Update expense
   */
  async update(id: string, data: UpdateExpenseDto, userId: string) {
    const expense = await this.findOne(id);

    // Store old values for audit
    const oldValues = JSON.stringify(expense);

    // Validate date if provided
    let expenseDate: Date | undefined;
    if (data.date) {
      expenseDate = new Date(data.date);
      if (isNaN(expenseDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    const updateData: Prisma.ExpenseUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.category && { category: data.category }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(expenseDate && { date: expenseDate }),
      ...(data.branchId && { branchId: data.branchId }),
    };

    const updated = await this.prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: 'UPDATE',
      entity: 'Expense',
      entityId: id,
      oldValues,
      newValues: JSON.stringify(updated),
    });

    return updated;
  }

  /**
   * Delete expense
   */
  async remove(id: string, userId: string) {
    const expense = await this.findOne(id);

    // Store old values for audit
    const oldValues = JSON.stringify(expense);

    await this.prisma.expense.delete({
      where: { id },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: 'DELETE',
      entity: 'Expense',
      entityId: id,
      oldValues,
    });

    return expense;
  }

  /**
   * Get expense categories
   */
  async getCategories(branchId: string): Promise<string[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { branchId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return expenses.map((e) => e.category);
  }

  /**
   * Get total expenses for a period
   */
  async getTotalExpenses(
    branchId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const where: Prisma.ExpenseWhereInput = {
      branchId,
      ...(startDate &&
        endDate && {
          date: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate),
          },
        }),
      ...(startDate &&
        !endDate && {
          date: {
            gte: startOfDay(startDate),
          },
        }),
      ...(!startDate &&
        endDate && {
          date: {
            lte: endOfDay(endDate),
          },
        }),
    };

    const result = await this.prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? 0;
  }

  /**
   * Helper method to log audit trail
   */
  private async logAudit(data: {
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    entityId: string;
    oldValues?: string;
    newValues?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValues: data.oldValues,
          newValues: data.newValues,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error}`);
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }
}
