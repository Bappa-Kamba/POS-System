import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class LicenseService implements OnModuleInit {
    private prisma;
    private config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeLicense;
    getLicense(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shopCode: string;
        licenseStatus: import("@prisma/client").$Enums.LicenseStatus;
        trialExpiresAt: Date;
        activatedAt: Date | null;
        unlockCodeHash: string;
        lastCheckedAt: Date;
    } | null>;
    checkLicenseState(): Promise<{
        isExpired: boolean;
        status: "EXPIRED";
    } | {
        isExpired: boolean;
        status: "ACTIVE";
    } | {
        isExpired: boolean;
        status: "TRIAL";
    }>;
    private updateStatus;
    activateWithUnlockCode(providedCode: string): Promise<boolean>;
}
