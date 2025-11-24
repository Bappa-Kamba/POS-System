import {
  IsArray,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, TransactionType } from '@prisma/client';

export class CreateSaleItemDto {
  @IsString()
  productId!: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreatePaymentDto {
  @IsString()
  method!: PaymentMethod;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  @IsOptional()
  items?: CreateSaleItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDto)
  payments!: CreatePaymentDto[];

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  cashbackAmount?: number; // Amount given to customer (for cashback transactions)

  @IsNumber()
  @Min(0)
  @IsOptional()
  serviceCharge?: number; // Manual service charge for cashback

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
