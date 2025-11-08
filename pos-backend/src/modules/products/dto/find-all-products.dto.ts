import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductCategory } from '@prisma/client';

/**
 * Transform string boolean values to actual booleans
 * Handles query params that come as strings
 */
const TransformBoolean = () =>
  Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  });

export class FindAllProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  hasVariants?: boolean;

  @IsOptional()
  @TransformBoolean()
  @IsBoolean()
  lowStock?: boolean;

  @IsOptional()
  @IsString()
  branchId?: string;
}
