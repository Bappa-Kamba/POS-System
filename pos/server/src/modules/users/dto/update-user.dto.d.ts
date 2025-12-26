import { UserRole } from '@prisma/client';
export declare class UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    branchId?: string;
    isActive?: boolean;
    assignedSubdivisionId?: string;
}
