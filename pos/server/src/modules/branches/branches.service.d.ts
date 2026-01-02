import { Branch } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto, FindAllBranchesDto } from './dto';
export declare class BranchesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: CreateBranchDto): Promise<Branch>;
    findAll(params: FindAllBranchesDto): Promise<{
        data: ({
            _count: {
                users: number;
                products: number;
                sales: number;
            };
        } & {
            name: string;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            id: string;
            cashbackSubdivisionId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<Branch>;
    update(id: string, data: UpdateBranchDto): Promise<Branch>;
    remove(id: string): Promise<Branch>;
    getStatistics(id: string): Promise<{
        branch: {
            name: string;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            id: string;
            cashbackSubdivisionId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        statistics: {
            users: {
                total: number;
                active: number;
            };
            products: number;
            sales: {
                total: number;
                revenue: number;
            };
            sessions: {
                active: number;
            };
        };
    }>;
}
