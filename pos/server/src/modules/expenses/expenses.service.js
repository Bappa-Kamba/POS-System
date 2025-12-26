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
var ExpensesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let ExpensesService = ExpensesService_1 = class ExpensesService {
    prisma;
    logger = new common_1.Logger(ExpensesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        let expenseDate;
        if (data.date.includes('T') || data.date.includes(':')) {
            expenseDate = new Date(data.date);
        }
        else {
            const datePart = data.date;
            const now = new Date();
            expenseDate = new Date(`${datePart}T${now.toTimeString().split(' ')[0]}`);
        }
        if (isNaN(expenseDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
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
        await this.logAudit({
            userId,
            action: 'CREATE',
            entity: 'Expense',
            entityId: expense.id,
            newValues: JSON.stringify(expense),
        });
        return expense;
    }
    async findAll(params) {
        const { skip = 0, take = 20, search, category, startDate, endDate, branchId, } = params;
        const where = {
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
                    gte: (0, date_fns_1.startOfDay)(new Date(startDate)),
                    lte: (0, date_fns_1.endOfDay)(new Date(endDate)),
                },
            }),
            ...(startDate &&
                !endDate && {
                date: {
                    gte: (0, date_fns_1.startOfDay)(new Date(startDate)),
                },
            }),
            ...(!startDate &&
                endDate && {
                date: {
                    lte: (0, date_fns_1.endOfDay)(new Date(endDate)),
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Expense not found');
        }
        return expense;
    }
    async update(id, data, userId) {
        const expense = await this.findOne(id);
        const oldValues = JSON.stringify(expense);
        let expenseDate;
        if (data.date) {
            if (data.date.includes('T') || data.date.includes(':')) {
                expenseDate = new Date(data.date);
            }
            else {
                const datePart = data.date;
                const existingTime = expense.date
                    ? new Date(expense.date).toTimeString().split(' ')[0]
                    : new Date().toTimeString().split(' ')[0];
                expenseDate = new Date(`${datePart}T${existingTime}`);
            }
            if (isNaN(expenseDate.getTime())) {
                throw new common_1.BadRequestException('Invalid date format');
            }
        }
        const updateData = {
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
    async remove(id, userId) {
        const expense = await this.findOne(id);
        const oldValues = JSON.stringify(expense);
        await this.prisma.expense.delete({
            where: { id },
        });
        await this.logAudit({
            userId,
            action: 'DELETE',
            entity: 'Expense',
            entityId: id,
            oldValues,
        });
        return expense;
    }
    async getCategories(branchId) {
        const categories = await this.prisma.expenseCategory.findMany({
            where: { branchId, isActive: true },
            select: { name: true },
            orderBy: { name: 'asc' },
        });
        const expenseCategories = await this.prisma.expense.findMany({
            where: { branchId },
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        const categoryNames = new Set([
            ...categories.map((c) => c.name),
            ...expenseCategories.map((e) => e.category),
        ]);
        return Array.from(categoryNames).sort();
    }
    async createCategory(data, branchId, userId) {
        const existing = await this.prisma.expenseCategory.findUnique({
            where: {
                name_branchId: {
                    name: data.name,
                    branchId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Category "${data.name}" already exists for this branch`);
        }
        const category = await this.prisma.expenseCategory.create({
            data: {
                name: data.name,
                description: data.description,
                branchId,
            },
        });
        await this.logAudit({
            userId,
            action: 'CREATE',
            entity: 'ExpenseCategory',
            entityId: category.id,
            newValues: JSON.stringify(category),
        });
        return category;
    }
    async getAllCategories(branchId) {
        return this.prisma.expenseCategory.findMany({
            where: { branchId },
            orderBy: { name: 'asc' },
        });
    }
    async getCategory(id, branchId) {
        const category = await this.prisma.expenseCategory.findFirst({
            where: { id, branchId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Expense category not found');
        }
        return category;
    }
    async updateCategory(id, data, branchId, userId) {
        const category = await this.getCategory(id, branchId);
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
                throw new common_1.ConflictException(`Category "${data.name}" already exists for this branch`);
            }
        }
        const oldValues = JSON.stringify(category);
        const updated = await this.prisma.expenseCategory.update({
            where: { id },
            data,
        });
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
    async deleteCategory(id, branchId, userId) {
        const category = await this.getCategory(id, branchId);
        const expenseCount = await this.prisma.expense.count({
            where: { category: category.name, branchId },
        });
        if (expenseCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category "${category.name}" as it is being used by ${expenseCount} expense(s)`);
        }
        const oldValues = JSON.stringify(category);
        await this.prisma.expenseCategory.delete({
            where: { id },
        });
        await this.logAudit({
            userId,
            action: 'DELETE',
            entity: 'ExpenseCategory',
            entityId: id,
            oldValues,
        });
        return category;
    }
    async getTotalExpenses(branchId, startDate, endDate) {
        const where = {
            branchId,
            ...(startDate &&
                endDate && {
                date: {
                    gte: (0, date_fns_1.startOfDay)(startDate),
                    lte: (0, date_fns_1.endOfDay)(endDate),
                },
            }),
            ...(startDate &&
                !endDate && {
                date: {
                    gte: (0, date_fns_1.startOfDay)(startDate),
                },
            }),
            ...(!startDate &&
                endDate && {
                date: {
                    lte: (0, date_fns_1.endOfDay)(endDate),
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
    async logAudit(data) {
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
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = ExpensesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map