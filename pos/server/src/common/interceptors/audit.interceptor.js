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
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuditInterceptor = class AuditInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { user, method, url, body } = request;
        const actionMap = {
            POST: client_1.AuditAction.CREATE,
            PUT: client_1.AuditAction.UPDATE,
            PATCH: client_1.AuditAction.UPDATE,
            DELETE: client_1.AuditAction.DELETE,
        };
        const action = actionMap[method];
        if (!action || !user) {
            return next.handle();
        }
        if (url.includes('/audit-logs')) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)(async (data) => {
            try {
                const entity = this.extractEntity(url);
                const entityId = this.extractEntityId(url) || data?.id;
                const ipAddress = request.ip ||
                    request.headers['x-forwarded-for'] ||
                    request.connection?.remoteAddress ||
                    undefined;
                const userAgent = request.headers['user-agent'] || undefined;
                let oldValues;
                if (action === client_1.AuditAction.UPDATE && data?.oldValues) {
                    oldValues =
                        typeof data.oldValues === 'string'
                            ? data.oldValues
                            : JSON.stringify(data.oldValues);
                }
                await this.prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action,
                        entity,
                        entityId: entityId,
                        oldValues,
                        newValues: body ? JSON.stringify(body) : undefined,
                        ipAddress: ipAddress,
                        userAgent: userAgent,
                    },
                });
            }
            catch (error) {
                console.error('Failed to create audit log:', error);
            }
        }));
    }
    extractEntity(url) {
        const parts = url.split('/').filter(Boolean);
        const apiIndex = parts.findIndex((p) => p === 'api');
        const startIndex = apiIndex >= 0 ? apiIndex + 2 : 0;
        const entityPart = parts[startIndex] || parts[parts.length - 2] || 'unknown';
        return (entityPart.charAt(0).toUpperCase() + entityPart.slice(1).replace(/s$/, ''));
    }
    extractEntityId(url) {
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = url.match(uuidRegex);
        return match ? match[0] : null;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map