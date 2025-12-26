export declare enum ReportType {
    SALES = "sales",
    PROFIT_LOSS = "profit-loss",
    INVENTORY = "inventory",
    EXPENSES = "expenses",
    CASHBACK = "cashback",
    SESSION = "session"
}
export declare enum ExportFormat {
    PDF = "pdf",
    EXCEL = "excel",
    CSV = "csv"
}
import { ReportFrequency } from './sales-report.dto';
export declare class ExportReportDto {
    reportType: ReportType;
    format: ExportFormat;
    startDate: string;
    endDate: string;
    frequency?: ReportFrequency;
    filters?: Record<string, any>;
}
