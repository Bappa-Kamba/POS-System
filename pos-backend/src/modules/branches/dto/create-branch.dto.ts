import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  taxRate?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  receiptFooter?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashbackCapital?: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  cashbackServiceChargeRate?: number;
}
