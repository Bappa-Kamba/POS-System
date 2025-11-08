import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(data: CreateProductDto) {
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

    const where: Prisma.ProductWhereInput = {
      ...(branchId && { branchId }),
      ...(isActive !== undefined && { isActive }),
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

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          branch: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Filter low stock items in memory (since SQLite doesn't support column comparison in where)
    let filteredProducts = products;
    if (lowStock) {
      filteredProducts = products.filter(
        (p) =>
          p.quantityInStock != null &&
          p.lowStockThreshold != null &&
          p.quantityInStock <= p.lowStockThreshold,
      );
    }

    return {
      data: filteredProducts,
      meta: {
        total: lowStock ? filteredProducts.length : total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(
          (lowStock ? filteredProducts.length : total) / take,
        ),
      },
    };
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
  async update(id: string, data: UpdateProductDto) {
    // Check if product exists
    const product = await this.findOne(id);

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

    return updated;
  }

  /**
   * Soft delete product
   */
  async remove(id: string) {
    // Check if product exists
    await this.findOne(id);

    const deleted = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: {
        branch: {
          select: { id: true, name: true },
        },
      },
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
   */
  generateBarcode(): string {
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

    return code + checkDigit;
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
}
