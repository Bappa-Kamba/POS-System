import { PrismaService } from '../../prisma/prisma.service';
import { ResolvedReceiptConfig } from './dto/receipt-config.dto';
export declare class ReceiptResolutionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveReceiptConfig(subdivisionId?: string | null, branchId?: string): Promise<ResolvedReceiptConfig>;
}
