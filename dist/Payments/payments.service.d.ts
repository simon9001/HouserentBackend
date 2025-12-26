export interface Payment {
    PaymentId: string;
    UserId: string;
    PropertyId?: string;
    Amount: number;
    Currency: string;
    PaymentProvider: string;
    ProviderReference: string;
    Purpose: 'ACCESS' | 'BOOST' | 'SUBSCRIPTION' | 'BOOKING' | 'DEPOSIT';
    Status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    CreatedAt: Date;
    CompletedAt?: Date;
}
export interface CreatePaymentInput {
    userId: string;
    propertyId?: string;
    amount: number;
    currency?: string;
    paymentProvider: string;
    providerReference: string;
    purpose: Payment['Purpose'];
}
export interface UpdatePaymentInput {
    status?: Payment['Status'];
    providerReference?: string;
    completedAt?: Date;
}
export declare class PaymentsService {
    private db;
    constructor();
    private getDb;
    createPayment(data: CreatePaymentInput): Promise<Payment>;
    getPaymentById(paymentId: string): Promise<Payment & {
        UserName?: string;
        PropertyTitle?: string;
    }>;
    getPaymentsByUserId(userId: string, status?: string): Promise<Payment[]>;
    getPaymentsByPropertyId(propertyId: string): Promise<Payment[]>;
    updatePayment(paymentId: string, data: UpdatePaymentInput): Promise<Payment>;
    completePayment(paymentId: string): Promise<Payment>;
    failPayment(paymentId: string, reason?: string): Promise<Payment>;
    refundPayment(paymentId: string): Promise<Payment>;
    getPaymentStatistics(userId?: string, startDate?: Date, endDate?: Date): Promise<{
        totalAmount: number;
        completedAmount: number;
        pendingAmount: number;
        failedAmount: number;
        refundedAmount: number;
        totalTransactions: number;
        completedTransactions: number;
        pendingTransactions: number;
        failedTransactions: number;
        refundedTransactions: number;
    }>;
    getRecentPayments(limit?: number): Promise<Payment[]>;
    searchPayments(searchTerm: string, userId?: string): Promise<Payment[]>;
    private handlePaymentCompletion;
}
export declare const paymentsService: PaymentsService;
//# sourceMappingURL=payments.service.d.ts.map