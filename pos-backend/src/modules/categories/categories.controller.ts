import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query('subdivisionId') subdivisionId?: string) {
    const categories = await this.categoriesService.findAll(subdivisionId);
    return {
      success: true,
      data: categories,
    };
  }

  @Get('subdivision/:subdivisionId')
  async getBySubdivision(@Param('subdivisionId') subdivisionId: string) {
    const categories =
      await this.categoriesService.getBySubdivision(subdivisionId);
    return {
      success: true,
      data: categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      success: true,
      data: category,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const category = await this.categoriesService.create(
      createCategoryDto,
      user,
    );
    return {
      success: true,
      data: category,
      message: 'Category created successfully',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const category = await this.categoriesService.update(
      id,
      updateCategoryDto,
      user,
    );
    return {
      success: true,
      data: category,
      message: 'Category updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const category = await this.categoriesService.remove(id, user);
    return {
      success: true,
      data: category,
      message: 'Category deactivated successfully',
    };
  }

  @Patch('reorder')
  async reorder(@Body() reorderCategoriesDto: ReorderCategoriesDto) {
    const result = await this.categoriesService.reorder(reorderCategoriesDto);
    return result;
  }
}
