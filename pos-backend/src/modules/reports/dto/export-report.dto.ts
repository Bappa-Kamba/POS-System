import { IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';

export enum ReportType {
  SALES = 'sales',
  PROFIT_LOSS = 'profit-loss',
  INVENTORY = 'inventory',
  EXPENSES = 'expenses',
  CASHBACK = 'cashback',
  SESSION = 'session',
}

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi-annual',
  YEARLY = 'yearly',
}

export class ExportReportDto {
  @IsEnum(ReportType)
  reportType!: ReportType;

  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsEnum(ReportFrequency)
  frequency?: ReportFrequency;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
