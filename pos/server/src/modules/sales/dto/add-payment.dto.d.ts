import { PaymentMethod } from '@prisma/client';
export declare class AddPaymentDto {
    method: PaymentMethod;
    amount: number;
    reference?: string;
    notes?: string;
}
