import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubdivisionAccessGuard } from './guards/subdivision-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequestUser } from '../auth/types/authenticated-user.type';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard, SubdivisionAccessGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const product = await this.productsService.create(
      createProductDto,
      user.id,
      user,
    );
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async findAll(
    @Query() query: FindAllProductsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const result = await this.productsService.findAll(query, user);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async search(@Query('q') query: string, @Query('limit') limit?: number) {
    const products = await this.productsService.search(
      query,
      limit ? +limit : 10,
    );
    return {
      success: true,
      data: products,
    };
  }

  @Get('generate-barcode')
  @Roles(UserRole.ADMIN)
  async generateBarcode() {
    const barcode = await this.productsService.generateBarcode();
    return {
      success: true,
      data: {
        barcode,
        format: 'EAN-13',
      },
    };
  }

  @Get('by-barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string) {
    const result = await this.productsService.findByBarcode(barcode);
    if (!result) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product or variant with this barcode not found',
        },
        statusCode: 404,
      };
    }
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const product = await this.productsService.findOne(id, user);
    return {
      success: true,
      data: product,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const product = await this.productsService.update(
      id,
      updateProductDto,
      user.id,
      user,
    );
    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    const product = await this.productsService.remove(id, user.id, user);
    return {
      success: true,
      data: product,
      message: 'Product deleted successfully',
    };
  }
}
