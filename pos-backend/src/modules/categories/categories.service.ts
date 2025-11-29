import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Category, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
} from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get categories for a subdivision (optional filter)
   */
  async findAll(subdivisionId?: string) {
    const where = subdivisionId ? { subdivisionId } : {};

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        subdivision: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ subdivisionId: 'asc' }, { displayOrder: 'asc' }],
    });

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }));
  }

  /**
   * Get single category with product count
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subdivision: {
          select: {
            id: true,
            name: true,
            displayName: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      ...category,
      productCount: category._count.products,
    };
  }

  /**
   * Create category in user's accessible subdivision
   */
  async create(
    data: CreateCategoryDto,
    user: AuthenticatedRequestUser,
  ): Promise<Category> {
    // Verify subdivision exists
    const subdivision = await this.prisma.subdivision.findUnique({
      where: { id: data.subdivisionId },
    });

    if (!subdivision) {
      throw new NotFoundException('Subdivision not found');
    }

    // CASHIER can only create categories in their assigned subdivision
    if (user.role === UserRole.CASHIER) {
      if (!user.assignedSubdivisionId) {
        throw new ForbiddenException('You do not have an assigned subdivision');
      }

      if (subdivision.id !== user.assignedSubdivisionId) {
        throw new ForbiddenException(
          'You can only create categories in your assigned subdivision',
        );
      }
    }

    // Check if category with this name already exists in the subdivision
    const existing = await this.prisma.category.findUnique({
      where: {
        name_subdivisionId: {
          name: data.name,
          subdivisionId: data.subdivisionId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Category with this name already exists in this subdivision',
      );
    }

    // Auto-generate displayOrder if not provided
    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await this.prisma.category.findFirst({
        where: { subdivisionId: data.subdivisionId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true },
      });
      displayOrder = (maxOrder?.displayOrder ?? -1) + 1;
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        subdivisionId: data.subdivisionId,
        description: data.description,
        displayOrder,
        isActive: true,
      },
      include: {
        subdivision: true,
      },
    });

    this.logger.log(
      `Category created: ${category.name} in ${subdivision.displayName}`,
    );

    return category;
  }

  /**
   * Update category (verify access)
   */
  async update(
    id: string,
    data: UpdateCategoryDto,
    user: AuthenticatedRequestUser,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Verify access
    await this.validateAccess(id, user);

    // Check if name is being changed and if it already exists
    if (data.name && data.name !== category.name) {
      const existing = await this.prisma.category.findUnique({
        where: {
          name_subdivisionId: {
            name: data.name,
            subdivisionId: category.subdivisionId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Category with this name already exists in this subdivision',
        );
      }
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
      include: {
        subdivision: true,
      },
    });

    this.logger.log(`Category updated: ${updated.name}`);

    return updated;
  }

  /**
   * Soft delete category (prevent if has active products)
   */
  async remove(id: string, user: AuthenticatedRequestUser) {
    await this.findOne(id);

    // Verify access
    await this.validateAccess(id, user);

    // Check if category has active products
    const productCount = await this.prisma.product.count({
      where: {
        categoryId: id,
        isActive: true,
      },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. There are ${productCount} active products in this category.`,
      );
    }

    const deleted = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
      include: {
        subdivision: true,
      },
    });

    this.logger.log(`Category deactivated: ${deleted.name}`);

    return deleted;
  }

  /**
   * Get categories by subdivision (optimized for dropdown)
   */
  async getBySubdivision(subdivisionId: string) {
    const categories = await this.prisma.category.findMany({
      where: {
        subdivisionId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        displayOrder: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    return categories;
  }

  /**
   * Batch update displayOrder
   */
  async reorder(data: ReorderCategoriesDto) {
    const { categoryIds } = data;

    // Verify all categories exist
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    // Update display order in a transaction
    await this.prisma.$transaction(
      categoryIds.map((categoryId, index) =>
        this.prisma.category.update({
          where: { id: categoryId },
          data: { displayOrder: index },
        }),
      ),
    );

    this.logger.log(`Categories reordered: ${categoryIds.length} categories`);

    return { success: true, message: 'Categories reordered successfully' };
  }

  /**
   * Validate user can access category
   */
  async validateAccess(
    categoryId: string,
    user: AuthenticatedRequestUser,
  ): Promise<void> {
    // ADMIN has full access
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // CASHIER can only access categories in their assigned subdivision
    if (user.role === UserRole.CASHIER) {
      if (!user.assignedSubdivisionId) {
        throw new ForbiddenException('You do not have an assigned subdivision');
      }

      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          subdivision: true,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.subdivision.id !== user.assignedSubdivisionId) {
        throw new ForbiddenException(
          'You can only access categories in your assigned subdivision',
        );
      }
    }
  }
}
