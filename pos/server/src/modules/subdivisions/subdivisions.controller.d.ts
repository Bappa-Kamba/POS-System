import { SubdivisionsService } from './subdivisions.service';
import { CreateSubdivisionDto, UpdateSubdivisionDto, AssignSubdivisionDto } from './dto';
export declare class SubdivisionsController {
    private readonly subdivisionsService;
    constructor(subdivisionsService: SubdivisionsService);
    findAll(): Promise<{
        success: boolean;
        data: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SubdivisionStatus;
            description: string | null;
            displayName: string;
            color: string | null;
            icon: string | null;
        }[];
    }>;
    findByBranch(branchId: string): Promise<{
        success: boolean;
        data: ({
            _count: {
                categories: number;
            };
            categories: {
                isActive: boolean;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                subdivisionId: string;
                displayOrder: number;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SubdivisionStatus;
            description: string | null;
            displayName: string;
            color: string | null;
            icon: string | null;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
    }>;
    create(createSubdivisionDto: CreateSubdivisionDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    update(id: string, updateSubdivisionDto: UpdateSubdivisionDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    assignToBranch(assignSubdivisionDto: AssignSubdivisionDto): Promise<{
        success: boolean;
        data: {
            branchId: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subdivisionId: string;
        };
        message: string;
    }>;
    removeFromBranch(subdivisionId: string, branchId: string): Promise<{
        success: boolean;
        data: {
            branchId: string;
            isActive: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subdivisionId: string;
        };
        message: string;
    }>;
    getBranchSubdivisions(branchId: string): Promise<{
        success: boolean;
        data: {
            branchSubdivisionId: string;
            assignedAt: Date;
            categories: ({
                _count: {
                    products: number;
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
            })[];
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SubdivisionStatus;
            description: string | null;
            displayName: string;
            color: string | null;
            icon: string | null;
        }[];
    }>;
}
