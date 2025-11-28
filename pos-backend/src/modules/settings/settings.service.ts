import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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

  /**
   * Adjust cashback capital (add or subtract)
   */
  async adjustCashbackCapital(
    branchId: string,
    amount: number,
    notes?: string,
  ) {
    const branch = await this.getBranch(branchId);

    const newCapital = branch.cashbackCapital + amount;

    if (newCapital < 0) {
      throw new BadRequestException(
        `Insufficient capital. Current: ${branch.cashbackCapital}, Adjustment: ${amount}`,
      );
    }

    const updated = await this.prisma.branch.update({
      where: { id: branchId },
      data: {
        cashbackCapital: newCapital,
      },
    });

    this.logger.log(
      `Cashback capital adjusted for branch ${branchId}: ${amount > 0 ? '+' : ''}${amount} (New balance: ${newCapital})`,
    );

    return {
      previousCapital: branch.cashbackCapital,
      adjustment: amount,
      newCapital: updated.cashbackCapital,
      notes,
    };
  }
}
