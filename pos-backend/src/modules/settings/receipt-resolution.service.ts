import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResolvedReceiptConfig } from './dto/receipt-config.dto';

@Injectable()
export class ReceiptResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve receipt configuration for a specific subdivision
   * Follows inheritance chain: Subdivision Overrides -> Branch Defaults -> Main Branch Defaults
   */
  async resolveReceiptConfig(
    subdivisionId?: string | null,
    branchId?: string,
  ): Promise<ResolvedReceiptConfig> {
    // 1. Fetch Subdivision (if provided)
    let subdivision = null;
    if (subdivisionId) {
      subdivision = await this.prisma.subdivision.findUnique({
        where: { id: subdivisionId },
      });
    }

    // 2. Fetch Branch
    const targetBranchId = branchId;

    if (!targetBranchId) {
      throw new Error('Branch ID is required to resolve receipt configuration');
    }

    const targetBranch = await this.prisma.branch.findUnique({
      where: { id: targetBranchId },
    });

    if (!targetBranch) {
      throw new NotFoundException('Branch not found');
    }

    // 3. Fetch Main Branch (Fallback)
    // We define "Main Branch" as the first created branch, effectively the HQ
    const mainBranch = await this.prisma.branch.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    // 4. Merge Values (Inheritance Logic)
    // Order: Subdivision -> Target Branch -> Main Branch -> Fallback (Empty)
    // We use || instead of ?? to ensure empty strings trigger fallback

    return {
      businessName:
        subdivision?.receiptBusinessName ||
        targetBranch.name || // Fallback to internal name
        '',

      businessAddress:
        subdivision?.receiptAddress ||
        targetBranch.address || // Fallback to generic branch address
        mainBranch?.address ||
        '',

      businessPhone:
        subdivision?.receiptPhone ||
        targetBranch.phone || // Fallback to generic branch phone
        mainBranch?.phone ||
        '',

      receiptFooter:
        subdivision?.receiptFooter ||
        targetBranch.receiptFooter ||
        mainBranch?.receiptFooter ||
        '',

      // These are always branch-level for now
      branchName: targetBranch.name,
      currency: targetBranch.currency,
    };
  }
}
