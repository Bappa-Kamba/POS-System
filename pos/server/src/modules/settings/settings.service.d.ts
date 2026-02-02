import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBranchDto } from './dto';
export declare class SettingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getBranch(branchId: string): Promise<{
        id: string;
        name: string;
        receiptFooter: string | null;
        receiptLogoAssetId: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        taxRate: number;
        currency: string;
        cashbackCapital: number;
        cashbackServiceChargeRate: number;
        cashbackSubdivisionId: string | null;
    }>;
    updateBranch(branchId: string, data: UpdateBranchDto): Promise<{
        id: string;
        name: string;
        receiptFooter: string | null;
        receiptLogoAssetId: string | null;
        createdAt: Date;
        updatedAt: Date;
        location: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        taxRate: number;
        currency: string;
        cashbackCapital: number;
        cashbackServiceChargeRate: number;
        cashbackSubdivisionId: string | null;
    }>;
    adjustCashbackCapital(branchId: string, amount: number, notes?: string): Promise<{
        previousCapital: number;
        adjustment: number;
        newCapital: number;
        notes: string | undefined;
    }>;
}
