import { Subdivision } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubdivisionDto, UpdateSubdivisionDto, AssignSubdivisionDto } from './dto';
export declare class SubdivisionsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): Promise<Subdivision[]>;
    findOne(id: string): Promise<Subdivision>;
    findByBranch(branchId: string): Promise<({
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
    })[]>;
    create(data: CreateSubdivisionDto): Promise<Subdivision>;
    update(id: string, data: UpdateSubdivisionDto): Promise<Subdivision>;
    toggleStatus(id: string): Promise<Subdivision>;
    assignToBranch(data: AssignSubdivisionDto): Promise<{
        branchId: string;
        id: string;
        subdivisionId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    removeFromBranch(branchId: string, subdivisionId: string): Promise<{
        branchId: string;
        id: string;
        subdivisionId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    getBranchSubdivisions(branchId: string): Promise<{
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
    }[]>;
}
