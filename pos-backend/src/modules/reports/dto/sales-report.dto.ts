import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export enum ReportGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class SalesReportDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  cashierId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ReportGroupBy)
  groupBy?: ReportGroupBy;

  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;
}
