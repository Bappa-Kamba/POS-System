import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsUUID,
} from 'class-validator';
import { UnitType } from '@prisma/client';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  subdivisionId?: string;

  @IsBoolean()
  @IsOptional()
  hasVariants?: boolean;

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

  @IsString()
  @IsOptional()
  branchId?: string;
}
