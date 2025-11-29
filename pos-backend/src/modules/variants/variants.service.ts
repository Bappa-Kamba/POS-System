import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InventoryChangeType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new variant for a product
   */
  async create(productId: string, data: CreateVariantDto) {
    // Verify product exists and has variants enabled
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.hasVariants) {
      throw new BadRequestException(
        'Cannot add variants to a product that does not support variants',
      );
    }

    // Validate variant SKU starts with product SKU
    if (!data.sku.startsWith(`${product.sku}-`)) {
      throw new BadRequestException(
        `Variant SKU must start with "${product.sku}-"`,
      );
    }

    // Check for duplicate SKU
    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    // Check for duplicate barcode if provided
    if (data.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    // Validate selling price >= cost price
    if (data.sellingPrice < data.costPrice) {
      throw new BadRequestException(
        'Selling price cannot be less than cost price',
      );
    }

    // Create variant
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

  /**
   * Get all variants for a product
   */
  async findAllByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { name: 'asc' },
    });

    return variants;
  }

  /**
   * Get single variant by ID
   */
  async findOne(id: string) {
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
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  /**
   * Update variant
   */
  async update(id: string, data: UpdateVariantDto) {
    const variant = await this.findOne(id);

    // Check for duplicate SKU if changing
    if (data.sku && data.sku !== variant.sku) {
      // Validate variant SKU starts with product SKU
      const product = await this.prisma.product.findUnique({
        where: { id: variant.productId },
        select: { sku: true },
      });

      if (product && !data.sku.startsWith(`${product.sku}-`)) {
        throw new BadRequestException(
          `Variant SKU must start with "${product.sku}-"`,
        );
      }

      const existingSku = await this.prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });

      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Check for duplicate barcode if changing
    if (data.barcode && data.barcode !== variant.barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Barcode already exists');
      }
    }

    // Validate selling price >= cost price
    const costPrice = data.costPrice ?? variant.costPrice;
    const sellingPrice = data.sellingPrice ?? variant.sellingPrice;

    if (sellingPrice < costPrice) {
      throw new BadRequestException(
        'Selling price cannot be less than cost price',
      );
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

  /**
   * Delete variant (soft delete)
   */
  async remove(id: string) {
    const variant = await this.findOne(id);

    if (!variant.isActive) {
      throw new BadRequestException('Variant not found');
    }

    const deleted = await this.prisma.productVariant.update({
      where: { id },
      data: { isActive: false },
    });

    return deleted;
  }

  /**
   * Check stock availability for variant
   */
  async checkStock(id: string, quantity: number) {
    const variant = await this.findOne(id);
    return variant.quantityInStock >= quantity;
  }

  /**
   * Adjust variant stock
   */
  async adjustStock(params: {
    id: string;
    quantityChange: number;
    changeType: string;
    reason?: string;
    notes?: string;
    userId: string;
  }) {
    const { id, quantityChange, changeType, reason, notes } = params;

    const variant = await this.findOne(id);
    const newQuantity = variant.quantityInStock + quantityChange;

    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    // Update variant stock
    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: { quantityInStock: newQuantity },
    });

    // Create inventory log
    await this.prisma.inventoryLog.create({
      data: {
        productId: variant.productId,
        variantId: id,
        changeType: changeType as InventoryChangeType,
        quantityChange,
        previousQuantity: variant.quantityInStock,
        newQuantity,
        reason,
        notes,
      },
    });

    return updated;
  }

  /**
   * Get low stock variants
   */
  async getLowStock(branchId?: string) {
    const where: any = {
      isActive: true,
    };

    if (branchId) {
      (where as { product: { branchId: string; isActive: boolean } }).product =
        {
          branchId,
          isActive: true,
        };
    }

    // Use a strongly typed 'where' and avoid 'any'
    const whereClause: Prisma.ProductVariantWhereInput = {
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

    // Filter in memory for low stock (SQLite limitation)
    const lowStockVariants = variants.filter(
      (v) =>
        v.quantityInStock != null &&
        v.lowStockThreshold != null &&
        v.quantityInStock <= v.lowStockThreshold,
    );

    return lowStockVariants;
  }

  /**
   * Get expiring variants (within specified days)
   */
  async getExpiring(days: number = 30, branchId?: string) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Use a strongly typed where clause, avoid `any`
    const whereClause: Prisma.ProductVariantWhereInput = {
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
}
