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
            id: string;
            name: string;
            displayName: string;
        };
        _count: {
            products: number;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        subdivisionId: string;
        isActive: boolean;
        displayOrder: number;
    }[]>;
    findOne(id: string): Promise<{
        productCount: number;
        subdivision: {
            id: string;
            name: string;
            displayName: string;
            color: string | null;
            icon: string | null;
        };
        _count: {
            products: number;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        subdivisionId: string;
        isActive: boolean;
        displayOrder: number;
    }>;
    create(data: CreateCategoryDto, user: AuthenticatedRequestUser): Promise<Category>;
    update(id: string, data: UpdateCategoryDto, user: AuthenticatedRequestUser): Promise<Category>;
    remove(id: string, user: AuthenticatedRequestUser): Promise<{
        subdivision: {
            id: string;
            name: string;
            displayName: string;
            description: string | null;
            status: import("@prisma/client").$Enums.SubdivisionStatus;
            color: string | null;
            icon: string | null;
            receiptBusinessName: string | null;
            receiptAddress: string | null;
            receiptPhone: string | null;
            receiptFooter: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        subdivisionId: string;
        isActive: boolean;
        displayOrder: number;
    }>;
    getBySubdivision(subdivisionId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        displayOrder: number;
    }[]>;
    reorder(data: ReorderCategoriesDto): Promise<{
        success: boolean;
        message: string;
    }>;
    validateAccess(categoryId: string, user: AuthenticatedRequestUser): Promise<void>;
}
