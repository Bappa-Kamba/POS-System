import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsHexColor,
} from 'class-validator';
import { ProductSubdivision } from '@prisma/client';

export class CreateSubdivisionDto {
  @IsEnum(ProductSubdivision)
  name!: ProductSubdivision;

  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
