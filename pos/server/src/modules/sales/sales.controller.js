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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const sales_service_1 = require("./sales.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SalesController = class SalesController {
    salesService;
    constructor(salesService) {
        this.salesService = salesService;
    }
    async create(createSaleDto, user) {
        const sale = await this.salesService.create(createSaleDto, user.id, user.branchId);
        return {
            success: true,
            data: sale,
            message: 'Sale created successfully',
        };
    }
    async findAll(query, user) {
        const params = {
            ...query,
            branchId: user.branchId,
            ...(user.role === 'CASHIER' && { cashierId: user.id }),
        };
        const result = await this.salesService.findAll(params);
        return {
            success: true,
            ...result,
        };
    }
    async getDailySummary(user, date) {
        const targetDate = date ? new Date(date) : undefined;
        const summary = await this.salesService.getDailySummary(user.id, user.branchId, targetDate);
        return {
            success: true,
            data: summary,
        };
    }
    async findOne(id) {
        const sale = await this.salesService.findOne(id);
        return {
            success: true,
            data: sale,
        };
    }
    async getReceipt(id) {
        const receiptData = await this.salesService.getReceiptData(id);
        return {
            success: true,
            data: receiptData,
        };
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSaleDto, Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FindAllSalesDto, Object]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('daily-summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getDailySummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesController.prototype, "getReceipt", null);
exports.SalesController = SalesController = __decorate([
    (0, common_1.Controller)('sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map