import { PaymentStatus, TransactionType } from '@prisma/client';
export declare class FindAllSalesDto {
    skip?: number;
    take?: number;
    startDate?: string;
    endDate?: string;
    cashierId?: string;
    branchId?: string;
    paymentStatus?: PaymentStatus;
    transactionType?: TransactionType;
    search?: string;
}
