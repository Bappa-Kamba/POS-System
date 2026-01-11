import { IsOptional, IsString, IsNumber, Min, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, TransactionType, CreditStatus } from '@prisma/client';

export class FindAllSalesDto {
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
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  cashierId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CreditStatus)
  creditStatus?: CreditStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCreditSale?: boolean;
}
