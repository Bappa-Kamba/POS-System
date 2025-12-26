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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let VariantsService = class VariantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(productId, data) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.hasVariants) {
            throw new common_1.BadRequestException('Cannot add variants to a product that does not support variants');
        }
        if (!data.sku.startsWith(`${product.sku}-`)) {
            throw new common_1.BadRequestException(`Variant SKU must start with "${product.sku}-"`);
        }
        const existingSku = await this.prisma.productVariant.findUnique({
            where: { sku: data.sku },
        });
        if (existingSku) {
            throw new common_1.ConflictException('SKU already exists');
        }
        if (data.barcode) {
            const existingBarcode = await this.prisma.productVariant.findUnique({
                where: { barcode: data.barcode },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException('Barcode already exists');
            }
        }
        if (data.sellingPrice < data.costPrice) {
            throw new common_1.BadRequestException('Selling price cannot be less than cost price');
        }
        const variant = await this.prisma.productVariant.create({
            data: {
                ...data,
                productId,
                isActive: true,
            },
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
            },
        });
        return variant;
    }
    async findAllByProduct(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const variants = await this.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { name: 'asc' },
        });
        return variants;
    }
    async findOne(id) {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id },
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
            },
        });
        if (!variant) {
            throw new common_1.NotFoundException('Variant not found');
        }
        return variant;
    }
    async update(id, data) {
        const variant = await this.findOne(id);
        if (data.sku && data.sku !== variant.sku) {
            const product = await this.prisma.product.findUnique({
                where: { id: variant.productId },
                select: { sku: true },
            });
            if (product && !data.sku.startsWith(`${product.sku}-`)) {
                throw new common_1.BadRequestException(`Variant SKU must start with "${product.sku}-"`);
            }
            const existingSku = await this.prisma.productVariant.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw new common_1.ConflictException('SKU already exists');
            }
        }
        if (data.barcode && data.barcode !== variant.barcode) {
            const existingBarcode = await this.prisma.productVariant.findUnique({
                where: { barcode: data.barcode },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException('Barcode already exists');
            }
        }
        const costPrice = data.costPrice ?? variant.costPrice;
        const sellingPrice = data.sellingPrice ?? variant.sellingPrice;
        if (sellingPrice < costPrice) {
            throw new common_1.BadRequestException('Selling price cannot be less than cost price');
        }
        const updated = await this.prisma.productVariant.update({
            where: { id },
            data,
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
            },
        });
        return updated;
    }
    async remove(id) {
        const variant = await this.findOne(id);
        if (!variant.isActive) {
            throw new common_1.BadRequestException('Variant not found');
        }
        const deleted = await this.prisma.productVariant.update({
            where: { id },
            data: { isActive: false },
        });
        return deleted;
    }
    async checkStock(id, quantity) {
        const variant = await this.findOne(id);
        return variant.quantityInStock >= quantity;
    }
    async adjustStock(params) {
        const { id, quantityChange, changeType, reason, notes } = params;
        const variant = await this.findOne(id);
        const newQuantity = variant.quantityInStock + quantityChange;
        if (newQuantity < 0) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        const updated = await this.prisma.productVariant.update({
            where: { id },
            data: { quantityInStock: newQuantity },
        });
        await this.prisma.inventoryLog.create({
            data: {
                productId: variant.productId,
                variantId: id,
                changeType: changeType,
                quantityChange,
                previousQuantity: variant.quantityInStock,
                newQuantity,
                reason,
                notes,
            },
        });
        return updated;
    }
    async getLowStock(branchId) {
        const where = {
            isActive: true,
        };
        if (branchId) {
            where.product =
                {
                    branchId,
                    isActive: true,
                };
        }
        const whereClause = {
            isActive: true,
            ...(branchId && {
                product: {
                    branchId,
                    isActive: true,
                },
            }),
        };
        const variants = await this.prisma.productVariant.findMany({
            where: whereClause,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        branchId: true,
                    },
                },
            },
        });
        const lowStockVariants = variants.filter((v) => v.quantityInStock != null &&
            v.lowStockThreshold != null &&
            v.quantityInStock <= v.lowStockThreshold);
        return lowStockVariants;
    }
    async getExpiring(days = 30, branchId) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const whereClause = {
            isActive: true,
            expiryDate: {
                lte: futureDate,
                gte: new Date(),
            },
            ...(branchId && {
                product: {
                    branchId,
                    isActive: true,
                },
            }),
        };
        const variants = await this.prisma.productVariant.findMany({
            where: whereClause,
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
            },
            orderBy: { expiryDate: 'asc' },
        });
        return variants;
    }
};
exports.VariantsService = VariantsService;
exports.VariantsService = VariantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VariantsService);
//# sourceMappingURL=variants.service.js.map