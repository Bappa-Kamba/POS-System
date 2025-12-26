import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    username: string;
    email?: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    branchId: string;
    assignedSubdivisionId?: string;
    isActive?: boolean;
}
