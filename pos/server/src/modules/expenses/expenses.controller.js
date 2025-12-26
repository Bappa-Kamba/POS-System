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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("./expenses.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let ExpensesController = class ExpensesController {
    expensesService;
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    async create(createExpenseDto, user) {
        const expense = await this.expensesService.create(createExpenseDto, user.id);
        return {
            success: true,
            data: expense,
            message: 'Expense created successfully',
        };
    }
    async findAll(findAllExpensesDto, user) {
        const params = {
            ...findAllExpensesDto,
            branchId: findAllExpensesDto.branchId || user.branchId,
        };
        const result = await this.expensesService.findAll(params);
        return {
            success: true,
            ...result,
        };
    }
    async getCategories(user) {
        const categories = await this.expensesService.getCategories(user.branchId);
        return {
            success: true,
            data: categories,
        };
    }
    async findOne(id) {
        const expense = await this.expensesService.findOne(id);
        return {
            success: true,
            data: expense,
        };
    }
    async update(id, updateExpenseDto, user) {
        const expense = await this.expensesService.update(id, updateExpenseDto, user.id);
        return {
            success: true,
            data: expense,
            message: 'Expense updated successfully',
        };
    }
    async remove(id, user) {
        await this.expensesService.remove(id, user.id);
        return {
            success: true,
            message: 'Expense deleted successfully',
        };
    }
    async createCategory(createCategoryDto, user) {
        const category = await this.expensesService.createCategory(createCategoryDto, user.branchId, user.id);
        return {
            success: true,
            data: category,
            message: 'Expense category created successfully',
        };
    }
    async getAllCategories(user) {
        const categories = await this.expensesService
            .getAllCategories(user.branchId)
            .catch((error) => {
            throw error;
        });
        return {
            success: true,
            data: categories,
        };
    }
    async getCategory(id, user) {
        const category = await this.expensesService.getCategory(id, user.branchId);
        return {
            success: true,
            data: category,
        };
    }
    async updateCategory(id, updateCategoryDto, user) {
        const category = await this.expensesService.updateCategory(id, updateCategoryDto, user.branchId, user.id);
        return {
            success: true,
            data: category,
            message: 'Expense category updated successfully',
        };
    }
    async removeCategory(id, user) {
        await this.expensesService.deleteCategory(id, user.branchId, user.id);
        return {
            success: true,
            message: 'Expense category deleted successfully',
        };
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FindAllExpensesDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateExpenseCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories/all'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getCategory", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateExpenseCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "removeCategory", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map