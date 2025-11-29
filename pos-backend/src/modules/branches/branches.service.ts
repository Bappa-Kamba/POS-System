import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Branch, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto, FindAllBranchesDto } from './dto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new branch
   */
  async create(data: CreateBranchDto): Promise<Branch> {
    // Check if branch name already exists
    const existingBranch = await this.prisma.branch.findFirst({
      where: { name: data.name },
    });

    if (existingBranch) {
      throw new ConflictException('Branch name already exists');
    }

    // Create branch
    const branch = await this.prisma.branch.create({
      data: {
        name: data.name,
        location: data.location,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxRate: data.taxRate ?? 0.075,
        currency: data.currency ?? 'NGN',
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        businessPhone: data.businessPhone,
        receiptFooter: data.receiptFooter,
        cashbackCapital: data.cashbackCapital ?? 0,
        cashbackServiceChargeRate: data.cashbackServiceChargeRate ?? 0.02,
      },
    });

    this.logger.log(`Branch created: ${branch.id} - ${branch.name}`);
    return branch;
  }

  /**
   * Get all branches with filtering and pagination
   */
  async findAll(params: FindAllBranchesDto) {
    const { skip = 0, take = 20, search } = params;

    const where: Prisma.BranchWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { location: { contains: search } },
          { address: { contains: search } },
        ],
      }),
    };

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              sales: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      data: branches,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get single branch by ID
   */
  async findOne(id: string): Promise<Branch> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            sales: true,
            expenses: true,
            sessions: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  /**
   * Update branch
   */
  async update(id: string, data: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    // Check if branch name is being changed and if it already exists
    if (data.name && data.name !== branch.name) {
      const existingBranch = await this.prisma.branch.findFirst({
        where: { name: data.name },
      });

      if (existingBranch) {
        throw new ConflictException('Branch name already exists');
      }
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.taxRate !== undefined && { taxRate: data.taxRate }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.businessName !== undefined && {
          businessName: data.businessName,
        }),
        ...(data.businessAddress !== undefined && {
          businessAddress: data.businessAddress,
        }),
        ...(data.businessPhone !== undefined && {
          businessPhone: data.businessPhone,
        }),
        ...(data.receiptFooter !== undefined && {
          receiptFooter: data.receiptFooter,
        }),
        ...(data.cashbackCapital !== undefined && {
          cashbackCapital: data.cashbackCapital,
        }),
        ...(data.cashbackServiceChargeRate !== undefined && {
          cashbackServiceChargeRate: data.cashbackServiceChargeRate,
        }),
      },
    });

    this.logger.log(`Branch updated: ${updated.id} - ${updated.name}`);
    return updated;
  }

  /**
   * Delete branch
   */
  async remove(id: string): Promise<Branch> {
    const branch = await this.findOne(id);

    // Check if branch has users
    const userCount = await this.prisma.user.count({
      where: { branchId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        'Cannot delete branch with assigned users. Please reassign or remove users first.',
      );
    }

    // Check if branch has products
    const productCount = await this.prisma.product.count({
      where: { branchId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        'Cannot delete branch with products. Please reassign or remove products first.',
      );
    }

    const deleted = await this.prisma.branch.delete({
      where: { id },
    });

    this.logger.log(`Branch deleted: ${deleted.id} - ${deleted.name}`);
    return deleted;
  }

  /**
   * Get branch statistics
   */
  async getStatistics(id: string) {
    const branch = await this.findOne(id);

    const [
      totalUsers,
      activeUsers,
      totalProducts,
      totalSales,
      totalRevenue,
      activeSessions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { branchId: id } }),
      this.prisma.user.count({ where: { branchId: id, isActive: true } }),
      this.prisma.product.count({ where: { branchId: id } }),
      this.prisma.sale.count({ where: { branchId: id } }),
      this.prisma.sale.aggregate({
        where: { branchId: id, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      this.prisma.session.count({
        where: { branchId: id, status: 'OPEN' },
      }),
    ]);

    return {
      branch,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        products: totalProducts,
        sales: {
          total: totalSales,
          revenue: totalRevenue._sum.totalAmount || 0,
        },
        sessions: {
          active: activeSessions,
        },
      },
    };
  }
}
