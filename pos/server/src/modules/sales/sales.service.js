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
var SalesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const sessions_service_1 = require("../sessions/sessions.service");
const receipt_resolution_service_1 = require("../settings/receipt-resolution.service");
let SalesService = SalesService_1 = class SalesService {
    prisma;
    sessionsService;
    receiptResolutionService;
    logger = new common_1.Logger(SalesService_1.name);
    constructor(prisma, sessionsService, receiptResolutionService) {
        this.prisma = prisma;
        this.sessionsService = sessionsService;
        this.receiptResolutionService = receiptResolutionService;
    }
    async generateReceiptNumber(date = new Date()) {
        const dateStr = (0, date_fns_1.format)(date, 'yyyyMMdd');
        const start = (0, date_fns_1.startOfDay)(date);
        const end = (0, date_fns_1.endOfDay)(date);
        const count = await this.prisma.sale.count({
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        const sequence = String(count + 1).padStart(4, '0');
        return `RCP-${dateStr}-${sequence}`;
    }
    async create(data, cashierId, branchId) {
        const transactionType = data.transactionType || 'PURCHASE';
        const activeSession = await this.sessionsService.getActiveSession(branchId, cashierId);
        const cashier = await this.prisma.user.findUnique({
            where: { id: cashierId },
            select: { assignedSubdivisionId: true },
        });
        const subdivisionId = cashier?.assignedSubdivisionId;
        if (transactionType === 'PURCHASE') {
            if (!data.items || data.items.length === 0) {
                throw new common_1.BadRequestException('Purchase must have at least one item');
            }
        }
        else if (transactionType === 'CASHBACK') {
            if (!data.cashbackAmount || data.cashbackAmount <= 0) {
                throw new common_1.BadRequestException('Cashback amount is required and must be greater than 0');
            }
        }
        if (!data.payments || data.payments.length === 0) {
            throw new common_1.BadRequestException('Sale must have at least one payment');
        }
        const saleItems = [];
        let subtotal = 0;
        let taxAmount = 0;
        if (transactionType === 'CASHBACK') {
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { cashbackCapital: true, cashbackServiceChargeRate: true },
            });
            if (!branch) {
                throw new common_1.NotFoundException('Branch not found');
            }
            const cashbackAmount = data.cashbackAmount;
            const serviceCharge = data.serviceCharge !== undefined ? data.serviceCharge : 0;
            if (branch.cashbackCapital < cashbackAmount) {
                throw new common_1.BadRequestException(`Insufficient cashback capital. Available: ${branch.cashbackCapital}, Required: ${cashbackAmount}`);
            }
            subtotal = cashbackAmount + serviceCharge;
            taxAmount = 0;
            const totalAmount = cashbackAmount;
            const receiptNumber = await this.generateReceiptNumber(new Date());
            const sale = await this.prisma.$transaction(async (tx) => {
                await tx.branch.update({
                    where: { id: branchId },
                    data: {
                        cashbackCapital: {
                            decrement: cashbackAmount,
                        },
                    },
                });
                const totalPaid = data.payments.reduce((sum, p) => sum + p.amount, 0);
                const amountDue = totalAmount - totalPaid;
                const changeGiven = totalPaid > totalAmount ? totalPaid - totalAmount : 0;
                const paymentStatus = amountDue <= 0 ? client_1.PaymentStatus.PAID : client_1.PaymentStatus.PARTIAL;
                const newSale = await tx.sale.create({
                    data: {
                        receiptNumber,
                        cashierId,
                        branchId,
                        transactionType: 'CASHBACK',
                        subtotal,
                        taxAmount: 0,
                        discountAmount: 0,
                        totalAmount,
                        paymentStatus,
                        amountPaid: totalPaid,
                        amountDue,
                        changeGiven,
                        subdivisionId,
                        customerName: data.customerName,
                        customerPhone: data.customerPhone,
                        notes: data.notes || `Service Charge: ${serviceCharge.toFixed(2)}`,
                        payments: {
                            create: data.payments.map((payment) => ({
                                method: payment.method,
                                amount: payment.amount,
                                reference: payment.reference,
                                notes: payment.notes,
                            })),
                        },
                    },
                });
                return await tx.sale.findUnique({
                    where: { id: newSale.id },
                    include: {
                        items: true,
                        payments: true,
                        cashier: {
                            select: {
                                id: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        branch: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                });
            });
            return sale;
        }
        for (const itemDto of data.items) {
            let product;
            let variant;
            let availableStock;
            let costPrice;
            let itemName;
            let itemSku;
            if (itemDto.variantId) {
                variant = await this.prisma.productVariant.findUnique({
                    where: { id: itemDto.variantId },
                    include: {
                        product: true,
                    },
                });
                if (!variant || !variant.isActive) {
                    throw new common_1.NotFoundException(`Variant with ID ${itemDto.variantId} not found`);
                }
                product = variant.product;
                if (!product.isActive) {
                    throw new common_1.BadRequestException('Product is not active');
                }
                availableStock = variant.quantityInStock;
                costPrice = variant.costPrice;
                itemName = `${product.name} - ${variant.name}`;
                itemSku = variant.sku;
            }
            else {
                product = await this.prisma.product.findUnique({
                    where: { id: itemDto.productId },
                });
                if (!product || !product.isActive) {
                    throw new common_1.NotFoundException(`Product with ID ${itemDto.productId} not found`);
                }
                if (product.hasVariants) {
                    throw new common_1.BadRequestException('Product has variants, please specify variantId');
                }
                availableStock = product.quantityInStock || 0;
                costPrice = product.costPrice || 0;
                itemName = product.name;
                itemSku = product.sku;
            }
            if (availableStock < itemDto.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${itemName}. Available: ${availableStock}, Requested: ${itemDto.quantity}`);
            }
            const itemSubtotal = itemDto.quantity * itemDto.unitPrice;
            const itemTaxAmount = 0;
            const itemTotal = itemSubtotal;
            subtotal += itemSubtotal;
            taxAmount += itemTaxAmount;
            saleItems.push({
                productId: product.id,
                variantId: variant?.id,
                itemName,
                itemSku,
                quantity: itemDto.quantity,
                unitPrice: itemDto.unitPrice,
                costPrice,
                taxRate: 0,
                taxAmount: 0,
                subtotal: itemSubtotal,
                total: itemTotal,
                availableStock,
                product,
                variant,
            });
        }
        const totalAmount = subtotal + taxAmount;
        const totalPaid = data.payments.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid < totalAmount) {
            throw new common_1.BadRequestException(`Insufficient payment. Total: ${totalAmount}, Paid: ${totalPaid}`);
        }
        const changeGiven = totalPaid > totalAmount ? totalPaid - totalAmount : 0;
        const amountDue = totalAmount - totalPaid;
        const paymentStatus = totalPaid >= totalAmount
            ? client_1.PaymentStatus.PAID
            : totalPaid > 0
                ? client_1.PaymentStatus.PARTIAL
                : client_1.PaymentStatus.PENDING;
        const receiptNumber = await this.generateReceiptNumber();
        const sale = await this.prisma.$transaction(async (tx) => {
            const newSale = await tx.sale.create({
                data: {
                    receiptNumber,
                    cashierId,
                    branchId,
                    sessionId: activeSession?.id,
                    transactionType,
                    subtotal,
                    taxAmount,
                    discountAmount: 0,
                    totalAmount,
                    paymentStatus,
                    amountPaid: totalPaid,
                    amountDue,
                    changeGiven,
                    subdivisionId,
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    notes: data.notes,
                    items: {
                        create: saleItems.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId,
                            itemName: item.itemName,
                            itemSku: item.itemSku,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            costPrice: item.costPrice,
                            taxRate: item.taxRate,
                            taxAmount: item.taxAmount,
                            subtotal: item.subtotal,
                            total: item.total,
                        })),
                    },
                    payments: {
                        create: data.payments.map((payment) => ({
                            method: payment.method,
                            amount: payment.amount,
                            reference: payment.reference,
                            notes: payment.notes,
                        })),
                    },
                },
            });
            if (transactionType === 'PURCHASE') {
                for (const item of saleItems) {
                    if (item.variantId) {
                        const variant = await tx.productVariant.findUnique({
                            where: { id: item.variantId },
                            select: { quantityInStock: true },
                        });
                        const previousQuantity = variant?.quantityInStock || 0;
                        const quantityChange = -item.quantity;
                        const newQuantity = previousQuantity + quantityChange;
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: {
                                quantityInStock: {
                                    increment: quantityChange,
                                },
                            },
                        });
                        await tx.inventoryLog.create({
                            data: {
                                productId: item.productId,
                                variantId: item.variantId,
                                changeType: client_1.InventoryChangeType.SALE,
                                quantityChange,
                                previousQuantity,
                                newQuantity,
                                reason: 'Sale',
                                saleId: newSale.id,
                            },
                        });
                    }
                    else {
                        const product = await tx.product.findUnique({
                            where: { id: item.productId },
                            select: { quantityInStock: true },
                        });
                        const previousQuantity = product?.quantityInStock || 0;
                        const quantityChange = -item.quantity;
                        const newQuantity = previousQuantity + quantityChange;
                        await tx.product.update({
                            where: { id: item.productId },
                            data: {
                                quantityInStock: {
                                    increment: quantityChange,
                                },
                            },
                        });
                        await tx.inventoryLog.create({
                            data: {
                                productId: item.productId,
                                changeType: client_1.InventoryChangeType.SALE,
                                quantityChange,
                                previousQuantity,
                                newQuantity,
                                reason: 'Sale',
                                saleId: newSale.id,
                            },
                        });
                    }
                }
            }
            else if (transactionType === 'CASHBACK') {
                const branch = await tx.branch.findUnique({
                    where: { id: branchId },
                    select: { cashbackCapital: true, cashbackServiceChargeRate: true },
                });
                if (!branch) {
                    throw new common_1.NotFoundException('Branch not found');
                }
                const cashbackAmount = totalAmount;
                if (branch.cashbackCapital < cashbackAmount) {
                    throw new common_1.BadRequestException(`Insufficient cashback capital. Available: ${branch.cashbackCapital}, Required: ${cashbackAmount}`);
                }
                await tx.branch.update({
                    where: { id: branchId },
                    data: {
                        cashbackCapital: {
                            decrement: cashbackAmount,
                        },
                    },
                });
            }
            return await tx.sale.findUnique({
                where: { id: newSale.id },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                    payments: true,
                    cashier: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        });
        return sale;
    }
    async findAll(params) {
        const { skip = 0, take = 20, startDate, endDate, cashierId, branchId, paymentStatus, transactionType, search, } = params;
        const where = {
            ...(branchId && { branchId }),
            ...(cashierId && { cashierId }),
            ...(paymentStatus && { paymentStatus }),
            ...(transactionType && { transactionType }),
            ...(startDate &&
                endDate && {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            }),
            ...(search && {
                OR: [
                    { receiptNumber: { contains: search } },
                    { customerName: { contains: search } },
                    { customerPhone: { contains: search } },
                ],
            }),
        };
        const [sales, total] = await Promise.all([
            this.prisma.sale.findMany({
                where,
                skip,
                take,
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                    payments: true,
                    cashier: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.sale.count({ where }),
        ]);
        return {
            data: sales,
            meta: {
                total,
                page: Math.floor(skip / take) + 1,
                lastPage: Math.ceil(total / take),
            },
        };
    }
    async findOne(id) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
                payments: true,
                cashier: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                        taxRate: true,
                        currency: true,
                    },
                },
            },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        return sale;
    }
    async getReceiptData(id) {
        const sale = await this.prisma.sale.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    }
                },
                payments: true,
                cashier: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                branch: true,
            },
        });
        if (!sale) {
            throw new common_1.NotFoundException('Sale not found');
        }
        if (sale.transactionType === 'CASHBACK') {
            throw new common_1.BadRequestException('Cashback transactions do not generate receipts');
        }
        const receiptConfig = await this.receiptResolutionService.resolveReceiptConfig(sale.subdivisionId, sale.branchId);
        const cashierName = sale.cashier.firstName
            ? `${sale.cashier.firstName} ${sale.cashier.lastName || ''}`.trim()
            : sale.cashier.username;
        return {
            receipt: {
                business: {
                    name: receiptConfig.businessName,
                    address: receiptConfig.businessAddress,
                    phone: receiptConfig.businessPhone,
                },
                branch: receiptConfig.branchName,
                receiptNumber: sale.receiptNumber,
                transactionType: sale.transactionType,
                date: sale.createdAt,
                cashier: cashierName,
                items: sale.items.map((item) => ({
                    name: item.itemName,
                    sku: item.itemSku,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                    taxAmount: item.taxAmount,
                    subtotal: item.subtotal,
                    total: item.total,
                })),
                subtotal: sale.subtotal,
                tax: sale.taxAmount,
                discount: sale.discountAmount,
                total: sale.totalAmount,
                payments: sale.payments.map((payment) => ({
                    method: payment.method,
                    amount: payment.amount,
                    reference: payment.reference,
                })),
                change: sale.changeGiven,
                footer: receiptConfig.receiptFooter,
                currency: receiptConfig.currency,
            },
        };
    }
    async getDailySummary(cashierId, branchId, date) {
        const targetDate = date || new Date();
        const start = (0, date_fns_1.startOfDay)(targetDate);
        const end = (0, date_fns_1.endOfDay)(targetDate);
        const sales = await this.prisma.sale.findMany({
            where: {
                cashierId,
                branchId,
                createdAt: {
                    gte: start,
                    lte: end,
                },
                paymentStatus: client_1.PaymentStatus.PAID,
            },
            include: {
                items: true,
                payments: true,
            },
        });
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalProfit = sales.reduce((sum, sale) => {
            const saleProfit = sale.items.reduce((itemSum, item) => itemSum + (item.unitPrice - item.costPrice) * item.quantity, 0);
            return sum + saleProfit;
        }, 0);
        const paymentBreakdown = {
            CASH: 0,
            CARD: 0,
            TRANSFER: 0,
        };
        sales.forEach((sale) => {
            sale.payments.forEach((payment) => {
                paymentBreakdown[payment.method] =
                    (paymentBreakdown[payment.method] || 0) + payment.amount;
            });
        });
        return {
            date: (0, date_fns_1.format)(targetDate, 'yyyy-MM-dd'),
            totalSales,
            totalRevenue,
            totalProfit,
            paymentBreakdown,
        };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = SalesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sessions_service_1.SessionsService,
        receipt_resolution_service_1.ReceiptResolutionService])
], SalesService);
//# sourceMappingURL=sales.service.js.map