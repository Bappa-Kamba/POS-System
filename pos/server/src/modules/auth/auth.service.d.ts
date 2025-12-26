import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, LicenseStatus } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokens } from './types/auth-tokens.type';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, prisma: PrismaService);
    private readonly logger;
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<{
        user: User;
        tokens: AuthTokens;
        license: {
            licenseStatus: LicenseStatus;
            trialExpiresAt: Date | null;
            isReadOnly: boolean;
        };
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<AuthTokens>;
    logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    private generateTokens;
    private updateRefreshToken;
    sanitizeUser(user: User): Omit<User, 'passwordHash' | 'refreshTokenHash'>;
    private logAudit;
}
