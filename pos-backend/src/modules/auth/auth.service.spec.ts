import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    refreshTokenHash: null,
    firstName: 'System',
    lastName: 'Administrator',
    role: UserRole.ADMIN,
    isActive: true,
    branchId: 'branch-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    (configService.getOrThrow as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'jwt-secret';
        case 'JWT_REFRESH_SECRET':
          return 'refresh-secret';
        default:
          throw new Error(`Missing config for ${key}`);
      }
    });

    (configService.get as jest.Mock).mockImplementation((key: string, defaultValue?: unknown) => {
      switch (key) {
        case 'JWT_EXPIRATION':
          return '24h';
        case 'JWT_REFRESH_EXPIRATION':
          return '7d';
        case 'BCRYPT_ROUNDS':
          return '10';
        default:
          return defaultValue;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should validate credentials and return tokens', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      jwtService.signAsync.mockResolvedValueOnce('access-token');
      jwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await service.login({ username: 'admin', password: 'password' });

      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('user-1', 'hashed-refresh-token');
    });

    it('should throw when credentials are invalid', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ username: 'admin', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens when refresh token matches hash', async () => {
      const userWithRefresh: User = {
        ...mockUser,
        refreshTokenHash: 'stored-hash',
      };

      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
      usersService.findById.mockResolvedValue(userWithRefresh);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-refresh-hash');
      jwtService.signAsync.mockResolvedValueOnce('new-access');
      jwtService.signAsync.mockResolvedValueOnce('new-refresh');

      const result = await service.refreshTokens({ refreshToken: 'refresh-token' });

      expect(result.accessToken).toBe('new-access');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('user-1', 'new-refresh-hash');
    });

    it('should throw unauthorized for invalid refresh token', async () => {
      jwtService.verifyAsync.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refreshTokens({ refreshToken: 'bad-token' })).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
});

