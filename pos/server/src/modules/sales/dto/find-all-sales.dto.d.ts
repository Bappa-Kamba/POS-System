import { PaymentStatus, TransactionType, CreditStatus } from '@prisma/client';
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
    creditStatus?: CreditStatus;
    isCreditSale?: boolean;
}
