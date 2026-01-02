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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(data: CreateSubdivisionDto): Promise<Subdivision>;
    update(id: string, data: UpdateSubdivisionDto): Promise<Subdivision>;
    toggleStatus(id: string): Promise<Subdivision>;
    assignToBranch(data: AssignSubdivisionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        subdivisionId: string;
        isActive: boolean;
    }>;
    removeFromBranch(branchId: string, subdivisionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        subdivisionId: string;
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
