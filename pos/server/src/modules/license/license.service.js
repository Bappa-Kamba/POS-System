"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LicenseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let LicenseService = LicenseService_1 = class LicenseService {
    prisma;
    config;
    logger = new common_1.Logger(LicenseService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async onModuleInit() {
        await this.initializeLicense();
    }
    async initializeLicense() {
        const existing = await this.prisma.appLicense.findUnique({
            where: { id: 'SYSTEM_LICENSE' },
        });
        if (!existing) {
            const trialDays = this.config.get('TRIAL_DAYS', 14);
            const shopCode = this.config.getOrThrow('SHOP_CODE');
            const initialHash = this.config.getOrThrow('LICENSE_UNLOCK_HASH');
            await this.prisma.appLicense.create({
                data: {
                    id: 'SYSTEM_LICENSE',
                    shopCode,
                    unlockCodeHash: initialHash,
                    trialExpiresAt: new Date(new Date().getTime() + trialDays * 24 * 60 * 60 * 1000),
                    licenseStatus: client_1.LicenseStatus.TRIAL,
                },
            });
            this.logger.log(`[License] System initialized. Trial expires at: ${trialDays} days.`);
        }
        else {
            this.logger.log(`[License] System already initialized. Trial expires at: ${existing.trialExpiresAt} days.`);
        }
    }
    async getLicense() {
        return this.prisma.appLicense.findUnique({
            where: { id: 'SYSTEM_LICENSE' },
        });
    }
    async checkLicenseState() {
        const license = await this.getLicense();
        if (!license)
            return { isExpired: true, status: client_1.LicenseStatus.EXPIRED };
        if (license.licenseStatus === client_1.LicenseStatus.ACTIVE) {
            return { isExpired: false, status: client_1.LicenseStatus.ACTIVE };
        }
        if (license.licenseStatus === client_1.LicenseStatus.EXPIRED) {
            return { isExpired: true, status: client_1.LicenseStatus.EXPIRED };
        }
        const now = new Date();
        if (now < license.lastCheckedAt) {
            await this.updateStatus(client_1.LicenseStatus.EXPIRED);
            return { isExpired: true, status: client_1.LicenseStatus.EXPIRED };
        }
        await this.prisma.appLicense.update({
            where: { id: 'SYSTEM_LICENSE' },
            data: { lastCheckedAt: now },
        });
        if (now > license.trialExpiresAt) {
            await this.updateStatus(client_1.LicenseStatus.EXPIRED);
            return { isExpired: true, status: client_1.LicenseStatus.EXPIRED };
        }
        return { isExpired: false, status: client_1.LicenseStatus.TRIAL };
    }
    async updateStatus(status) {
        await this.prisma.appLicense.update({
            where: { id: 'SYSTEM_LICENSE' },
            data: { licenseStatus: status },
        });
    }
    async activateWithUnlockCode(providedCode) {
        const license = await this.getLicense();
        if (!license || license.licenseStatus === client_1.LicenseStatus.ACTIVE)
            return false;
        const cleanCode = providedCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const inputHash = crypto
            .createHmac('sha256', license.shopCode)
            .update(cleanCode)
            .digest('hex');
        const isValid = crypto.timingSafeEqual(Buffer.from(license.unlockCodeHash), Buffer.from(inputHash));
        if (isValid) {
            await this.prisma.appLicense.update({
                where: { id: 'SYSTEM_LICENSE' },
                data: {
                    licenseStatus: client_1.LicenseStatus.ACTIVE,
                    activatedAt: new Date(),
                },
            });
            return true;
        }
        return false;
    }
};
exports.LicenseService = LicenseService;
exports.LicenseService = LicenseService = LicenseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], LicenseService);
//# sourceMappingURL=license.service.js.map