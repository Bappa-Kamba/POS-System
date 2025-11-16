import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';
import { UserRole } from '@prisma/client';
import { SalesReportDto, ProfitLossDto, ExportReportDto } from './dto';

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

  @Get('sales')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSalesReport(
    @Query() query: SalesReportDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const report = await this.reportsService.getSalesReport(
      user.branchId,
      query,
    );
    return {
      success: true,
      data: report,
    };
  }

  @Get('profit-loss')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getProfitLossReport(
    @Query() query: ProfitLossDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const report = await this.reportsService.getProfitLossReport(
      user.branchId,
      query,
    );
    return {
      success: true,
      data: report,
    };
  }

  @Post('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async exportReport(
    @Body() body: ExportReportDto,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    const result = await this.reportsService.exportReport(user.branchId, body);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.data);
  }
}
