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
exports.SubdivisionsController = void 0;
const common_1 = require("@nestjs/common");
const subdivisions_service_1 = require("./subdivisions.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const receipt_resolution_service_1 = require("../settings/receipt-resolution.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SubdivisionsController = class SubdivisionsController {
    subdivisionsService;
    receiptResolutionService;
    constructor(subdivisionsService, receiptResolutionService) {
        this.subdivisionsService = subdivisionsService;
        this.receiptResolutionService = receiptResolutionService;
    }
    async getReceiptConfig(id, user) {
        const config = await this.receiptResolutionService.resolveReceiptConfig(id, user.branchId);
        return {
            success: true,
            data: config,
        };
    }
    async findAll() {
        const subdivisions = await this.subdivisionsService.findAll();
        return {
            success: true,
            data: subdivisions,
        };
    }
    async findByBranch(branchId) {
        const subdivisions = await this.subdivisionsService.findByBranch(branchId);
        return {
            success: true,
            data: subdivisions,
        };
    }
    async findOne(id) {
        const subdivision = await this.subdivisionsService.findOne(id);
        return {
            success: true,
            data: subdivision,
        };
    }
    async create(createSubdivisionDto) {
        const subdivision = await this.subdivisionsService.create(createSubdivisionDto);
        return {
            success: true,
            data: subdivision,
            message: 'Subdivision created successfully',
        };
    }
    async update(id, updateSubdivisionDto) {
        const subdivision = await this.subdivisionsService.update(id, updateSubdivisionDto);
        return {
            success: true,
            data: subdivision,
            message: 'Subdivision updated successfully',
        };
    }
    async toggleStatus(id) {
        const subdivision = await this.subdivisionsService.toggleStatus(id);
        return {
            success: true,
            data: subdivision,
            message: 'Subdivision status updated successfully',
        };
    }
    async assignToBranch(assignSubdivisionDto) {
        const branchSubdivision = await this.subdivisionsService.assignToBranch(assignSubdivisionDto);
        return {
            success: true,
            data: branchSubdivision,
            message: 'Subdivision assigned to branch successfully',
        };
    }
    async removeFromBranch(subdivisionId, branchId) {
        const result = await this.subdivisionsService.removeFromBranch(branchId, subdivisionId);
        return {
            success: true,
            data: result,
            message: 'Subdivision removed from branch successfully',
        };
    }
    async getBranchSubdivisions(branchId) {
        const subdivisions = await this.subdivisionsService.getBranchSubdivisions(branchId);
        return {
            success: true,
            data: subdivisions,
        };
    }
};
exports.SubdivisionsController = SubdivisionsController;
__decorate([
    (0, common_1.Get)(':id/receipt-config'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "getReceiptConfig", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('branch/:branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "findByBranch", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSubdivisionDto]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSubdivisionDto]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Post)(':id/assign-branch'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AssignSubdivisionDto]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "assignToBranch", null);
__decorate([
    (0, common_1.Delete)(':id/remove-branch/:branchId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "removeFromBranch", null);
__decorate([
    (0, common_1.Get)('branch/:branchId/details'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubdivisionsController.prototype, "getBranchSubdivisions", null);
exports.SubdivisionsController = SubdivisionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('subdivisions'),
    __metadata("design:paramtypes", [subdivisions_service_1.SubdivisionsService,
        receipt_resolution_service_1.ReceiptResolutionService])
], SubdivisionsController);
//# sourceMappingURL=subdivisions.controller.js.map