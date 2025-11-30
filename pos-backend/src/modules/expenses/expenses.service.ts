import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  FindAllExpensesDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from './dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new expense
   */
  async create(data: CreateExpenseDto, userId: string) {
    // Validate and parse date
    // If only date is provided (YYYY-MM-DD), use current time
    // If full datetime is provided, use it as-is
    let expenseDate: Date;

    if (data.date.includes('T') || data.date.includes(':')) {
      // Full datetime provided
      expenseDate = new Date(data.date);
    } else {
      // Only date provided (YYYY-MM-DD), use current time for proper sorting
      const datePart = data.date;
      const now = new Date();
      expenseDate = new Date(`${datePart}T${now.toTimeString().split(' ')[0]}`);
    }

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
        createdById: userId,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
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
          createdBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
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
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
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

    // Validate and parse date if provided
    let expenseDate: Date | undefined;
    if (data.date) {
      if (data.date.includes('T') || data.date.includes(':')) {
        // Full datetime provided
        expenseDate = new Date(data.date);
      } else {
        // Only date provided (YYYY-MM-DD), preserve existing time or use current
        const datePart = data.date;
        const existingTime = expense.date
          ? new Date(expense.date).toTimeString().split(' ')[0]
          : new Date().toTimeString().split(' ')[0];
        expenseDate = new Date(`${datePart}T${existingTime}`);
      }

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
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
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
   * Get expense categories (from ExpenseCategory table + existing expenses)
   */
  async getCategories(branchId: string): Promise<string[]> {
    // Get categories from ExpenseCategory table
    const categories = await this.prisma.expenseCategory.findMany({
      where: { branchId, isActive: true },
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    // Also get unique categories from existing expenses (for backward compatibility)
    const expenseCategories = await this.prisma.expense.findMany({
      where: { branchId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    // Merge and deduplicate
    const categoryNames = new Set([
      ...categories.map((c) => c.name),
      ...expenseCategories.map((e) => e.category),
    ]);

    return Array.from(categoryNames).sort();
  }

  /**
   * Create expense category
   */
  async createCategory(
    data: CreateExpenseCategoryDto,
    branchId: string,
    userId: string,
  ) {
    // Check if category already exists
    const existing = await this.prisma.expenseCategory.findUnique({
      where: {
        name_branchId: {
          name: data.name,
          branchId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Category "${data.name}" already exists for this branch`,
      );
    }

    const category = await this.prisma.expenseCategory.create({
      data: {
        name: data.name,
        description: data.description,
        branchId,
      },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: 'CREATE',
      entity: 'ExpenseCategory',
      entityId: category.id,
      newValues: JSON.stringify(category),
    });

    return category;
  }

  /**
   * Get all expense categories
   */
  async getAllCategories(branchId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { branchId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get single expense category
   */
  async getCategory(id: string, branchId: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, branchId },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return category;
  }

  /**
   * Update expense category
   */
  async updateCategory(
    id: string,
    data: UpdateExpenseCategoryDto,
    branchId: string,
    userId: string,
  ) {
    const category = await this.getCategory(id, branchId);

    // Check for name conflict if name is being changed
    if (data.name && data.name !== category.name) {
      const existing = await this.prisma.expenseCategory.findUnique({
        where: {
          name_branchId: {
            name: data.name,
            branchId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Category "${data.name}" already exists for this branch`,
        );
      }
    }

    const oldValues = JSON.stringify(category);

    const updated = await this.prisma.expenseCategory.update({
      where: { id },
      data,
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: 'UPDATE',
      entity: 'ExpenseCategory',
      entityId: id,
      oldValues,
      newValues: JSON.stringify(updated),
    });

    return updated;
  }

  /**
   * Delete expense category
   */
  async deleteCategory(id: string, branchId: string, userId: string) {
    const category = await this.getCategory(id, branchId);

    // Check if category is being used by any expenses
    const expenseCount = await this.prisma.expense.count({
      where: { category: category.name, branchId },
    });

    if (expenseCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" as it is being used by ${expenseCount} expense(s)`,
      );
    }

    const oldValues = JSON.stringify(category);

    await this.prisma.expenseCategory.delete({
      where: { id },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: 'DELETE',
      entity: 'ExpenseCategory',
      entityId: id,
      oldValues,
    });

    return category;
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
      this.logger.error(
        `Failed to create audit log: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }
}
