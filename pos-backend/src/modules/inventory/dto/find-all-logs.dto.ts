import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { InventoryChangeType } from '@prisma/client';

export class FindAllLogsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsEnum(InventoryChangeType)
  changeType?: InventoryChangeType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
