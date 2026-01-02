import { LicenseService } from "./license.service";
export declare class LicenseController {
    private licenseService;
    constructor(licenseService: LicenseService);
    getStatus(): Promise<{
        success: boolean;
        data: {
            status: "ACTIVE" | "TRIAL" | "EXPIRED";
            trialExpiresAt: Date | undefined;
            isReadOnly: boolean;
        };
    }>;
    unlock(code: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
