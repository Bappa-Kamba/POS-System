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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    oldValues: data.oldValues,
                    newValues: data.newValues,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error}`);
        }
    }
    async findAll(params) {
        const { skip = 0, take = 50, userId, action, entity, entityId, startDate, endDate, } = params;
        const where = {
            ...(userId && { userId }),
            ...(action && { action }),
            ...(entity && { entity }),
            ...(entityId && { entityId }),
            ...(startDate &&
                endDate && {
                createdAt: {
                    gte: (0, date_fns_1.startOfDay)(new Date(startDate)),
                    lte: (0, date_fns_1.endOfDay)(new Date(endDate)),
                },
            }),
            ...(startDate &&
                !endDate && {
                createdAt: {
                    gte: (0, date_fns_1.startOfDay)(new Date(startDate)),
                },
            }),
            ...(!startDate &&
                endDate && {
                createdAt: {
                    lte: (0, date_fns_1.endOfDay)(new Date(endDate)),
                },
            }),
        };
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: {
                total,
                page: Math.floor(skip / take) + 1,
                lastPage: Math.ceil(total / take),
            },
        };
    }
    async findOne(id) {
        const log = await this.prisma.auditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
        });
        if (!log) {
            throw new common_1.NotFoundException('Audit log not found');
        }
        return log;
    }
    async findByEntity(entity, entityId) {
        const logs = await this.prisma.auditLog.findMany({
            where: {
                entity,
                entityId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return logs;
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map