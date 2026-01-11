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
        };
    }>;
    updateBranch(user: AuthenticatedRequestUser, updateBranchDto: UpdateBranchDto): Promise<{
        success: boolean;
        data: {
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
