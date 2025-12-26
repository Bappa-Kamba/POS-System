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
exports.VariantsGlobalController = exports.VariantsController = void 0;
const common_1 = require("@nestjs/common");
const variants_service_1 = require("./variants.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let VariantsController = class VariantsController {
    variantsService;
    constructor(variantsService) {
        this.variantsService = variantsService;
    }
    async create(productId, createVariantDto) {
        const variant = await this.variantsService.create(productId, createVariantDto);
        return {
            success: true,
            data: variant,
            message: 'Variant created successfully',
        };
    }
    async findAll(productId) {
        const variants = await this.variantsService.findAllByProduct(productId);
        return {
            success: true,
            data: variants,
        };
    }
    async findOne(id) {
        const variant = await this.variantsService.findOne(id);
        return {
            success: true,
            data: variant,
        };
    }
    async update(id, updateVariantDto) {
        const variant = await this.variantsService.update(id, updateVariantDto);
        return {
            success: true,
            data: variant,
            message: 'Variant updated successfully',
        };
    }
    async remove(id) {
        const variant = await this.variantsService.remove(id);
        return {
            success: true,
            data: variant,
            message: 'Variant deleted successfully',
        };
    }
    async adjustStock(id, body, user) {
        const variant = await this.variantsService.adjustStock({
            id,
            ...body,
            userId: user.id,
        });
        return {
            success: true,
            data: variant,
            message: 'Stock adjusted successfully',
        };
    }
};
exports.VariantsController = VariantsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateVariantDto]),
    __metadata("design:returntype", Promise)
], VariantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VariantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VariantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateVariantDto]),
    __metadata("design:returntype", Promise)
], VariantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VariantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/adjust-stock'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VariantsController.prototype, "adjustStock", null);
exports.VariantsController = VariantsController = __decorate([
    (0, common_1.Controller)('products/:productId/variants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [variants_service_1.VariantsService])
], VariantsController);
let VariantsGlobalController = class VariantsGlobalController {
    variantsService;
    constructor(variantsService) {
        this.variantsService = variantsService;
    }
    async getLowStock(branchId) {
        const variants = await this.variantsService.getLowStock(branchId);
        return {
            success: true,
            data: variants,
        };
    }
    async getExpiring(days, branchId) {
        const variants = await this.variantsService.getExpiring(days ? +days : 30, branchId);
        return {
            success: true,
            data: variants,
        };
    }
};
exports.VariantsGlobalController = VariantsGlobalController;
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VariantsGlobalController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('expiring'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], VariantsGlobalController.prototype, "getExpiring", null);
exports.VariantsGlobalController = VariantsGlobalController = __decorate([
    (0, common_1.Controller)('variants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [variants_service_1.VariantsService])
], VariantsGlobalController);
//# sourceMappingURL=variants.controller.js.map