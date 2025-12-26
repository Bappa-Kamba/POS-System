import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, FindAllExpensesDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
        message: string;
    }>;
    findAll(findAllExpensesDto: FindAllExpensesDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
        meta: unknown;
    }>;
    getCategories(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: string[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
        message: string;
    }>;
    remove(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        message: string;
    }>;
    createCategory(createCategoryDto: CreateExpenseCategoryDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
        message: string;
    }>;
    getAllCategories(user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
    }>;
    getCategory(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
    }>;
    updateCategory(id: string, updateCategoryDto: UpdateExpenseCategoryDto, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        data: unknown;
        message: string;
    }>;
    removeCategory(id: string, user: AuthenticatedRequestUser): Promise<{
        success: boolean;
        message: string;
    }>;
}
