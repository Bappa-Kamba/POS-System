import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products/:productId/variants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    const variant = await this.variantsService.create(
      productId,
      createVariantDto,
    );
    return {
      success: true,
      data: variant,
      message: 'Variant created successfully',
    };
  }

  @Get()
  async findAll(@Param('productId') productId: string) {
    const variants = await this.variantsService.findAllByProduct(productId);
    return {
      success: true,
      data: variants,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const variant = await this.variantsService.findOne(id);
    return {
      success: true,
      data: variant,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    const variant = await this.variantsService.update(id, updateVariantDto);
    return {
      success: true,
      data: variant,
      message: 'Variant updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const variant = await this.variantsService.remove(id);
    return {
      success: true,
      data: variant,
      message: 'Variant deleted successfully',
    };
  }

  @Post(':id/adjust-stock')
  @Roles(UserRole.ADMIN)
  async adjustStock(
    @Param('id') id: string,
    @Body()
    body: {
      quantityChange: number;
      changeType: string;
      reason?: string;
      notes?: string;
    },
    @CurrentUser() user: any,
  ) {
    const variant = await this.variantsService.adjustStock({
      id,
      ...body,
      userId: (user as { id: string }).id,
    });
    return {
      success: true,
      data: variant,
      message: 'Stock adjusted successfully',
    };
  }
}

@Controller('variants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VariantsGlobalController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get('low-stock')
  @Roles(UserRole.ADMIN)
  async getLowStock(@Query('branchId') branchId?: string) {
    const variants = await this.variantsService.getLowStock(branchId);
    return {
      success: true,
      data: variants,
    };
  }

  @Get('expiring')
  @Roles(UserRole.ADMIN)
  async getExpiring(
    @Query('days') days?: number,
    @Query('branchId') branchId?: string,
  ) {
    const variants = await this.variantsService.getExpiring(
      days ? +days : 30,
      branchId,
    );
    return {
      success: true,
      data: variants,
    };
  }
}
