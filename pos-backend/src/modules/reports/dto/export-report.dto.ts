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

import { SalesReportDto, ReportFrequency } from './sales-report.dto';

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
