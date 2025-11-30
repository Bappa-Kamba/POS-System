import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { Prisma, AuditAction, UserRole } from '@prisma/client';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build where clause based on user role and assigned subdivision
   * ADMIN: returns empty object (no filtering)
   * CASHIER: filters by branchId and assignedSubdivisionId
   */
  private buildAccessibleProductsWhere(
    user: AuthenticatedRequestUser,
  ): Prisma.ProductWhereInput {
    if (user.role === UserRole.ADMIN) {
      return {};
    }

    if (user.role === UserRole.CASHIER) {
      if (!user.assignedSubdivisionId) {
        throw new ForbiddenException(
          'You have not been assigned to a product subdivision',
        );
      }

      return {
        branchId: user.branchId,
        category: {
          subdivisionId: user.assignedSubdivisionId,
        },
      };
    }

    throw new ForbiddenException('Invalid user role');
  }

  /**
   * Verify user can access a specific product
   */
  private async verifyProductAccess(
    productId: string,
    user: AuthenticatedRequestUser,
  ): Promise<void> {
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
      throw new NotFoundException('Product not found');
    }

    // ADMIN can access all products
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // CASHIER can only access products from their branch and subdivision
    if (user.role === UserRole.CASHIER) {
      if (
        product.branchId !== user.branchId ||
        product.category?.subdivisionId !== user.assignedSubdivisionId
      ) {
        this.logger.warn(
          `Unauthorized product access attempt by user ${user.id} on product ${productId}`,
        );
        throw new ForbiddenException('You do not have access to this product');
      }
      return;
    }

    throw new ForbiddenException('Invalid user role');
  }

  /**
   * Create a new product
   */
  async create(
    data: CreateProductDto,
    userId: string,
    user: AuthenticatedRequestUser,
  ) {
    // CASHIER can only create products for their own branch
    if (user.role === UserRole.CASHIER && data.branchId !== user.branchId) {
      throw new ForbiddenException(
        'You can only create products for your assigned branch',
      );
    }

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

    // Create product (subdivision inherited from category)
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
   * Automatically filters by user's accessible subdivisions
   */
  async findAll(params: FindAllProductsDto, user?: AuthenticatedRequestUser) {
    const {
      skip = 0,
      take = 20,
      search,
      categoryId,
      isActive,
      hasVariants,
      lowStock,
      branchId,
    } = params;
    this.logger.log(JSON.stringify(params, null, 2));

    this.logger.log(
      `Products findAll - isActive: ${isActive} (type: ${typeof isActive})`,
    );

    // Build access control filter
    const accessFilter = user ? this.buildAccessibleProductsWhere(user) : {};

    const where: Prisma.ProductWhereInput = {
      ...accessFilter,
      ...(branchId && { branchId }),
      // If isActive is 'ALL', it means "all" was explicitly requested (via 'all' string)
      // So we don't filter by isActive (return all products)
      // Otherwise, filter by the boolean value (true for active, false for inactive)
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
            branchId: true;
            category: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    }>;
    let variantResults: VariantWithProduct[] = [];
    if (search) {
      this.logger.log(
        `Searching variants with query: ${search}, branchId: ${branchId}`,
      );

      // Build product filter for variants based on user access
      const productFilter: Prisma.ProductWhereInput = {
        ...(branchId && { branchId }),
        isActive: true,
      };

      // Apply subdivision filter for cashiers
      if (user && user.role === UserRole.CASHIER) {
        if (!user.assignedSubdivisionId) {
          throw new ForbiddenException(
            'You have not been assigned to a product subdivision',
          );
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
        take: 50, // Limit variant results
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      variantResults = variants as any; // Type cast since we removed tax fields
      this.logger.log(
        `Found ${variantResults.length} variants matching search`,
      );
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
        category: {
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
      this.logger.log(
        `Including ${variantResults.length} variants in response`,
      );
    }

    this.logger.log(
      `Returning response with ${responseData.data.length} products and ${responseData.variants?.length || 0} variants`,
    );
    return responseData;
  }

  /**
   * Get single product by ID
   */
  async findOne(id: string, user?: AuthenticatedRequestUser) {
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
      throw new NotFoundException('Product not found');
    }

    // Verify user has access to this product
    if (user) {
      await this.verifyProductAccess(id, user);
    }

    return product;
  }

  /**
   * Update product
   */
  async update(
    id: string,
    data: UpdateProductDto,
    userId: string,
    user?: AuthenticatedRequestUser,
  ) {
    // Check if product exists and user has access
    const product = await this.findOne(id, user);

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
  async remove(id: string, userId: string, user?: AuthenticatedRequestUser) {
    // Check if product exists and user has access
    const product = await this.findOne(id, user);

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
      this.logger.error(
        `Failed to create audit log: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }
}
