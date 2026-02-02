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
        }[];
    }>;
    getBySubdivision(subdivisionId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string | null;
            displayOrder: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    create(createCategoryDto: CreateCategoryDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            subdivisionId: string;
            isActive: boolean;
            displayOrder: number;
        };
        message: string;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            subdivisionId: string;
            isActive: boolean;
            displayOrder: number;
        };
        message: string;
    }>;
    remove(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: {
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
                receiptLogoAssetId: string | null;
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
        };
        message: string;
    }>;
    reorder(reorderCategoriesDto: ReorderCategoriesDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
