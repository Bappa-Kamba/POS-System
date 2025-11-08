import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { ProductCategory, UnitType } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @IsBoolean()
  @IsOptional()
  hasVariants?: boolean = false;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantityInStock?: number;

  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lowStockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number;

  @IsString()
  @IsNotEmpty()
  branchId!: string;
}
