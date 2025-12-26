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
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = SettingsService_1 = class SettingsService {
    prisma;
    logger = new common_1.Logger(SettingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBranch(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        return branch;
    }
    async updateBranch(branchId, data) {
        const branch = await this.getBranch(branchId);
        const updated = await this.prisma.branch.update({
            where: { id: branchId },
            data,
        });
        this.logger.log(`Branch ${branchId} settings updated`);
        return updated;
    }
    async adjustCashbackCapital(branchId, amount, notes) {
        const branch = await this.getBranch(branchId);
        const newCapital = branch.cashbackCapital + amount;
        if (newCapital < 0) {
            throw new common_1.BadRequestException(`Insufficient capital. Current: ${branch.cashbackCapital}, Adjustment: ${amount}`);
        }
        const updated = await this.prisma.branch.update({
            where: { id: branchId },
            data: {
                cashbackCapital: newCapital,
            },
        });
        this.logger.log(`Cashback capital adjusted for branch ${branchId}: ${amount > 0 ? '+' : ''}${amount} (New balance: ${newCapital})`);
        return {
            previousCapital: branch.cashbackCapital,
            adjustment: amount,
            newCapital: updated.cashbackCapital,
            notes,
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map