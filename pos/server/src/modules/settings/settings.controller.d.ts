import { SettingsService } from './settings.service';
import { UpdateBranchDto, AdjustCashbackCapitalDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
import { ReceiptResolutionService } from './receipt-resolution.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly receiptResolutionService;
    constructor(settingsService: SettingsService, receiptResolutionService: ReceiptResolutionService);
    getReceiptConfig(user: AuthenticatedRequestUser, subdivisionId?: string): Promise<{
        success: boolean;
        data: import("./dto/receipt-config.dto").ResolvedReceiptConfig;
    }>;
    getBranch(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateBranch(user: AuthenticatedRequestUser, updateBranchDto: UpdateBranchDto): Promise<{
        success: boolean;
        data: {
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
