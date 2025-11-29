import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Subdivision, SubdivisionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSubdivisionDto,
  UpdateSubdivisionDto,
  AssignSubdivisionDto,
} from './dto';

@Injectable()
export class SubdivisionsService {
  private readonly logger = new Logger(SubdivisionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all subdivisions with status and description
   */
  async findAll(): Promise<Subdivision[]> {
    return this.prisma.subdivision.findMany({
      include: {
        _count: {
          select: {
            categories: true,
            branchSubdivisions: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get single subdivision by ID
   */
  async findOne(id: string): Promise<Subdivision> {
    const subdivision = await this.prisma.subdivision.findUnique({
      where: { id },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        branchSubdivisions: {
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            categories: true,
          },
        },
      },
    });

    if (!subdivision) {
      throw new NotFoundException('Subdivision not found');
    }

    return subdivision;
  }

  /**
   * Get subdivisions available in a branch
   */
  async findByBranch(branchId: string) {
    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const branchSubdivisions = await this.prisma.branchSubdivision.findMany({
      where: {
        branchId,
        isActive: true,
      },
      include: {
        subdivision: {
          include: {
            categories: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
            _count: {
              select: {
                categories: true,
              },
            },
          },
        },
      },
    });

    return branchSubdivisions.map((bs) => bs.subdivision);
  }

  /**
   * Create new subdivision (ADMIN only)
   */
  async create(data: CreateSubdivisionDto): Promise<Subdivision> {
    // Check if subdivision with this name already exists
    const existing = await this.prisma.subdivision.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Subdivision with this name already exists');
    }

    const subdivision = await this.prisma.subdivision.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        color: data.color,
        icon: data.icon,
        status: SubdivisionStatus.ACTIVE,
      },
    });

    this.logger.log(`Subdivision created: ${subdivision.name}`);

    return subdivision;
  }

  /**
   * Update subdivision details
   */
  async update(id: string, data: UpdateSubdivisionDto): Promise<Subdivision> {
    const subdivision = await this.findOne(id);

    // Check if name is being changed and if it already exists
    if (data.name && data.name !== subdivision.name) {
      const existing = await this.prisma.subdivision.findUnique({
        where: { name: data.name },
      });

      if (existing) {
        throw new ConflictException(
          'Subdivision with this name already exists',
        );
      }
    }

    const updated = await this.prisma.subdivision.update({
      where: { id },
      data: {
        displayName: data.displayName,
        description: data.description,
        color: data.color,
        icon: data.icon,
        status: data.status,
      },
    });

    this.logger.log(`Subdivision updated: ${updated.name}`);

    return updated;
  }

  /**
   * Toggle subdivision status
   */
  async toggleStatus(id: string): Promise<Subdivision> {
    const subdivision = await this.findOne(id);

    const newStatus =
      subdivision.status === SubdivisionStatus.ACTIVE
        ? SubdivisionStatus.INACTIVE
        : SubdivisionStatus.ACTIVE;

    const updated = await this.prisma.subdivision.update({
      where: { id },
      data: { status: newStatus },
    });

    this.logger.log(
      `Subdivision status toggled: ${updated.name} -> ${newStatus}`,
    );

    return updated;
  }

  /**
   * Assign subdivision to branch
   */
  async assignToBranch(data: AssignSubdivisionDto) {
    const { branchId, subdivisionId } = data;

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Verify subdivision exists
    const subdivision = await this.prisma.subdivision.findUnique({
      where: { id: subdivisionId },
    });

    if (!subdivision) {
      throw new NotFoundException('Subdivision not found');
    }

    // Check if already assigned
    const existing = await this.prisma.branchSubdivision.findUnique({
      where: {
        branchId_subdivisionId: {
          branchId,
          subdivisionId,
        },
      },
    });

    if (existing) {
      // If exists but inactive, reactivate it
      if (!existing.isActive) {
        const updated = await this.prisma.branchSubdivision.update({
          where: { id: existing.id },
          data: { isActive: true },
        });

        this.logger.log(
          `Subdivision reactivated for branch: ${subdivision.name} -> ${branch.name}`,
        );

        return updated;
      }

      throw new ConflictException(
        'Subdivision already assigned to this branch',
      );
    }

    const branchSubdivision = await this.prisma.branchSubdivision.create({
      data: {
        branchId,
        subdivisionId,
        isActive: true,
      },
      include: {
        branch: true,
        subdivision: true,
      },
    });

    this.logger.log(
      `Subdivision assigned to branch: ${subdivision.name} -> ${branch.name}`,
    );

    return branchSubdivision;
  }

  /**
   * Remove subdivision from branch
   */
  async removeFromBranch(branchId: string, subdivisionId: string) {
    const branchSubdivision = await this.prisma.branchSubdivision.findUnique({
      where: {
        branchId_subdivisionId: {
          branchId,
          subdivisionId,
        },
      },
    });

    if (!branchSubdivision) {
      throw new NotFoundException('Subdivision not assigned to this branch');
    }

    // Check if there are active products in this subdivision for this branch
    const productsCount = await this.prisma.product.count({
      where: {
        branchId,
        categoryId: {
          not: null,
        },
        category: {
          subdivisionId,
        },
        isActive: true,
      },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        `Cannot remove subdivision. There are ${productsCount} active products in this subdivision.`,
      );
    }

    // Soft delete by setting isActive to false
    const updated = await this.prisma.branchSubdivision.update({
      where: { id: branchSubdivision.id },
      data: { isActive: false },
    });

    this.logger.log(
      `Subdivision removed from branch: ${subdivisionId} -> ${branchId}`,
    );

    return updated;
  }

  /**
   * Get all subdivisions in a branch with their categories
   */
  async getBranchSubdivisions(branchId: string) {
    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const branchSubdivisions = await this.prisma.branchSubdivision.findMany({
      where: {
        branchId,
        isActive: true,
      },
      include: {
        subdivision: {
          include: {
            categories: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
              include: {
                _count: {
                  select: {
                    products: {
                      where: {
                        branchId,
                        isActive: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        subdivision: {
          createdAt: 'asc',
        },
      },
    });

    return branchSubdivisions.map((bs) => ({
      ...bs.subdivision,
      branchSubdivisionId: bs.id,
      assignedAt: bs.createdAt,
    }));
  }
}
