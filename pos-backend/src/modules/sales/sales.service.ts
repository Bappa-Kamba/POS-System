import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto, FindAllSalesDto } from './dto';
import { PaymentStatus, InventoryChangeType, Prisma } from '@prisma/client';
import { format, startOfDay, endOfDay } from 'date-fns';

import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Generate unique receipt number
   * Format: RCP-YYYYMMDD-XXXX
   */
  async generateReceiptNumber(date: Date = new Date()): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');

    // Get count of receipts today
    const start = startOfDay(date);
    const end = endOfDay(date);

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

  /**
   * Create a new sale with transaction
   */
  async create(data: CreateSaleDto, cashierId: string, branchId: string) {
    const transactionType = data.transactionType || 'PURCHASE';

    // Get active session for this user
    const activeSession = await this.sessionsService.getActiveSession(
      branchId,
      cashierId,
    );
    // Optional: Enforce active session
    // if (!activeSession) {
    //   throw new BadRequestException('No active session found. Please start a session first.');
    // }

    // Validate based on transaction type
    if (transactionType === 'PURCHASE') {
      if (!data.items || data.items.length === 0) {
        throw new BadRequestException('Purchase must have at least one item');
      }
    } else if (transactionType === 'CASHBACK') {
      if (!data.cashbackAmount || data.cashbackAmount <= 0) {
        throw new BadRequestException(
          'Cashback amount is required and must be greater than 0',
        );
      }
      // Cashback doesn't need items
    }

    if (!data.payments || data.payments.length === 0) {
      throw new BadRequestException('Sale must have at least one payment');
    }

    // Calculate totals and validate stock
    interface SaleItemData {
      productId: string;
      variantId?: string;
      itemName: string;
      itemSku: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      taxRate: number;
      taxAmount: number;
      subtotal: number;
      total: number;
      availableStock: number;
      product: any;
      variant?: any;
    }

    const saleItems: SaleItemData[] = [];
    let subtotal = 0;
    let taxAmount = 0;

    // Handle cashback transaction (no products)
    if (transactionType === 'CASHBACK') {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
        select: { cashbackCapital: true, cashbackServiceChargeRate: true },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }

      const cashbackAmount = data.cashbackAmount!;
      // Use manual service charge if provided, otherwise default to 0 (or throw error if required)
      const serviceCharge =
        data.serviceCharge !== undefined ? data.serviceCharge : 0;

      if (branch.cashbackCapital < cashbackAmount) {
        throw new BadRequestException(
          `Insufficient cashback capital. Available: ${branch.cashbackCapital}, Required: ${cashbackAmount}`,
        );
      }

      // For cashback: subtotal = amount given, total = amount given (service charge is profit, not part of sale total)
      subtotal = cashbackAmount;
      taxAmount = 0; // No tax on cashback
      const totalAmount = cashbackAmount; // Total is just the amount given

      // Generate receipt number
      const receiptNumber = await this.generateReceiptNumber(new Date());

      // Create sale in transaction
      const sale = await this.prisma.$transaction(async (tx) => {
        // Deduct from cashback capital
        await tx.branch.update({
          where: { id: branchId },
          data: {
            cashbackCapital: {
              decrement: cashbackAmount,
            },
          },
        });

        // Calculate payment totals
        const totalPaid = data.payments.reduce((sum, p) => sum + p.amount, 0);
        const amountDue = totalAmount - totalPaid;
        const changeGiven =
          totalPaid > totalAmount ? totalPaid - totalAmount : 0;
        const paymentStatus =
          amountDue <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

        // Create sale (no items for cashback)
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

    // Validate items and calculate totals (for PURCHASE transactions)
    for (const itemDto of data.items!) {
      let product;
      let variant;
      let availableStock: number;
      let costPrice: number;
      let itemName: string;
      let itemSku: string;

      // Get product or variant
      if (itemDto.variantId) {
        variant = await this.prisma.productVariant.findUnique({
          where: { id: itemDto.variantId },
          include: {
            product: true,
          },
        });

        if (!variant || !variant.isActive) {
          throw new NotFoundException(
            `Variant with ID ${itemDto.variantId} not found`,
          );
        }

        product = variant.product;
        if (!product.isActive) {
          throw new BadRequestException('Product is not active');
        }

        availableStock = variant.quantityInStock;
        costPrice = variant.costPrice;
        itemName = `${product.name} - ${variant.name}`;
        itemSku = variant.sku;
      } else {
        product = await this.prisma.product.findUnique({
          where: { id: itemDto.productId },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(
            `Product with ID ${itemDto.productId} not found`,
          );
        }

        if (product.hasVariants) {
          throw new BadRequestException(
            'Product has variants, please specify variantId',
          );
        }

        availableStock = product.quantityInStock || 0;
        costPrice = product.costPrice || 0;
        itemName = product.name;
        itemSku = product.sku;
      }

      // Validate stock
      if (availableStock < itemDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${itemName}. Available: ${availableStock}, Requested: ${itemDto.quantity}`,
        );
      }

      // Calculate item totals (no tax)
      const itemSubtotal = itemDto.quantity * itemDto.unitPrice;
      const itemTaxAmount = 0; // Tax removed
      const itemTotal = itemSubtotal;

      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount; // Always 0

      saleItems.push({
        productId: product.id,
        variantId: variant?.id,
        itemName,
        itemSku,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        costPrice,
        taxRate: 0, // No tax
        taxAmount: 0, // No tax
        subtotal: itemSubtotal,
        total: itemTotal,
        availableStock,
        product,
        variant,
      });
    }

    const totalAmount = subtotal + taxAmount;

    // Calculate payment totals
    const totalPaid = data.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    if (totalPaid < totalAmount) {
      throw new BadRequestException(
        `Insufficient payment. Total: ${totalAmount}, Paid: ${totalPaid}`,
      );
    }

    const changeGiven = totalPaid > totalAmount ? totalPaid - totalAmount : 0;
    const amountDue = totalAmount - totalPaid;
    const paymentStatus: PaymentStatus =
      totalPaid >= totalAmount
        ? PaymentStatus.PAID
        : totalPaid > 0
          ? PaymentStatus.PARTIAL
          : PaymentStatus.PENDING;

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Create sale with transaction
    const sale = await this.prisma.$transaction(async (tx) => {
      // Create sale
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

      // Handle stock changes only for PURCHASE transactions
      // CASHBACK is a financial service, not a product transaction
      if (transactionType === 'PURCHASE') {
        for (const item of saleItems) {
          if (item.variantId) {
            // Get current stock before update
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              select: { quantityInStock: true },
            });

            const previousQuantity = variant?.quantityInStock || 0;
            const quantityChange = -item.quantity;
            const newQuantity = previousQuantity + quantityChange;

            // Update variant stock
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                quantityInStock: {
                  increment: quantityChange,
                },
              },
            });

            // Create inventory log
            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                changeType: InventoryChangeType.SALE,
                quantityChange,
                previousQuantity,
                newQuantity,
                reason: 'Sale',
                saleId: newSale.id,
              },
            });
          } else {
            // Get current stock before update
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { quantityInStock: true },
            });

            const previousQuantity = product?.quantityInStock || 0;
            const quantityChange = -item.quantity;
            const newQuantity = previousQuantity + quantityChange;

            // Update product stock
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantityInStock: {
                  increment: quantityChange,
                },
              },
            });

            // Create inventory log
            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                changeType: InventoryChangeType.SALE,
                quantityChange,
                previousQuantity,
                newQuantity,
                reason: 'Sale',
                saleId: newSale.id,
              },
            });
          }
        }
      } else if (transactionType === 'CASHBACK') {
        // For cashback, deduct from cashback capital
        const branch = await tx.branch.findUnique({
          where: { id: branchId },
          select: { cashbackCapital: true, cashbackServiceChargeRate: true },
        });

        if (!branch) {
          throw new NotFoundException('Branch not found');
        }

        // Calculate service charge (profit)
        const cashbackAmount = totalAmount; // Amount given to customer (subtotal)

        // Check if enough capital
        if (branch.cashbackCapital < cashbackAmount) {
          throw new BadRequestException(
            `Insufficient cashback capital. Available: ${branch.cashbackCapital}, Required: ${cashbackAmount}`,
          );
        }

        // Deduct from cashback capital
        await tx.branch.update({
          where: { id: branchId },
          data: {
            cashbackCapital: {
              decrement: cashbackAmount,
            },
          },
        });
      }

      // Return sale with relations
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

  /**
   * Get all sales with filtering and pagination
   */
  async findAll(params: FindAllSalesDto) {
    const {
      skip = 0,
      take = 20,
      startDate,
      endDate,
      cashierId,
      branchId,
      paymentStatus,
      transactionType,
      search,
    } = params;

    const where: Prisma.SaleWhereInput = {
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

  /**
   * Get single sale by ID
   */
  async findOne(id: string) {
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
            businessName: true,
            businessAddress: true,
            businessPhone: true,
            receiptFooter: true,
            taxRate: true,
            currency: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  /**
   * Get receipt data for printing
   */
  async getReceiptData(id: string) {
    const sale = await this.findOne(id);

    // Cashback transactions don't generate receipts
    if (sale.transactionType === 'CASHBACK') {
      throw new BadRequestException(
        'Cashback transactions do not generate receipts',
      );
    }

    const cashierName = sale.cashier.firstName
      ? `${sale.cashier.firstName} ${sale.cashier.lastName || ''}`.trim()
      : sale.cashier.username;

    return {
      receipt: {
        business: {
          name: sale.branch.businessName || sale.branch.name,
          address: sale.branch.businessAddress || '',
          phone: sale.branch.businessPhone || '',
        },
        branch: sale.branch.name,
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
        footer: sale.branch.receiptFooter || 'Thank you for your purchase!',
        currency: sale.branch.currency || 'NGN',
      },
    };
  }

  /**
   * Get daily summary for cashier
   */
  async getDailySummary(cashierId: string, branchId: string, date?: Date) {
    const targetDate = date || new Date();
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const sales = await this.prisma.sale.findMany({
      where: {
        cashierId,
        branchId,
        createdAt: {
          gte: start,
          lte: end,
        },
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Calculate profit
    const totalProfit = sales.reduce((sum, sale) => {
      const saleProfit = sale.items.reduce(
        (itemSum, item) =>
          itemSum + (item.unitPrice - item.costPrice) * item.quantity,
        0,
      );
      return sum + saleProfit;
    }, 0);

    // Payment breakdown
    const paymentBreakdown: Record<string, number> = {
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
      date: format(targetDate, 'yyyy-MM-dd'),
      totalSales,
      totalRevenue,
      totalProfit,
      paymentBreakdown,
    };
  }
}
