import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, FindAllSalesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const sale = await this.salesService.create(
      createSaleDto,
      user.id,
      user.branchId,
    );

    return {
      success: true,
      data: sale,
      message: 'Sale created successfully',
    };
  }

  @Get()
  async findAll(
    @Query() query: FindAllSalesDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    // If user is cashier, only show their sales
    const params: FindAllSalesDto = {
      ...query,
      branchId: user.branchId,
      ...(user.role === 'CASHIER' && { cashierId: user.id }),
    };

    const result = await this.salesService.findAll(params);

    return {
      success: true,
      ...result,
    };
  }

  @Get('daily-summary')
  async getDailySummary(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('date') date?: string,
  ) {
    const targetDate = date ? new Date(date) : undefined;
    const summary = await this.salesService.getDailySummary(
      user.id,
      user.branchId,
      targetDate,
    );

    return {
      success: true,
      data: summary,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sale = await this.salesService.findOne(id);

    return {
      success: true,
      data: sale,
    };
  }

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string) {
    const receiptData = await this.salesService.getReceiptData(id);

    return {
      success: true,
      data: receiptData,
    };
  }
}
