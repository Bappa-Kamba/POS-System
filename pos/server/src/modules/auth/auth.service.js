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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    configService;
    prisma;
    constructor(usersService, jwtService, configService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
    }
    logger = new common_1.Logger(AuthService_1.name);
    async login(dto, ipAddress, userAgent) {
        const { username, password } = dto;
        const user = await this.usersService.findByUsername(username);
        const license = await this.prisma.appLicense.findFirst({
            where: {
                id: 'SYSTEM_LICENSE'
            },
        });
        if (!user || !user.isActive) {
            if (user) {
                await this.logAudit({
                    userId: user.id,
                    action: client_1.AuditAction.LOGIN_FAILED,
                    entity: 'User',
                    entityId: user.id,
                    ipAddress,
                    userAgent,
                });
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            await this.logAudit({
                userId: user.id,
                action: client_1.AuditAction.LOGIN_FAILED,
                entity: 'User',
                entityId: user.id,
                ipAddress,
                userAgent,
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        await this.logAudit({
            userId: user.id,
            action: client_1.AuditAction.LOGIN,
            entity: 'User',
            entityId: user.id,
            ipAddress,
            userAgent,
        });
        return {
            user,
            tokens,
            license: {
                licenseStatus: license?.licenseStatus ?? client_1.LicenseStatus.EXPIRED,
                trialExpiresAt: license?.trialExpiresAt ?? null,
                isReadOnly: license?.licenseStatus === client_1.LicenseStatus.EXPIRED,
            },
        };
    }
    async refreshTokens(dto) {
        const { refreshToken } = dto;
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            });
            const user = await this.usersService.findById(payload.sub);
            if (!user || !user.refreshTokenHash) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const refreshMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
            if (!refreshMatches) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = await this.generateTokens(user);
            await this.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (user?.branchId) {
            const activeSession = await this.prisma.session.findFirst({
                where: {
                    branchId: user.branchId,
                    status: 'OPEN',
                },
            });
            if (activeSession) {
                await this.prisma.session.update({
                    where: { id: activeSession.id },
                    data: {
                        status: 'CLOSED',
                        endTime: new Date(),
                        closedById: userId,
                    },
                });
            }
        }
        await this.usersService.updateRefreshToken(userId, null);
        await this.logAudit({
            userId,
            action: client_1.AuditAction.LOGOUT,
            entity: 'User',
            entityId: userId,
            ipAddress,
            userAgent,
        });
    }
    async generateTokens(user) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: user.id,
                username: user.username,
                role: user.role,
                branchId: user.branchId,
            }, {
                secret: this.configService.getOrThrow('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
            }),
            this.jwtService.signAsync({
                sub: user.id,
                username: user.username,
            }, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async updateRefreshToken(userId, refreshToken) {
        const saltRounds = Number(this.configService.get('BCRYPT_ROUNDS', '10'));
        const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
        await this.usersService.updateRefreshToken(userId, refreshTokenHash);
    }
    sanitizeUser(user) {
        const { passwordHash, refreshTokenHash, ...rest } = user;
        return rest;
    }
    async logAudit(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map