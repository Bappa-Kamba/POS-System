import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @Min(0)
  costPrice!: number;

  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @IsNumber()
  @Min(0)
  quantityInStock!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  attributes?: string; // JSON string: {"size": "M", "color": "Blue"}

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
