import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEmail,
} from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
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
  businessName?: string;

  @IsString()
  @IsOptional()
  businessAddress?: string;

  @IsString()
  @IsOptional()
  businessPhone?: string;

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
