import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
  ValidateIf,
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
  @Transform(({ value }) => {
    // Handle 'all' string explicitly - return a special marker
    if (value === 'all' || value === null || value === '') {
      return 'ALL'; // Special marker to indicate "all" was requested
    }
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @ValidateIf((o: FindAllProductsDto) => {
    return o.isActive !== undefined && o.isActive !== 'ALL';
  })
  @IsBoolean()
  isActive?: boolean | string;

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
