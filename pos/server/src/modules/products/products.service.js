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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProductsService = ProductsService_1 = class ProductsService {
    prisma;
    logger = new common_1.Logger(ProductsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildAccessibleProductsWhere(user) {
        if (user.role === client_1.UserRole.ADMIN) {
            return {};
        }
        if (user.role === client_1.UserRole.CASHIER) {
            if (!user.assignedSubdivisionId) {
                throw new common_1.ForbiddenException('You have not been assigned to a product subdivision');
            }
            return {
                branchId: user.branchId,
                category: {
                    subdivisionId: user.assignedSubdivisionId,
                },
            };
        }
        throw new common_1.ForbiddenException('Invalid user role');
    }
    async verifyProductAccess(productId, user) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: {
                    select: {
                        subdivisionId: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (user.role === client_1.UserRole.ADMIN) {
            return;
        }
        if (user.role === client_1.UserRole.CASHIER) {
            if (product.branchId !== user.branchId ||
                product.category?.subdivisionId !== user.assignedSubdivisionId) {
                this.logger.warn(`Unauthorized product access attempt by user ${user.id} on product ${productId}`);
                throw new common_1.ForbiddenException('You do not have access to this product');
            }
            return;
        }
        throw new common_1.ForbiddenException('Invalid user role');
    }
    async create(data, userId, user) {
        if (user.role === client_1.UserRole.CASHIER && data.branchId !== user.branchId) {
            throw new common_1.ForbiddenException('You can only create products for your assigned branch');
        }
        const existingSku = await this.prisma.product.findUnique({
            where: { sku: data.sku },
        });
        if (existingSku) {
            throw new common_1.ConflictException('Product with this SKU already exists');
        }
        if (data.barcode) {
            const existingBarcode = await this.prisma.product.findUnique({
                where: { barcode: data.barcode },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException('Product with this barcode already exists');
            }
        }
        if (!data.hasVariants) {
            if (data.costPrice == null || data.sellingPrice == null) {
                throw new common_1.BadRequestException('Products without variants must have cost and selling prices');
            }
            if (data.sellingPrice < data.costPrice) {
                throw new common_1.BadRequestException('Selling price cannot be less than cost price');
            }
        }
        const product = await this.prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                sku: data.sku,
                barcode: data.barcode,
                hasVariants: data.hasVariants,
                costPrice: data.costPrice,
                sellingPrice: data.sellingPrice,
                quantityInStock: data.quantityInStock,
                unitType: data.unitType,
                lowStockThreshold: data.lowStockThreshold,
                branchId: data.branchId,
                categoryId: data.category,
                isActive: true,
            },
            include: {
                branch: {
                    select: { id: true, name: true },
                },
            },
        });
        await this.logAudit({
            userId,
            action: client_1.AuditAction.CREATE,
            entity: 'Product',
            entityId: product.id,
            newValues: JSON.stringify(product),
        });
        return product;
    }
    async findAll(params, user) {
        const { skip = 0, take = 20, search, categoryId, isActive, hasVariants, lowStock, branchId, } = params;
        this.logger.log(JSON.stringify(params, null, 2));
        this.logger.log(`Products findAll - isActive: ${isActive} (type: ${typeof isActive})`);
        const accessFilter = user ? this.buildAccessibleProductsWhere(user) : {};
        const where = {
            ...accessFilter,
            ...(branchId && { branchId }),
            ...(isActive !== undefined &&
                isActive !== 'ALL' &&
                typeof isActive === 'boolean' && { isActive }),
            ...(categoryId && { categoryId }),
            ...(hasVariants !== undefined && { hasVariants }),
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { sku: { contains: search } },
                    { barcode: { contains: search } },
                ],
            }),
        };
        if (lowStock) {
            where.AND = [
                {
                    hasVariants: false,
                    quantityInStock: { not: null },
                    lowStockThreshold: { not: null },
                },
            ];
        }
        let variantResults = [];
        if (search) {
            this.logger.log(`Searching variants with query: ${search}, branchId: ${branchId}`);
            const productFilter = {
                ...(branchId && { branchId }),
                isActive: true,
            };
            if (user && user.role === client_1.UserRole.CASHIER) {
                if (!user.assignedSubdivisionId) {
                    throw new common_1.ForbiddenException('You have not been assigned to a product subdivision');
                }
                productFilter.category = {
                    subdivisionId: user.assignedSubdivisionId,
                };
            }
            const variants = await this.prisma.productVariant.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: search } },
                        { sku: { contains: search } },
                        { barcode: { contains: search } },
                    ],
                    product: productFilter,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            branchId: true,
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                take: 50,
            });
            variantResults = variants;
            this.logger.log(`Found ${variantResults.length} variants matching search`);
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take,
                include: {
                    branch: {
                        select: { id: true, name: true },
                    },
                    category: {
                        select: { id: true, name: true },
                    },
                    variants: search
                        ? undefined
                        : {
                            where: { isActive: true },
                            take: 0,
                        },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);
        let filteredProducts = products;
        if (lowStock) {
            filteredProducts = products.filter((p) => {
                this.logger.log(JSON.stringify(p, null, 2));
                return (p.quantityInStock != null &&
                    p.lowStockThreshold != null &&
                    p.quantityInStock <= p.lowStockThreshold);
            });
        }
        const responseData = {
            data: filteredProducts,
            meta: {
                total: lowStock ? filteredProducts.length : total,
                page: Math.floor(skip / take) + 1,
                lastPage: Math.ceil((lowStock ? filteredProducts.length : total) / take),
            },
        };
        if (search && variantResults.length > 0) {
            responseData.variants = variantResults;
            this.logger.log(`Including ${variantResults.length} variants in response`);
        }
        this.logger.log(`Returning response with ${responseData.data.length} products and ${responseData.variants?.length || 0} variants`);
        return responseData;
    }
    async findOne(id, user) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                branch: {
                    select: { id: true, name: true },
                },
                category: {
                    select: { id: true, name: true },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { name: 'asc' },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (user) {
            await this.verifyProductAccess(id, user);
        }
        return product;
    }
    async update(id, data, userId, user) {
        const product = await this.findOne(id, user);
        const oldValues = JSON.stringify(product);
        if (data.sku && data.sku !== product.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw new common_1.ConflictException('Product with this SKU already exists');
            }
        }
        if (data.barcode && data.barcode !== product.barcode) {
            const existingBarcode = await this.prisma.product.findUnique({
                where: { barcode: data.barcode },
            });
            if (existingBarcode) {
                throw new common_1.ConflictException('Product with this barcode already exists');
            }
        }
        if (data.hasVariants === false ||
            (!data.hasVariants && !product.hasVariants)) {
            const costPrice = data.costPrice ?? product.costPrice;
            const sellingPrice = data.sellingPrice ?? product.sellingPrice;
            if (costPrice != null &&
                sellingPrice != null &&
                sellingPrice < costPrice) {
                throw new common_1.BadRequestException('Selling price cannot be less than cost price');
            }
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                sku: data.sku,
                barcode: data.barcode,
                hasVariants: data.hasVariants,
                costPrice: data.costPrice,
                sellingPrice: data.sellingPrice,
                quantityInStock: data.quantityInStock,
                unitType: data.unitType,
                lowStockThreshold: data.lowStockThreshold,
                categoryId: data.category,
            },
            include: {
                branch: {
                    select: { id: true, name: true },
                },
            },
        });
        await this.logAudit({
            userId,
            action: client_1.AuditAction.UPDATE,
            entity: 'Product',
            entityId: id,
            oldValues,
            newValues: JSON.stringify(updated),
        });
        return updated;
    }
    async remove(id, userId, user) {
        const product = await this.findOne(id, user);
        const oldValues = JSON.stringify(product);
        const deleted = await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
            include: {
                branch: {
                    select: { id: true, name: true },
                },
            },
        });
        await this.logAudit({
            userId,
            action: client_1.AuditAction.DELETE,
            entity: 'Product',
            entityId: id,
            oldValues,
            newValues: JSON.stringify(deleted),
        });
        return deleted;
    }
    async checkStock(productId, quantity = 1) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.hasVariants) {
            throw new common_1.BadRequestException('Product has variants, please specify variantId');
        }
        if (product.quantityInStock == null) {
            throw new common_1.BadRequestException('Product does not track inventory');
        }
        return product.quantityInStock >= quantity;
    }
    async generateBarcode() {
        const maxAttempts = 10;
        let attempts = 0;
        while (attempts < maxAttempts) {
            const prefix = '200';
            const random = Math.floor(Math.random() * 1000000000)
                .toString()
                .padStart(9, '0');
            const code = prefix + random;
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                const digit = parseInt(code[i]);
                sum += i % 2 === 0 ? digit : digit * 3;
            }
            const checkDigit = (10 - (sum % 10)) % 10;
            const barcode = code + checkDigit;
            const existingProduct = await this.prisma.product.findUnique({
                where: { barcode },
            });
            if (existingProduct) {
                attempts++;
                continue;
            }
            const existingVariant = await this.prisma.productVariant.findUnique({
                where: { barcode },
            });
            if (existingVariant) {
                attempts++;
                continue;
            }
            return barcode;
        }
        throw new Error('Failed to generate unique barcode after multiple attempts. Please try again.');
    }
    async findByBarcode(barcode) {
        const product = await this.prisma.product.findUnique({
            where: { barcode },
            include: {
                variants: {
                    where: { isActive: true },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (product) {
            return { type: 'product', data: product };
        }
        const variant = await this.prisma.productVariant.findUnique({
            where: { barcode },
            include: {
                product: {
                    include: {
                        branch: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (variant) {
            return { type: 'variant', data: variant };
        }
        return null;
    }
    async search(query, limit = 10) {
        const products = await this.prisma.product.findMany({
            where: {
                isActive: true,
                hasVariants: false,
                OR: [
                    { name: { contains: query } },
                    { sku: { contains: query } },
                    { barcode: { contains: query } },
                ],
            },
            take: limit,
            select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                sellingPrice: true,
                quantityInStock: true,
                unitType: true,
            },
        });
        return products;
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
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map