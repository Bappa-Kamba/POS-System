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
        name: string;
        id: string;
        subdivisionId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
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
        name: string;
        id: string;
        subdivisionId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
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
            receiptFooter: string | null;
            status: import("@prisma/client").$Enums.SubdivisionStatus;
            description: string | null;
            displayName: string;
            color: string | null;
            icon: string | null;
            receiptBusinessName: string | null;
            receiptAddress: string | null;
            receiptPhone: string | null;
        };
    } & {
        name: string;
        id: string;
        subdivisionId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
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
