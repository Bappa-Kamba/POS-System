import { Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class CategoriesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(subdivisionId?: string): Promise<{
        productCount: number;
        subdivision: {
            name: string;
            id: string;
            displayName: string;
        };
        _count: {
            products: number;
        };
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        subdivisionId: string;
        displayOrder: number;
    }[]>;
    findOne(id: string): Promise<{
        productCount: number;
        subdivision: {
            name: string;
            id: string;
            displayName: string;
            color: string | null;
            icon: string | null;
        };
        _count: {
            products: number;
        };
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        subdivisionId: string;
        displayOrder: number;
    }>;
    create(data: CreateCategoryDto, user: AuthenticatedRequestUser): Promise<Category>;
    update(id: string, data: UpdateCategoryDto, user: AuthenticatedRequestUser): Promise<Category>;
    remove(id: string, user: AuthenticatedRequestUser): Promise<{
        subdivision: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SubdivisionStatus;
            description: string | null;
            displayName: string;
            color: string | null;
            icon: string | null;
        };
    } & {
        isActive: boolean;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        subdivisionId: string;
        displayOrder: number;
    }>;
    getBySubdivision(subdivisionId: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        displayOrder: number;
    }[]>;
    reorder(data: ReorderCategoriesDto): Promise<{
        success: boolean;
        message: string;
    }>;
    validateAccess(categoryId: string, user: AuthenticatedRequestUser): Promise<void>;
}
