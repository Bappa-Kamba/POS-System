import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { Prisma, AuditAction } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(data: CreateProductDto, userId: string) {
    // Check if SKU already exists
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Check if barcode already exists (if provided)
    if (data.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Validate that products without variants have pricing
    if (!data.hasVariants) {
      if (data.costPrice == null || data.sellingPrice == null) {
        throw new BadRequestException(
          'Products without variants must have cost and selling prices',
        );
      }
      if (data.sellingPrice < data.costPrice) {
        throw new BadRequestException(
          'Selling price cannot be less than cost price',
        );
      }
    }

    // Create product
    const product = await this.prisma.product.create({
      data: {
        ...data,
        isActive: true,
      },
      include: {
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: AuditAction.CREATE,
      entity: 'Product',
      entityId: product.id,
      newValues: JSON.stringify(product),
    });

    return product;
  }

  /**
   * Get all products with filtering and pagination
   */
  async findAll(params: FindAllProductsDto) {
    const {
      skip = 0,
      take = 20,
      search,
      category,
      isActive,
      hasVariants,
      lowStock,
      branchId,
    } = params;
    this.logger.log(JSON.stringify(params, null, 2));

    this.logger.log(
      `Products findAll - isActive: ${isActive} (type: ${typeof isActive})`,
    );

    const where: Prisma.ProductWhereInput = {
      ...(branchId && { branchId }),
      // If isActive is 'ALL', it means "all" was explicitly requested (via 'all' string)
      // So we don't filter by isActive (return all products)
      // Otherwise, filter by the boolean value (true for active, false for inactive)
      ...(isActive !== undefined &&
        isActive !== 'ALL' &&
        typeof isActive === 'boolean' && { isActive }),
      ...(category && { category }),
      ...(hasVariants !== undefined && { hasVariants }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { barcode: { contains: search } },
        ],
      }),
    };

    // Add low stock filter
    if (lowStock) {
      where.AND = [
        {
          hasVariants: false,
          quantityInStock: { not: null },
          lowStockThreshold: { not: null },
        },
      ];
    }

    // Also search variants by SKU if search query is provided
    type VariantWithProduct = Prisma.ProductVariantGetPayload<{
      include: {
        product: {
          select: {
            id: true;
            name: true;
            category: true;
            taxable: true;
            taxRate: true;
            branchId: true;
          };
        };
      };
    }>;
    let variantResults: VariantWithProduct[] = [];
    if (search) {
      const variants = await this.prisma.productVariant.findMany({
        where: {
          isActive: true,
          sku: { contains: search },
          product: {
            ...(branchId && { branchId }),
            isActive: true,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              taxable: true,
              taxRate: true,
              branchId: true,
            },
          },
        },
        take: 50, // Limit variant results
      });
      variantResults = variants;
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
          variants: search
            ? undefined
            : {
                where: { isActive: true },
                take: 0, // Don't include variants in normal listing
              },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Filter low stock items in memory (since SQLite doesn't support column comparison in where)
    let filteredProducts = products;
    if (lowStock) {
      filteredProducts = products.filter((p) => {
        this.logger.log(JSON.stringify(p, null, 2));
        return (
          p.quantityInStock != null &&
          p.lowStockThreshold != null &&
          p.quantityInStock <= p.lowStockThreshold
        );
      });
    }

    // Attach variant results to response if search was performed
    type ProductWithRelations = Prisma.ProductGetPayload<{
      include: {
        branch: {
          select: { id: true; name: true };
        };
        variants?: {
          where: { isActive: true };
          take: number;
        };
      };
    }>;

    type ResponseData = {
      data: ProductWithRelations[];
      meta: {
        total: number;
        page: number;
        lastPage: number;
      };
      variants?: VariantWithProduct[];
    };

    const responseData: ResponseData = {
      data: filteredProducts,
      meta: {
        total: lowStock ? filteredProducts.length : total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(
          (lowStock ? filteredProducts.length : total) / take,
        ),
      },
    };

    // Include variants in response if search was performed
    if (search && variantResults.length > 0) {
      responseData.variants = variantResults;
    }

    return responseData;
  }

  /**
   * Get single product by ID
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        branch: true,
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductDto, userId: string) {
    // Check if product exists
    const product = await this.findOne(id);

    // Store old values for audit
    const oldValues = JSON.stringify(product);

    // Check SKU uniqueness if being updated
    if (data.sku && data.sku !== product.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Check barcode uniqueness if being updated
    if (data.barcode && data.barcode !== product.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Validate pricing for non-variant products
    if (
      data.hasVariants === false ||
      (!data.hasVariants && !product.hasVariants)
    ) {
      const costPrice = data.costPrice ?? product.costPrice;
      const sellingPrice = data.sellingPrice ?? product.sellingPrice;

      if (
        costPrice != null &&
        sellingPrice != null &&
        sellingPrice < costPrice
      ) {
        throw new BadRequestException(
          'Selling price cannot be less than cost price',
        );
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    // Log audit trail
    await this.logAudit({
      userId,
      action: AuditAction.UPDATE,
      entity: 'Product',
      entityId: id,
      oldValues,
      newValues: JSON.stringify(updated),
    });

    return updated;
  }

  /**
   * Soft delete product
   */
  async remove(id: string, userId: string) {
    // Check if product exists
    const product = await this.findOne(id);

    // Store old values for audit
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

    // Log audit trail
    await this.logAudit({
      userId,
      action: AuditAction.DELETE,
      entity: 'Product',
      entityId: id,
      oldValues,
      newValues: JSON.stringify(deleted),
    });

    return deleted;
  }

  /**
   * Check stock availability
   */
  async checkStock(productId: string, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.hasVariants) {
      throw new BadRequestException(
        'Product has variants, please specify variantId',
      );
    }

    if (product.quantityInStock == null) {
      throw new BadRequestException('Product does not track inventory');
    }

    return product.quantityInStock >= quantity;
  }

  /**
   * Generate unique barcode (EAN-13 format)
   * Ensures uniqueness by checking against existing products and variants
   */
  async generateBarcode(): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const prefix = '200'; // Internal use prefix
      const random = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0');
      const code = prefix + random;

      // Calculate EAN-13 check digit
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(code[i]);
        sum += i % 2 === 0 ? digit : digit * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;

      const barcode = code + checkDigit;

      // Check if barcode already exists in products
      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode },
      });

      if (existingProduct) {
        attempts++;
        continue;
      }

      // Check if barcode already exists in variants
      const existingVariant = await this.prisma.productVariant.findUnique({
        where: { barcode },
      });

      if (existingVariant) {
        attempts++;
        continue;
      }

      // Barcode is unique
      return barcode;
    }

    // If we couldn't generate a unique barcode after max attempts, throw error
    throw new Error(
      'Failed to generate unique barcode after multiple attempts. Please try again.',
    );
  }

  /**
   * Find product or variant by barcode
   */
  async findByBarcode(barcode: string) {
    // First check products
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
      return { type: 'product' as const, data: product };
    }

    // Check variants
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
      return { type: 'variant' as const, data: variant };
    }

    return null;
  }

  /**
   * Search products (for POS interface)
   */
  async search(query: string, limit: number = 10) {
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
        category: true,
      },
    });

    return products;
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
