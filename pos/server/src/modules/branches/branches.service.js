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
var BranchesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BranchesService = BranchesService_1 = class BranchesService {
    prisma;
    logger = new common_1.Logger(BranchesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const existingBranch = await this.prisma.branch.findFirst({
            where: { name: data.name },
        });
        if (existingBranch) {
            throw new common_1.ConflictException('Branch name already exists');
        }
        const branch = await this.prisma.branch.create({
            data: {
                name: data.name,
                location: data.location,
                phone: data.phone,
                email: data.email,
                address: data.address,
                taxRate: data.taxRate ?? 0.075,
                currency: data.currency ?? 'NGN',
                businessName: data.businessName,
                businessAddress: data.businessAddress,
                businessPhone: data.businessPhone,
                receiptFooter: data.receiptFooter,
                cashbackCapital: data.cashbackCapital ?? 0,
                cashbackServiceChargeRate: data.cashbackServiceChargeRate ?? 0.02,
            },
        });
        this.logger.log(`Branch created: ${branch.id} - ${branch.name}`);
        return branch;
    }
    async findAll(params) {
        const { skip = 0, take = 20, search } = params;
        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { location: { contains: search } },
                    { address: { contains: search } },
                ],
            }),
        };
        const [branches, total] = await Promise.all([
            this.prisma.branch.findMany({
                where,
                skip,
                take,
                include: {
                    _count: {
                        select: {
                            users: true,
                            products: true,
                            sales: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.branch.count({ where }),
        ]);
        return {
            data: branches,
            meta: {
                total,
                page: Math.floor(skip / take) + 1,
                lastPage: Math.ceil(total / take),
            },
        };
    }
    async findOne(id) {
        const branch = await this.prisma.branch.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        products: true,
                        sales: true,
                        expenses: true,
                        sessions: true,
                    },
                },
            },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        return branch;
    }
    async update(id, data) {
        const branch = await this.findOne(id);
        if (data.name && data.name !== branch.name) {
            const existingBranch = await this.prisma.branch.findFirst({
                where: { name: data.name },
            });
            if (existingBranch) {
                throw new common_1.ConflictException('Branch name already exists');
            }
        }
        const updated = await this.prisma.branch.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.address !== undefined && { address: data.address }),
                ...(data.taxRate !== undefined && { taxRate: data.taxRate }),
                ...(data.currency !== undefined && { currency: data.currency }),
                ...(data.businessName !== undefined && {
                    businessName: data.businessName,
                }),
                ...(data.businessAddress !== undefined && {
                    businessAddress: data.businessAddress,
                }),
                ...(data.businessPhone !== undefined && {
                    businessPhone: data.businessPhone,
                }),
                ...(data.receiptFooter !== undefined && {
                    receiptFooter: data.receiptFooter,
                }),
                ...(data.cashbackCapital !== undefined && {
                    cashbackCapital: data.cashbackCapital,
                }),
                ...(data.cashbackServiceChargeRate !== undefined && {
                    cashbackServiceChargeRate: data.cashbackServiceChargeRate,
                }),
            },
        });
        this.logger.log(`Branch updated: ${updated.id} - ${updated.name}`);
        return updated;
    }
    async remove(id) {
        const branch = await this.findOne(id);
        const userCount = await this.prisma.user.count({
            where: { branchId: id },
        });
        if (userCount > 0) {
            throw new common_1.BadRequestException('Cannot delete branch with assigned users. Please reassign or remove users first.');
        }
        const productCount = await this.prisma.product.count({
            where: { branchId: id },
        });
        if (productCount > 0) {
            throw new common_1.BadRequestException('Cannot delete branch with products. Please reassign or remove products first.');
        }
        const deleted = await this.prisma.branch.delete({
            where: { id },
        });
        this.logger.log(`Branch deleted: ${deleted.id} - ${deleted.name}`);
        return deleted;
    }
    async getStatistics(id) {
        const branch = await this.findOne(id);
        const [totalUsers, activeUsers, totalProducts, totalSales, totalRevenue, activeSessions,] = await Promise.all([
            this.prisma.user.count({ where: { branchId: id } }),
            this.prisma.user.count({ where: { branchId: id, isActive: true } }),
            this.prisma.product.count({ where: { branchId: id } }),
            this.prisma.sale.count({ where: { branchId: id } }),
            this.prisma.sale.aggregate({
                where: { branchId: id, paymentStatus: 'PAID' },
                _sum: { totalAmount: true },
            }),
            this.prisma.session.count({
                where: { branchId: id, status: 'OPEN' },
            }),
        ]);
        return {
            branch,
            statistics: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                },
                products: totalProducts,
                sales: {
                    total: totalSales,
                    revenue: totalRevenue._sum.totalAmount || 0,
                },
                sessions: {
                    active: activeSessions,
                },
            },
        };
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = BranchesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map