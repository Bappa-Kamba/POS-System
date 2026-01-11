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
        }[];
    }>;
    findByBranch(branchId: string): Promise<{
        success: boolean;
        data: ({
            _count: {
                categories: number;
            };
            categories: {
                name: string;
                id: string;
                subdivisionId: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                description: string | null;
                displayOrder: number;
            }[];
        } & {
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
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
    }>;
    create(createSubdivisionDto: CreateSubdivisionDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    update(id: string, updateSubdivisionDto: UpdateSubdivisionDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    assignToBranch(assignSubdivisionDto: AssignSubdivisionDto): Promise<{
        success: boolean;
        data: {
            branchId: string;
            id: string;
            subdivisionId: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
        };
        message: string;
    }>;
    removeFromBranch(subdivisionId: string, branchId: string): Promise<{
        success: boolean;
        data: {
            branchId: string;
            id: string;
            subdivisionId: string;
            createdAt: Date;
            updatedAt: Date;
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
                name: string;
                id: string;
                subdivisionId: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                description: string | null;
                displayOrder: number;
            })[];
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
        }[];
    }>;
}
