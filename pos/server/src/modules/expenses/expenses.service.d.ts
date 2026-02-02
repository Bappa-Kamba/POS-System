import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, FindAllExpensesDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto';
export declare class ExpensesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: CreateExpenseDto, userId: string): Promise<{
        branch: {
            id: string;
            name: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        branchId: string;
        sessionId: string | null;
        amount: number;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    findAll(params: FindAllExpensesDto): Promise<{
        data: ({
            branch: {
                id: string;
                name: string;
            };
            createdBy: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            } | null;
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            branchId: string;
            sessionId: string | null;
            amount: number;
            title: string;
            date: Date;
            createdById: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<{
        branch: {
            id: string;
            name: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        branchId: string;
        sessionId: string | null;
        amount: number;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    update(id: string, data: UpdateExpenseDto, userId: string): Promise<{
        branch: {
            id: string;
            name: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        branchId: string;
        sessionId: string | null;
        amount: number;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        branch: {
            id: string;
            name: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        branchId: string;
        sessionId: string | null;
        amount: number;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    getCategories(branchId: string): Promise<string[]>;
    createCategory(data: CreateExpenseCategoryDto, branchId: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        isActive: boolean;
    }>;
    getAllCategories(branchId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        isActive: boolean;
    }[]>;
    getCategory(id: string, branchId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        isActive: boolean;
    }>;
    updateCategory(id: string, data: UpdateExpenseCategoryDto, branchId: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        isActive: boolean;
    }>;
    deleteCategory(id: string, branchId: string, userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        isActive: boolean;
    }>;
    getTotalExpenses(branchId: string, startDate?: Date, endDate?: Date): Promise<number>;
    private logAudit;
}
