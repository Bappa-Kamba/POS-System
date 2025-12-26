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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async adjustStock(adjustStockDto, user) {
        const log = await this.inventoryService.adjustStock(adjustStockDto, user.id, user.branchId);
        return {
            success: true,
            data: log,
            message: 'Stock adjusted successfully',
        };
    }
    async getInventoryLogs(findAllLogsDto, user) {
        const result = await this.inventoryService.getInventoryLogs(findAllLogsDto, user.branchId);
        return {
            success: true,
            ...result,
        };
    }
    async getAllInventory(user) {
        const inventory = await this.inventoryService.getAllInventory(user.branchId);
        return {
            success: true,
            data: inventory,
        };
    }
    async getExpiringItems(user, days) {
        const daysNumber = days ? parseInt(days, 10) : 30;
        const items = await this.inventoryService.getExpiringItems(user.branchId, daysNumber);
        return {
            success: true,
            data: items,
        };
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('adjust-stock'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AdjustStockDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FindAllLogsDto, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryLogs", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAllInventory", null);
__decorate([
    (0, common_1.Get)('expiring'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getExpiringItems", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map