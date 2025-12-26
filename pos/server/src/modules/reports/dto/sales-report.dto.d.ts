import { TransactionType } from '@prisma/client';
export declare enum ReportGroupBy {
    DAY = "day",
    WEEK = "week",
    MONTH = "month"
}
export declare enum ReportFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    SEMI_ANNUAL = "semi-annual",
    YEARLY = "yearly"
}
export declare class SalesReportDto {
    startDate: string;
    endDate: string;
    cashierId?: string;
    category?: string;
    groupBy?: ReportGroupBy;
    transactionType?: TransactionType;
    sessionId?: string;
    frequency?: ReportFrequency;
}
