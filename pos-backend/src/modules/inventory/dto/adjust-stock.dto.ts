import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { InventoryChangeType } from '@prisma/client';

export class AdjustStockDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  @Min(-1000000) // Allow negative for reductions
  quantityChange!: number;

  @IsEnum(InventoryChangeType)
  changeType!: InventoryChangeType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
