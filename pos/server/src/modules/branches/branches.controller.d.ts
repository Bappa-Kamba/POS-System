import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, FindAllBranchesDto } from './dto';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    create(createBranchDto: CreateBranchDto): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            receiptFooter: string | null;
            receiptLogoAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
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
            id: string;
            name: string;
            receiptFooter: string | null;
            receiptLogoAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
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
            id: string;
            name: string;
            receiptFooter: string | null;
            receiptLogoAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
    }>;
    getStatistics(id: string): Promise<{
        success: boolean;
        data: {
            branch: {
                id: string;
                name: string;
                receiptFooter: string | null;
                receiptLogoAssetId: string | null;
                createdAt: Date;
                updatedAt: Date;
                location: string | null;
                phone: string | null;
                email: string | null;
                address: string | null;
                taxRate: number;
                currency: string;
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
            id: string;
            name: string;
            receiptFooter: string | null;
            receiptLogoAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            receiptFooter: string | null;
            receiptLogoAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
            location: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            taxRate: number;
            currency: string;
            cashbackCapital: number;
            cashbackServiceChargeRate: number;
            cashbackSubdivisionId: string | null;
        };
        message: string;
    }>;
}
