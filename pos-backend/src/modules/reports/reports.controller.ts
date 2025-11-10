import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboardStats(@CurrentUser() user: AuthenticatedRequestUser) {
    const stats = await this.reportsService.getDashboardStats(user.branchId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('low-stock')
  async getLowStockItems(@CurrentUser() user: AuthenticatedRequestUser) {
    const items = await this.reportsService.getLowStockItems(user.branchId);
    return {
      success: true,
      data: items,
    };
  }
}
