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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const sessions_service_1 = require("./sessions.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let SessionsController = class SessionsController {
    sessionsService;
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    async startSession(req, dto) {
        const session = await this.sessionsService.startSession(req.user.branchId, req.user.id, dto);
        return {
            success: true,
            data: session,
            message: 'Session started successfully',
        };
    }
    async endSession(req, id, dto) {
        const session = await this.sessionsService.endSession(id, req.user.id, dto);
        return {
            success: true,
            data: session,
            message: 'Session ended successfully',
        };
    }
    async getActiveSession(req) {
        const session = await this.sessionsService.getActiveSession(req.user.branchId, req.user.id);
        return {
            success: true,
            data: session,
        };
    }
    async getSessionHistory(req) {
        const history = await this.sessionsService.getSessionHistory(req.user.branchId);
        return {
            success: true,
            data: history,
        };
    }
    async getSessionDetails(id) {
        const session = await this.sessionsService.getSessionDetails(id);
        return {
            success: true,
            data: session,
        };
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)('start'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.StartSessionDto]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.EndSessionDto]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "endSession", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getActiveSession", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessionHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.CASHIER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessionDetails", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map