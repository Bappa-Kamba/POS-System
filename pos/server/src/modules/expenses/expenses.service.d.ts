import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto, FindAllExpensesDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto';
export declare class ExpensesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: CreateExpenseDto, userId: string): Promise<{
        branch: {
            name: string;
            id: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        amount: number;
        branchId: string;
        category: string;
        id: string;
        sessionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    findAll(params: FindAllExpensesDto): Promise<{
        data: ({
            branch: {
                name: string;
                id: string;
            };
            createdBy: {
                id: string;
                username: string;
                firstName: string | null;
                lastName: string | null;
            } | null;
        } & {
            amount: number;
            branchId: string;
            category: string;
            id: string;
            sessionId: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
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
            name: string;
            id: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        amount: number;
        branchId: string;
        category: string;
        id: string;
        sessionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    update(id: string, data: UpdateExpenseDto, userId: string): Promise<{
        branch: {
            name: string;
            id: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        amount: number;
        branchId: string;
        category: string;
        id: string;
        sessionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        branch: {
            name: string;
            id: string;
        };
        createdBy: {
            id: string;
            username: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        amount: number;
        branchId: string;
        category: string;
        id: string;
        sessionId: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        date: Date;
        createdById: string | null;
    }>;
    getCategories(branchId: string): Promise<string[]>;
    createCategory(data: CreateExpenseCategoryDto, branchId: string, userId: string): Promise<{
        branchId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
    }>;
    getAllCategories(branchId: string): Promise<{
        branchId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
    }[]>;
    getCategory(id: string, branchId: string): Promise<{
        branchId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
    }>;
    updateCategory(id: string, data: UpdateExpenseCategoryDto, branchId: string, userId: string): Promise<{
        branchId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
    }>;
    deleteCategory(id: string, branchId: string, userId: string): Promise<{
        branchId: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string | null;
    }>;
    getTotalExpenses(branchId: string, startDate?: Date, endDate?: Date): Promise<number>;
    private logAudit;
}
