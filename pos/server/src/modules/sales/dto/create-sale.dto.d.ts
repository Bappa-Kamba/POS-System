import { PaymentMethod, TransactionType } from '@prisma/client';
export declare class CreateSaleItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreatePaymentDto {
    method: PaymentMethod;
    amount: number;
    reference?: string;
    notes?: string;
}
export declare class CreateSaleDto {
    items?: CreateSaleItemDto[];
    payments: CreatePaymentDto[];
    transactionType?: TransactionType;
    cashbackAmount?: number;
    serviceCharge?: number;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
}
