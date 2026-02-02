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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptResolutionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ReceiptResolutionService = class ReceiptResolutionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveReceiptConfig(subdivisionId, branchId) {
        let subdivision = null;
        if (subdivisionId) {
            subdivision = await this.prisma.subdivision.findUnique({
                where: { id: subdivisionId },
            });
        }
        const targetBranchId = branchId;
        if (!targetBranchId) {
            throw new Error('Branch ID is required to resolve receipt configuration');
        }
        const targetBranch = await this.prisma.branch.findUnique({
            where: { id: targetBranchId },
        });
        if (!targetBranch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const mainBranch = await this.prisma.branch.findFirst({
            orderBy: { createdAt: 'asc' },
        });
        return {
            businessName: subdivision?.receiptBusinessName ||
                targetBranch.name ||
                '',
            businessAddress: subdivision?.receiptAddress ||
                targetBranch.address ||
                mainBranch?.address ||
                '',
            businessPhone: subdivision?.receiptPhone ||
                targetBranch.phone ||
                mainBranch?.phone ||
                '',
            receiptFooter: subdivision?.receiptFooter ||
                targetBranch.receiptFooter ||
                mainBranch?.receiptFooter ||
                '',
            branchName: targetBranch.name,
            currency: targetBranch.currency,
            logoAssetId: subdivision?.receiptLogoAssetId ||
                targetBranch.receiptLogoAssetId ||
                mainBranch?.receiptLogoAssetId ||
                undefined,
        };
    }
};
exports.ReceiptResolutionService = ReceiptResolutionService;
exports.ReceiptResolutionService = ReceiptResolutionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceiptResolutionService);
//# sourceMappingURL=receipt-resolution.service.js.map