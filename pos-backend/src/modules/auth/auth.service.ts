import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokens } from './types/auth-tokens.type';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const { username, password } = dto;

    const user = await this.usersService.findByUsername(username);

    if (!user || !user.isActive) {
      // Log failed login attempt
      if (user) {
        await this.logAudit({
          userId: user.id,
          action: AuditAction.LOGIN_FAILED,
          entity: 'User',
          entityId: user.id,
          ipAddress,
          userAgent,
        });
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      // Log failed login attempt
      await this.logAudit({
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Log successful login
    await this.logAudit({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return { user, tokens };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<AuthTokens> {
    const { refreshToken } = dto;
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshMatches = await bcrypt.compare(
        refreshToken,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        user.refreshTokenHash,
      );

      if (!refreshMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);

    // Log logout
    await this.logAudit({
      userId,
      action: AuditAction.LOGOUT,
      entity: 'User',
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
          role: user.role,
          branchId: user.branchId,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRATION', '24h'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_ROUNDS', '10'),
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);
    await this.usersService.updateRefreshToken(userId, refreshTokenHash);
  }

  sanitizeUser(user: User): Omit<User, 'passwordHash' | 'refreshTokenHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshTokenHash, ...rest } = user;
    return rest;
  }

  /**
   * Helper method to log audit trail
   */
  private async logAudit(data: {
    userId: string;
    action: AuditAction;
    entity: string;
    entityId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error}`);
      // Don't throw - audit logging failure shouldn't break the operation
    }
  }
}
