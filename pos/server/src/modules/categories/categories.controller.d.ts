import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(subdivisionId?: string): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    getBySubdivision(subdivisionId: string): Promise<{
        success: boolean;
        data: {
            name: string;
            id: string;
            description: string | null;
            displayOrder: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    create(createCategoryDto: CreateCategoryDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            subdivisionId: string;
            displayOrder: number;
        };
        message: string;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            isActive: boolean;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            subdivisionId: string;
            displayOrder: number;
        };
        message: string;
    }>;
    remove(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    reorder(reorderCategoriesDto: ReorderCategoriesDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
