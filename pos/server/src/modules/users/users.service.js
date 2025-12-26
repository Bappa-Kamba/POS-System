"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const config_1 = require("@nestjs/config");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    configService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    findByUsername(username) {
        return this.prisma.user.findUnique({ where: { username } });
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async updateRefreshToken(id, refreshTokenHash) {
        return this.prisma.user.update({
            where: { id },
            data: { refreshTokenHash },
        });
    }
    async create(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username already exists');
        }
        if (data.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const branch = await this.prisma.branch.findUnique({
            where: { id: data.branchId },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        const saltRounds = Number(this.configService.get('BCRYPT_ROUNDS', '10'));
        const passwordHash = await bcrypt.hash(data.password, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                branchId: data.branchId,
                assignedSubdivisionId: data.assignedSubdivisionId,
                isActive: data.isActive ?? true,
            },
        });
        const { passwordHash: _, refreshTokenHash: __, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
    }
    async findAll(params) {
        const { skip = 0, take = 20, search, role, isActive, branchId } = params;
        this.logger.log(`Users findAll - isActive: ${isActive} (type: ${typeof isActive})`);
        const where = {
            ...(branchId && { branchId }),
            ...(role && { role }),
            ...(isActive !== undefined &&
                isActive !== 'ALL' &&
                typeof isActive === 'boolean' && { isActive }),
            ...(search && {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } },
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                ],
            }),
        };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                include: {
                    branch: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        const sanitizedUsers = users.map((user) => {
            const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = user;
            return userWithoutSensitive;
        });
        return {
            data: sanitizedUsers,
            meta: {
                total,
                page: Math.floor(skip / take) + 1,
                lastPage: Math.ceil(total / take),
            },
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                branch: {
                    select: { id: true, name: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
    }
    async update(id, data) {
        const user = await this.findOne(id);
        if (data.username && data.username !== user.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: data.username },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        if (data.email && data.email !== user.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (data.branchId) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: data.branchId },
            });
            if (!branch) {
                throw new common_1.NotFoundException('Branch not found');
            }
        }
        const { password, ...dataWithoutPassword } = data;
        const updateData = { ...dataWithoutPassword };
        if (password) {
            const saltRounds = Number(this.configService.get('BCRYPT_ROUNDS', '10'));
            updateData.passwordHash = await bcrypt.hash(password, saltRounds);
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                branch: {
                    select: { id: true, name: true },
                },
            },
        });
        const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = updated;
        return userWithoutSensitive;
    }
    async remove(id) {
        const user = await this.findOne(id);
        if (!user.isActive) {
            throw new common_1.BadRequestException('User not found');
        }
        const deleted = await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            include: {
                branch: {
                    select: { id: true, name: true },
                },
            },
        });
        const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = deleted;
        return userWithoutSensitive;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map