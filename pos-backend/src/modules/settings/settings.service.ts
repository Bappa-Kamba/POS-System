import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBranchDto } from './dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get branch by ID
   */
  async getBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  /**
   * Update branch settings
   */
  async updateBranch(branchId: string, data: UpdateBranchDto) {
    const branch = await this.getBranch(branchId);

    const updated = await this.prisma.branch.update({
      where: { id: branchId },
      data,
    });

    this.logger.log(`Branch ${branchId} settings updated`);

    return updated;
  }
}

