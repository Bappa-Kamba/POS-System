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
var SubdivisionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubdivisionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let SubdivisionsService = SubdivisionsService_1 = class SubdivisionsService {
    prisma;
    logger = new common_1.Logger(SubdivisionsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.subdivision.findMany({
            include: {
                _count: {
                    select: {
                        categories: true,
                        branchSubdivisions: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const subdivision = await this.prisma.subdivision.findUnique({
            where: { id },
            include: {
                categories: {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' },
                },
                branchSubdivisions: {
                    include: {
                        branch: {
                            select: { id: true, name: true },
                        },
                    },
                },
                _count: {
                    select: {
                        categories: true,
                    },
                },
            },
        });
        if (!subdivision) {
            throw new common_1.NotFoundException('Subdivision not found');
        }
        return subdivision;
    }
    async findByBranch(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const branchSubdivisions = await this.prisma.branchSubdivision.findMany({
            where: {
                branchId,
                isActive: true,
            },
            include: {
                subdivision: {
                    include: {
                        categories: {
                            where: { isActive: true },
                            orderBy: { displayOrder: 'asc' },
                        },
                        _count: {
                            select: {
                                categories: true,
                            },
                        },
                    },
                },
            },
        });
        return branchSubdivisions.map((bs) => bs.subdivision);
    }
    async create(data) {
        const existing = await this.prisma.subdivision.findUnique({
            where: { name: data.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Subdivision with this name already exists');
        }
        const defaultColors = [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#EC4899',
        ];
        const color = data.color ||
            defaultColors[Math.floor(Math.random() * defaultColors.length)];
        const icon = data.icon || 'Package';
        const subdivision = await this.prisma.subdivision.create({
            data: {
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                color,
                icon,
                status: client_1.SubdivisionStatus.ACTIVE,
            },
        });
        this.logger.log(`Subdivision created: ${subdivision.name}`);
        return subdivision;
    }
    async update(id, data) {
        const subdivision = await this.findOne(id);
        if (data.name && data.name !== subdivision.name) {
            const existing = await this.prisma.subdivision.findUnique({
                where: { name: data.name },
            });
            if (existing) {
                throw new common_1.ConflictException('Subdivision with this name already exists');
            }
        }
        const updated = await this.prisma.subdivision.update({
            where: { id },
            data: {
                displayName: data.displayName,
                description: data.description,
                color: data.color,
                icon: data.icon,
                status: data.status,
                receiptBusinessName: data.receiptBusinessName,
                receiptAddress: data.receiptAddress,
                receiptPhone: data.receiptPhone,
                receiptFooter: data.receiptFooter,
            },
        });
        this.logger.log(`Subdivision updated: ${updated.name}`);
        return updated;
    }
    async toggleStatus(id) {
        const subdivision = await this.findOne(id);
        const newStatus = subdivision.status === client_1.SubdivisionStatus.ACTIVE
            ? client_1.SubdivisionStatus.INACTIVE
            : client_1.SubdivisionStatus.ACTIVE;
        const updated = await this.prisma.subdivision.update({
            where: { id },
            data: { status: newStatus },
        });
        this.logger.log(`Subdivision status toggled: ${updated.name} -> ${newStatus}`);
        return updated;
    }
    async assignToBranch(data) {
        const { branchId, subdivisionId } = data;
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const subdivision = await this.prisma.subdivision.findUnique({
            where: { id: subdivisionId },
        });
        if (!subdivision) {
            throw new common_1.NotFoundException('Subdivision not found');
        }
        const existing = await this.prisma.branchSubdivision.findUnique({
            where: {
                branchId_subdivisionId: {
                    branchId,
                    subdivisionId,
                },
            },
        });
        if (existing) {
            if (!existing.isActive) {
                const updated = await this.prisma.branchSubdivision.update({
                    where: { id: existing.id },
                    data: { isActive: true },
                });
                this.logger.log(`Subdivision reactivated for branch: ${subdivision.name} -> ${branch.name}`);
                return updated;
            }
            throw new common_1.ConflictException('Subdivision already assigned to this branch');
        }
        const branchSubdivision = await this.prisma.branchSubdivision.create({
            data: {
                branchId,
                subdivisionId,
                isActive: true,
            },
            include: {
                branch: true,
                subdivision: true,
            },
        });
        this.logger.log(`Subdivision assigned to branch: ${subdivision.name} -> ${branch.name}`);
        return branchSubdivision;
    }
    async removeFromBranch(branchId, subdivisionId) {
        const branchSubdivision = await this.prisma.branchSubdivision.findUnique({
            where: {
                branchId_subdivisionId: {
                    branchId,
                    subdivisionId,
                },
            },
        });
        if (!branchSubdivision) {
            throw new common_1.NotFoundException('Subdivision not assigned to this branch');
        }
        const productsCount = await this.prisma.product.count({
            where: {
                branchId,
                categoryId: {
                    not: null,
                },
                category: {
                    subdivisionId,
                },
                isActive: true,
            },
        });
        if (productsCount > 0) {
            throw new common_1.BadRequestException(`Cannot remove subdivision. There are ${productsCount} active products in this subdivision.`);
        }
        const updated = await this.prisma.branchSubdivision.update({
            where: { id: branchSubdivision.id },
            data: { isActive: false },
        });
        this.logger.log(`Subdivision removed from branch: ${subdivisionId} -> ${branchId}`);
        return updated;
    }
    async getBranchSubdivisions(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const branchSubdivisions = await this.prisma.branchSubdivision.findMany({
            where: {
                branchId,
                isActive: true,
            },
            include: {
                subdivision: {
                    include: {
                        categories: {
                            where: { isActive: true },
                            orderBy: { displayOrder: 'asc' },
                            include: {
                                _count: {
                                    select: {
                                        products: {
                                            where: {
                                                branchId,
                                                isActive: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                subdivision: {
                    createdAt: 'asc',
                },
            },
        });
        return branchSubdivisions.map((bs) => ({
            ...bs.subdivision,
            branchSubdivisionId: bs.id,
            assignedAt: bs.createdAt,
        }));
    }
};
exports.SubdivisionsService = SubdivisionsService;
exports.SubdivisionsService = SubdivisionsService = SubdivisionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubdivisionsService);
//# sourceMappingURL=subdivisions.service.js.map