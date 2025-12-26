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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    prisma;
    logger = new common_1.Logger(CategoriesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(subdivisionId) {
        const where = subdivisionId ? { subdivisionId } : {};
        const categories = await this.prisma.category.findMany({
            where,
            include: {
                subdivision: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                    },
                },
                _count: {
                    select: {
                        products: {
                            where: { isActive: true },
                        },
                    },
                },
            },
            orderBy: [{ subdivisionId: 'asc' }, { displayOrder: 'asc' }],
        });
        return categories.map((category) => ({
            ...category,
            productCount: category._count.products,
        }));
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                subdivision: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        color: true,
                        icon: true,
                    },
                },
                _count: {
                    select: {
                        products: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return {
            ...category,
            productCount: category._count.products,
        };
    }
    async create(data, user) {
        const subdivision = await this.prisma.subdivision.findUnique({
            where: { id: data.subdivisionId },
        });
        if (!subdivision) {
            throw new common_1.NotFoundException('Subdivision not found');
        }
        if (user.role === client_1.UserRole.CASHIER) {
            if (!user.assignedSubdivisionId) {
                throw new common_1.ForbiddenException('You do not have an assigned subdivision');
            }
            if (subdivision.id !== user.assignedSubdivisionId) {
                throw new common_1.ForbiddenException('You can only create categories in your assigned subdivision');
            }
        }
        const existing = await this.prisma.category.findUnique({
            where: {
                name_subdivisionId: {
                    name: data.name,
                    subdivisionId: data.subdivisionId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Category with this name already exists in this subdivision');
        }
        let displayOrder = data.displayOrder;
        if (displayOrder === undefined) {
            const maxOrder = await this.prisma.category.findFirst({
                where: { subdivisionId: data.subdivisionId },
                orderBy: { displayOrder: 'desc' },
                select: { displayOrder: true },
            });
            displayOrder = (maxOrder?.displayOrder ?? -1) + 1;
        }
        const category = await this.prisma.category.create({
            data: {
                name: data.name,
                subdivisionId: data.subdivisionId,
                description: data.description,
                displayOrder,
                isActive: true,
            },
            include: {
                subdivision: true,
            },
        });
        this.logger.log(`Category created: ${category.name} in ${subdivision.displayName}`);
        return category;
    }
    async update(id, data, user) {
        const category = await this.findOne(id);
        await this.validateAccess(id, user);
        if (data.name && data.name !== category.name) {
            const existing = await this.prisma.category.findUnique({
                where: {
                    name_subdivisionId: {
                        name: data.name,
                        subdivisionId: category.subdivisionId,
                    },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Category with this name already exists in this subdivision');
            }
        }
        const updated = await this.prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                displayOrder: data.displayOrder,
                isActive: data.isActive,
            },
            include: {
                subdivision: true,
            },
        });
        this.logger.log(`Category updated: ${updated.name}`);
        return updated;
    }
    async remove(id, user) {
        await this.findOne(id);
        await this.validateAccess(id, user);
        const productCount = await this.prisma.product.count({
            where: {
                categoryId: id,
                isActive: true,
            },
        });
        if (productCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category. There are ${productCount} active products in this category.`);
        }
        const deleted = await this.prisma.category.update({
            where: { id },
            data: { isActive: false },
            include: {
                subdivision: true,
            },
        });
        this.logger.log(`Category deactivated: ${deleted.name}`);
        return deleted;
    }
    async getBySubdivision(subdivisionId) {
        const categories = await this.prisma.category.findMany({
            where: {
                subdivisionId,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                displayOrder: true,
            },
            orderBy: { displayOrder: 'asc' },
        });
        return categories;
    }
    async reorder(data) {
        const { categoryIds } = data;
        const categories = await this.prisma.category.findMany({
            where: {
                id: { in: categoryIds },
            },
        });
        if (categories.length !== categoryIds.length) {
            throw new common_1.BadRequestException('One or more categories not found');
        }
        await this.prisma.$transaction(categoryIds.map((categoryId, index) => this.prisma.category.update({
            where: { id: categoryId },
            data: { displayOrder: index },
        })));
        this.logger.log(`Categories reordered: ${categoryIds.length} categories`);
        return { success: true, message: 'Categories reordered successfully' };
    }
    async validateAccess(categoryId, user) {
        if (user.role === client_1.UserRole.ADMIN) {
            return;
        }
        if (user.role === client_1.UserRole.CASHIER) {
            if (!user.assignedSubdivisionId) {
                throw new common_1.ForbiddenException('You do not have an assigned subdivision');
            }
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
                include: {
                    subdivision: true,
                },
            });
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            if (category.subdivision.id !== user.assignedSubdivisionId) {
                throw new common_1.ForbiddenException('You can only access categories in your assigned subdivision');
            }
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map