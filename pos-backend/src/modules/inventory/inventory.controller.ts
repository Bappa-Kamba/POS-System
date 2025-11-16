import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto, FindAllLogsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjust-stock')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async adjustStock(
    @Body() adjustStockDto: AdjustStockDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const log = await this.inventoryService.adjustStock(
      adjustStockDto,
      user.id,
      user.branchId,
    );
    return {
      success: true,
      data: log,
      message: 'Stock adjusted successfully',
    };
  }

  @Get('logs')
  @Roles(UserRole.ADMIN)
  async getInventoryLogs(
    @Query() findAllLogsDto: FindAllLogsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const result = await this.inventoryService.getInventoryLogs(
      findAllLogsDto,
      user.branchId,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllInventory(@CurrentUser() user: AuthenticatedRequestUser) {
    const inventory = await this.inventoryService.getAllInventory(
      user.branchId,
    );
    return {
      success: true,
      data: inventory,
    };
  }

  @Get('expiring')
  @Roles(UserRole.ADMIN)
  async getExpiringItems(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('days') days?: string,
  ) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    const items = await this.inventoryService.getExpiringItems(
      user.branchId,
      daysNumber,
    );
    return {
      success: true,
      data: items,
    };
  }
}
