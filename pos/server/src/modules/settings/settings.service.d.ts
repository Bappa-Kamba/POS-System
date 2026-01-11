import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBranchDto } from './dto';
export declare class SettingsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getBranch(branchId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        location: string | null;
        phone: string | null;
        address: string | null;
        taxRate: number;
        currency: string;
        receiptFooter: string | null;
        cashbackCapital: number;
        cashbackServiceChargeRate: number;
        cashbackSubdivisionId: string | null;
    }>;
    updateBranch(branchId: string, data: UpdateBranchDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        location: string | null;
        phone: string | null;
        address: string | null;
        taxRate: number;
        currency: string;
        receiptFooter: string | null;
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
