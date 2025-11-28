import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateBranchDto, AdjustCashbackCapitalDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('branch')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getBranch(@CurrentUser() user: AuthenticatedRequestUser) {
    const branch = await this.settingsService.getBranch(user.branchId);
    return {
      success: true,
      data: branch,
    };
  }

  @Patch('branch')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateBranch(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    const branch = await this.settingsService.updateBranch(
      user.branchId,
      updateBranchDto,
    );
    return {
      success: true,
      data: branch,
      message: 'Branch settings updated successfully',
    };
  }

  @Post('cashback-capital/adjust')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async adjustCashbackCapital(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() adjustDto: AdjustCashbackCapitalDto,
  ) {
    const result = await this.settingsService.adjustCashbackCapital(
      user.branchId,
      adjustDto.amount,
      adjustDto.notes,
    );
    return {
      success: true,
      data: result,
      message: `Cashback capital ${adjustDto.amount > 0 ? 'added' : 'deducted'} successfully`,
    };
  }
}
