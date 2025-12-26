import { SettingsService } from './settings.service';
import { UpdateBranchDto, AdjustCashbackCapitalDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getBranch(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
    }>;
    updateBranch(user: AuthenticatedRequestUser, updateBranchDto: UpdateBranchDto): Promise<{
        success: boolean;
        data: {
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
        message: string;
    }>;
    adjustCashbackCapital(user: AuthenticatedRequestUser, adjustDto: AdjustCashbackCapitalDto): Promise<{
        success: boolean;
        data: {
            previousCapital: number;
            adjustment: number;
            newCapital: number;
            notes: string | undefined;
        };
        message: string;
    }>;
}
