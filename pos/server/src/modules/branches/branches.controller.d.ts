import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, FindAllBranchesDto } from './dto';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(createBranchDto: CreateBranchDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    findAll(findAllBranchesDto: FindAllBranchesDto): Promise<{
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
        success: boolean;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
    }>;
    getStatistics(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    update(id: string, updateBranchDto: UpdateBranchDto): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: {
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
        message: string;
    }>;
}
