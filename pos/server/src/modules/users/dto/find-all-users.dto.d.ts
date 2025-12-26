import { UserRole } from '@prisma/client';
export declare class FindAllUsersDto {
    skip?: number;
    take?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean | string;
    branchId?: string;
}
