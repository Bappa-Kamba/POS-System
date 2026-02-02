import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, FindAllUsersDto } from './dto';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateRefreshToken(id: string, refreshTokenHash: string | null): Promise<User>;
    create(data: CreateUserDto): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>>;
    findAll(params: FindAllUsersDto): Promise<{
        data: {
            branch: {
                id: string;
                name: string;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            branchId: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            assignedSubdivisionId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>>;
    update(id: string, data: UpdateUserDto): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>>;
    remove(id: string): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash'>>;
}
