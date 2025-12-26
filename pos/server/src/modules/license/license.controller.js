"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseController = void 0;
const common_1 = require("@nestjs/common");
const license_service_1 = require("./license.service");
let LicenseController = class LicenseController {
    licenseService;
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    async getStatus() {
        const state = await this.licenseService.checkLicenseState();
        const license = await this.licenseService.getLicense();
        return {
            success: true,
            data: {
                status: state.status,
                trialExpiresAt: license?.trialExpiresAt,
                isReadOnly: state.isExpired
            }
        };
    }
    async unlock(code) {
        const success = await this.licenseService.activateWithUnlockCode(code);
        if (!success) {
            throw new common_1.ForbiddenException('Invalid unlock code.');
        }
        return { success: true, message: 'System activated successfully.' };
    }
};
exports.LicenseController = LicenseController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('unlock'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicenseController.prototype, "unlock", null);
exports.LicenseController = LicenseController = __decorate([
    (0, common_1.Controller)('license'),
    __metadata("design:paramtypes", [license_service_1.LicenseService])
], LicenseController);
//# sourceMappingURL=license.controller.js.map