import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, FindAllUsersDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  /**
   * Create a new user
   */
  async create(
    data: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>> {
    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Hash password
    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_ROUNDS', '10'),
    );
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        branchId: data.branchId,
        assignedSubdivision: data.assignedSubdivision,
        isActive: data.isActive ?? true,
      },
    });

    // Return user without sensitive data
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordHash: _,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      refreshTokenHash: __,
      ...userWithoutSensitive
    } = user;
    return userWithoutSensitive;
  }

  /**
   * Get all users with filtering and pagination
   */
  async findAll(params: FindAllUsersDto) {
    const { skip = 0, take = 20, search, role, isActive, branchId } = params;

    this.logger.log(
      `Users findAll - isActive: ${isActive} (type: ${typeof isActive})`,
    );

    const where: Prisma.UserWhereInput = {
      ...(branchId && { branchId }),
      ...(role && { role }),
      // If isActive is 'ALL', it means "all" was explicitly requested (via 'all' string)
      // So we don't filter by isActive (return all users)
      // Otherwise, filter by the boolean value (true for active, false for inactive)
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

    // Remove sensitive data
    const sanitizedUsers = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   * Get single user by ID
   */
  async findOne(
    id: string,
  ): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>> {
    const user = await this.findOne(id);

    // Check if username is being changed and if it already exists
    if (data.username && data.username !== user.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Verify branch exists if being changed
    if (data.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: data.branchId },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
    }

    // Hash password if being updated
    const { password, ...dataWithoutPassword } = data;
    const updateData: Prisma.UserUpdateInput = { ...dataWithoutPassword };
    if (password) {
      const saltRounds = Number(
        this.configService.get<string>('BCRYPT_ROUNDS', '10'),
      );
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = updated;
    return userWithoutSensitive;
  }

  /**
   * Soft delete user (set isActive to false)
   */
  async remove(
    id: string,
  ): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>> {
    const user = await this.findOne(id);

    if (!user.isActive) {
      throw new BadRequestException('User not found');
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = deleted;
    return userWithoutSensitive;
  }
}
