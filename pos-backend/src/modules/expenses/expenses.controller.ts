import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto, FindAllExpensesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const expense = await this.expensesService.create(
      createExpenseDto,
      user.id,
    );
    return {
      success: true,
      data: expense,
      message: 'Expense created successfully',
    };
  }

  @Get()
  async findAll(
    @Query() findAllExpensesDto: FindAllExpensesDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    // If no branchId specified, filter by current user's branch
    const params = {
      ...findAllExpensesDto,
      branchId: findAllExpensesDto.branchId || user.branchId,
    };

    const result = await this.expensesService.findAll(params);
    return {
      success: true,
      ...result,
    };
  }

  @Get('categories')
  async getCategories(@CurrentUser() user: AuthenticatedRequestUser) {
    const categories = await this.expensesService.getCategories(user.branchId);
    return {
      success: true,
      data: categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const expense = await this.expensesService.findOne(id);
    return {
      success: true,
      data: expense,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const expense = await this.expensesService.update(
      id,
      updateExpenseDto,
      user.id,
    );
    return {
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    await this.expensesService.remove(id, user.id);
    return {
      success: true,
      message: 'Expense deleted successfully',
    };
  }
}
