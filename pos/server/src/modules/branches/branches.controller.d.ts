import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, FindAllBranchesDto } from './dto';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(createBranchDto: CreateBranchDto): Promise<{
        success: boolean;
        data: {
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
        message: string;
    }>;
    findAll(findAllBranchesDto: FindAllBranchesDto): Promise<{
        data: ({
            _count: {
                sales: number;
                users: number;
                products: number;
            };
        } & {
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
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
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
    }>;
    getStatistics(id: string): Promise<{
        success: boolean;
        data: {
            branch: {
                email: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                location: string | null;
                phone: string | null;
                address: string | null;
                taxRate: number;
                currency: string;
                businessName: string | null;
                businessAddress: string | null;
                businessPhone: string | null;
                receiptFooter: string | null;
                cashbackCapital: number;
                cashbackServiceChargeRate: number;
                cashbackSubdivisionId: string | null;
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
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: {
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            businessName: string | null;
            businessAddress: string | null;
            businessPhone: string | null;
            receiptFooter: string | null;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
        message: string;
    }>;
}
