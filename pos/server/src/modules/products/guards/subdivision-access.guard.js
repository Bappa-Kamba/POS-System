"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SubdivisionAccessGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubdivisionAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let SubdivisionAccessGuard = SubdivisionAccessGuard_1 = class SubdivisionAccessGuard {
    logger = new common_1.Logger(SubdivisionAccessGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user?.role === client_1.UserRole.ADMIN) {
            return true;
        }
        if (user?.role === client_1.UserRole.CASHIER) {
            if (!user?.assignedSubdivisionId) {
                this.logger.warn(`Unauthorized subdivision access attempt by user ${user?.id}: no subdivision assigned`);
                throw new common_1.ForbiddenException('You have not been assigned to a product subdivision. Please contact your administrator.');
            }
            return true;
        }
        this.logger.warn(`Invalid user role for subdivision access: ${user?.role}`);
        throw new common_1.ForbiddenException('Invalid user role');
    }
};
exports.SubdivisionAccessGuard = SubdivisionAccessGuard;
exports.SubdivisionAccessGuard = SubdivisionAccessGuard = SubdivisionAccessGuard_1 = __decorate([
    (0, common_1.Injectable)()
], SubdivisionAccessGuard);
//# sourceMappingURL=subdivision-access.guard.js.map