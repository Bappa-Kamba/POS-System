import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, FindAllUsersDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        data: Omit<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            branchId: string;
            username: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            assignedSubdivisionId: string | null;
        }, "passwordHash" | "refreshTokenHash">;
        message: string;
    }>;
    findAll(findAllUsersDto: FindAllUsersDto, user: AuthenticatedRequestUser): Promise<{
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
        success: boolean;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: Omit<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            branchId: string;
            username: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            assignedSubdivisionId: string | null;
        }, "passwordHash" | "refreshTokenHash">;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        data: Omit<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            branchId: string;
            username: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            assignedSubdivisionId: string | null;
        }, "passwordHash" | "refreshTokenHash">;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: Omit<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            branchId: string;
            username: string;
            passwordHash: string;
            refreshTokenHash: string | null;
            firstName: string | null;
            lastName: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isActive: boolean;
            assignedSubdivisionId: string | null;
        }, "passwordHash" | "refreshTokenHash">;
        message: string;
    }>;
}
