import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { AuthenticatedRequestUser } from './types/authenticated-user.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: Request): Promise<{
        success: boolean;
        data: {
            user: Omit<{
                branchId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                username: string;
                email: string | null;
                passwordHash: string;
                refreshTokenHash: string | null;
                firstName: string | null;
                lastName: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                isActive: boolean;
                assignedSubdivisionId: string | null;
            }, "passwordHash" | "refreshTokenHash">;
            tokens: import("./types/auth-tokens.type").AuthTokens;
        };
        message: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        success: boolean;
        data: {
            tokens: import("./types/auth-tokens.type").AuthTokens;
        };
        message: string;
    }>;
    logout(user: AuthenticatedRequestUser, req: Request): Promise<{
        success: boolean;
        data: null;
        message: string;
    }>;
    me(user: AuthenticatedRequestUser): {
        success: boolean;
        data: {
            user: AuthenticatedRequestUser;
        };
    };
}
