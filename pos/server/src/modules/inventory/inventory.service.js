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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
let InventoryService = InventoryService_1 = class InventoryService {
    prisma;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async adjustStock(data, userId, branchId) {
        let product;
        let variant;
        let previousQuantity;
        let newQuantity;
        if (data.variantId) {
            variant = await this.prisma.productVariant.findUnique({
                where: { id: data.variantId },
                include: { product: true },
            });
            if (!variant) {
                throw new common_1.NotFoundException('Variant not found');
            }
            if (variant.product.branchId !== branchId) {
                throw new common_1.BadRequestException('Variant does not belong to your branch');
            }
            previousQuantity = variant.quantityInStock;
            newQuantity = previousQuantity + data.quantityChange;
            if (newQuantity < 0) {
                throw new common_1.BadRequestException(`Insufficient stock. Current stock: ${previousQuantity}, Attempted change: ${data.quantityChange}`);
            }
            await this.prisma.productVariant.update({
                where: { id: data.variantId },
                data: { quantityInStock: newQuantity },
            });
            product = variant.product;
        }
        else {
            product = await this.prisma.product.findUnique({
                where: { id: data.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            if (product.branchId !== branchId) {
                throw new common_1.BadRequestException('Product does not belong to your branch');
            }
            if (product.hasVariants) {
                throw new common_1.BadRequestException('Product has variants. Please specify a variantId');
            }
            if (product.quantityInStock === null) {
                throw new common_1.BadRequestException('Product does not track inventory');
            }
            previousQuantity = product.quantityInStock;
            newQuantity = previousQuantity + data.quantityChange;
            if (newQuantity < 0) {
                throw new common_1.BadRequestException(`Insufficient stock. Current stock: ${previousQuantity}, Attempted change: ${data.quantityChange}`);
            }
            await this.prisma.product.update({
                where: { id: data.productId },
                data: { quantityInStock: newQuantity },
            });
        }
        const inventoryLog = await this.prisma.inventoryLog.create({
            data: {
                productId: product.id,
                variantId: data.variantId,
                changeType: data.changeType,
                quantityChange: data.quantityChange,
                previousQuantity,
                newQuantity,
                reason: data.reason,
                notes: data.notes,
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    },
                },
                variant: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    },
                },
            },
        });
        this.logger.log(`Stock adjusted: ${product.name}${variant ? ` (${variant.name})` : ''} - ${data.quantityChange > 0 ? '+' : ''}${data.quantityChange} (${previousQuantity} → ${newQuantity})`);
        await this.logAudit({
            userId,
            action: client_1.AuditAction.UPDATE,
            entity: 'Inventory',
            entityId: data.variantId || data.productId,
            newValues: JSON.stringify({
                productId: product.id,
                variantId: data.variantId,
                changeType: data.changeType,
                quantityChange: data.quantityChange,
                previousQuantity,
                newQuantity,
                reason: data.reason,
            }),
        });
        return inventoryLog;
    }
    async getInventoryLogs(params, branchId) {
        const { page = '1', limit = '50', productId, variantId, changeType, startDate, endDate, } = params;
        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const take = parseInt(limit, 10);
        const where = {
            product: {
                branchId,
            },
            ...(productId && { productId }),
            ...(variantId && { variantId }),
            ...(changeType && { changeType }),
            ...(startDate &&
                endDate && {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            }),
        };
        const [logs, total] = await Promise.all([
            this.prisma.inventoryLog.findMany({
                where,
                skip,
                take,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                        },
                    },
                    variant: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.inventoryLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: {
                total,
                page: parseInt(page, 10),
                lastPage: Math.ceil(total / take),
            },
        };
    }
    async getExpiringItems(branchId, days = 30) {
        const expiryDate = (0, date_fns_1.addDays)(new Date(), days);
        const today = (0, date_fns_1.startOfDay)(new Date());
        const variants = await this.prisma.productVariant.findMany({
            where: {
                isActive: true,
                product: {
                    branchId,
                    isActive: true,
                },
                expiryDate: {
                    not: null,
                    gte: today,
                    lte: expiryDate,
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                expiryDate: 'asc',
            },
        });
        return variants.map((v) => ({
            id: v.id,
            name: `${v.product.name} (${v.name})`,
            sku: v.sku,
            productId: v.productId,
            productName: v.product.name,
            category: v.product.category?.name || null,
            currentStock: v.quantityInStock,
            expiryDate: v.expiryDate,
            daysUntilExpiry: v.expiryDate
                ? Math.ceil((v.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : null,
        }));
    }
    async getAllInventory(branchId) {
        const products = await this.prisma.product.findMany({
            where: {
                branchId,
                isActive: true,
                hasVariants: false,
            },
            select: {
                id: true,
                name: true,
                sku: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                quantityInStock: true,
                lowStockThreshold: true,
                unitType: true,
            },
            orderBy: { name: 'asc' },
        });
        const variants = await this.prisma.productVariant.findMany({
            where: {
                isActive: true,
                product: {
                    branchId,
                    isActive: true,
                    hasVariants: true,
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        return {
            products: products.map((p) => ({
                ...p,
                category: p.category?.name || null,
                isVariant: false,
            })),
            variants: variants.map((v) => ({
                id: v.id,
                name: `${v.product.name} (${v.name})`,
                sku: v.sku,
                productId: v.productId,
                productName: v.product.name,
                category: v.product.category?.name || null,
                quantityInStock: v.quantityInStock,
                lowStockThreshold: v.lowStockThreshold,
                unitType: 'PIECE',
                isVariant: true,
            })),
        };
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
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map