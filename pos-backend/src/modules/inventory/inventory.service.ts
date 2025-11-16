import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustStockDto, FindAllLogsDto } from './dto';
import { Prisma, AuditAction } from '@prisma/client';
import { startOfDay, addDays } from 'date-fns';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Adjust stock for a product or variant
   */
  async adjustStock(data: AdjustStockDto, userId: string, branchId: string) {
    let product;
    let variant;
    let previousQuantity: number;
    let newQuantity: number;

    if (data.variantId) {
      // Adjust variant stock
      variant = await this.prisma.productVariant.findUnique({
        where: { id: data.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (variant.product.branchId !== branchId) {
        throw new BadRequestException('Variant does not belong to your branch');
      }

      previousQuantity = variant.quantityInStock;
      newQuantity = previousQuantity + data.quantityChange;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current stock: ${previousQuantity}, Attempted change: ${data.quantityChange}`,
        );
      }

      // Update variant stock
      await this.prisma.productVariant.update({
        where: { id: data.variantId },
        data: { quantityInStock: newQuantity },
      });

      product = variant.product;
    } else {
      // Adjust product stock
      product = await this.prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.branchId !== branchId) {
        throw new BadRequestException('Product does not belong to your branch');
      }

      if (product.hasVariants) {
        throw new BadRequestException(
          'Product has variants. Please specify a variantId',
        );
      }

      if (product.quantityInStock === null) {
        throw new BadRequestException('Product does not track inventory');
      }

      previousQuantity = product.quantityInStock;
      newQuantity = previousQuantity + data.quantityChange;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current stock: ${previousQuantity}, Attempted change: ${data.quantityChange}`,
        );
      }

      // Update product stock
      await this.prisma.product.update({
        where: { id: data.productId },
        data: { quantityInStock: newQuantity },
      });
    }

    // Create inventory log
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

    this.logger.log(
      `Stock adjusted: ${product.name}${variant ? ` (${variant.name})` : ''} - ${data.quantityChange > 0 ? '+' : ''}${data.quantityChange} (${previousQuantity} → ${newQuantity})`,
    );

    // Log audit trail for inventory adjustment
    await this.logAudit({
      userId,
      action: AuditAction.UPDATE,
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

  /**
   * Get inventory logs
   */
  async getInventoryLogs(params: FindAllLogsDto, branchId: string) {
    const {
      page = '1',
      limit = '50',
      productId,
      variantId,
      changeType,
      startDate,
      endDate,
    } = params;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where: Prisma.InventoryLogWhereInput = {
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

  /**
   * Get expiring products/variants (within specified days)
   */
  async getExpiringItems(branchId: string, days: number = 30) {
    const expiryDate = addDays(new Date(), days);
    const today = startOfDay(new Date());

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
            category: true,
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
      category: v.product.category,
      currentStock: v.quantityInStock,
      expiryDate: v.expiryDate,
      daysUntilExpiry: v.expiryDate
        ? Math.ceil(
            (v.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          )
        : null,
    }));
  }

  /**
   * Get all products with inventory (for inventory page)
   */
  async getAllInventory(branchId: string) {
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
        category: true,
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
            category: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      products: products.map((p) => ({
        ...p,
        isVariant: false,
      })),
      variants: variants.map((v) => ({
        id: v.id,
        name: `${v.product.name} (${v.name})`,
        sku: v.sku,
        productId: v.productId,
        productName: v.product.name,
        category: v.product.category,
        quantityInStock: v.quantityInStock,
        lowStockThreshold: v.lowStockThreshold,
        unitType: 'PIECE' as const,
        isVariant: true,
      })),
    };
  }

  /**
   * Helper method to log audit trail
   */
  private async logAudit(data: {
    userId: string;
    action: AuditAction;
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
      this.logger.error(`Failed to create audit log: ${error}`);
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }
}
