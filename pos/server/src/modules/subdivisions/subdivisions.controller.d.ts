import { SubdivisionsService } from './subdivisions.service';
import { CreateSubdivisionDto, UpdateSubdivisionDto, AssignSubdivisionDto } from './dto';
import { ReceiptResolutionService } from '../settings/receipt-resolution.service';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class SubdivisionsController {
    private readonly subdivisionsService;
    private readonly receiptResolutionService;
    constructor(subdivisionsService: SubdivisionsService, receiptResolutionService: ReceiptResolutionService);
    getReceiptConfig(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: import("../settings/dto/receipt-config.dto").ResolvedReceiptConfig;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
    findByBranch(branchId: string): Promise<{
        success: boolean;
        data: ({
            categories: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                subdivisionId: string;
                isActive: boolean;
                displayOrder: number;
            }[];
            _count: {
                categories: number;
            };
        } & {
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
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
    }>;
    create(createSubdivisionDto: CreateSubdivisionDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    update(id: string, updateSubdivisionDto: UpdateSubdivisionDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    assignToBranch(assignSubdivisionDto: AssignSubdivisionDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            subdivisionId: string;
            isActive: boolean;
        };
        message: string;
    }>;
    removeFromBranch(subdivisionId: string, branchId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            subdivisionId: string;
            isActive: boolean;
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
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                subdivisionId: string;
                isActive: boolean;
                displayOrder: number;
            })[];
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
        }[];
    }>;
}
