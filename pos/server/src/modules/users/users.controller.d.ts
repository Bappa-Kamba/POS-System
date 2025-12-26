import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, FindAllUsersDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        data: Omit<{
            username: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            branchId: string;
            assignedSubdivisionId: string | null;
            isActive: boolean;
            id: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, "passwordHash" | "refreshTokenHash">;
        message: string;
    }>;
    findAll(findAllUsersDto: FindAllUsersDto, user: AuthenticatedRequestUser): Promise<{
        data: {
            branch: {
                name: string;
                id: string;
            };
            username: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            branchId: string;
            assignedSubdivisionId: string | null;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        success: boolean;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: Omit<{
            username: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            branchId: string;
            assignedSubdivisionId: string | null;
            isActive: boolean;
            id: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, "passwordHash" | "refreshTokenHash">;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        data: Omit<{
            username: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            branchId: string;
            assignedSubdivisionId: string | null;
            isActive: boolean;
            id: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, "passwordHash" | "refreshTokenHash">;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: Omit<{
            username: string;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            branchId: string;
            assignedSubdivisionId: string | null;
            isActive: boolean;
            id: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, "passwordHash" | "refreshTokenHash">;
        message: string;
    }>;
}
