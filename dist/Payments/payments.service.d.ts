export interface Payment {
    payment_id: string;
    user_id: string;
    property_id?: string | null;
    amount: number;
    currency: string;
    payment_provider: string;
    provider_reference: string;
    purpose: 'ACCESS' | 'BOOST' | 'SUBSCRIPTION' | 'BOOKING' | 'DEPOSIT';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    created_at: string;
    completed_at?: string | null;
    user_name?: string;
    property_title?: string;
}
export interface CreatePaymentInput {
    userId: string;
    propertyId?: string;
    amount: number;
    currency?: string;
    paymentProvider: string;
    providerReference: string;
    purpose: Payment['purpose'];
}
export interface UpdatePaymentInput {
    status?: Payment['status'];
    providerReference?: string;
    completedAt?: Date;
}
export declare class PaymentsService {
    createPayment(data: CreatePaymentInput): Promise<Payment>;
    getPaymentById(paymentId: string): Promise<(Payment & {
        user_name?: string;
        property_title?: string;
    }) | null>;
    getPaymentsByUserId(userId: string, status?: string): Promise<Payment[]>;
    getPaymentsByPropertyId(propertyId: string): Promise<Payment[]>;
    updatePayment(paymentId: string, data: UpdatePaymentInput): Promise<Payment>;
    completePayment(paymentId: string): Promise<Payment>;
    failPayment(paymentId: string, _reason?: string): Promise<Payment>;
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
    getPaymentsByPurpose(purpose: Payment['purpose'], status?: Payment['status']): Promise<Payment[]>;
    getTotalRevenue(): Promise<number>;
    private handlePaymentCompletion;
    getMonthlyRevenueReport(year: number, month: number): Promise<{
        month: string;
        totalRevenue: number;
        transactions: number;
        dailyBreakdown: Array<{
            day: number;
            revenue: number;
            transactions: number;
        }>;
    }>;
}
export declare const paymentsService: PaymentsService;
//# sourceMappingURL=payments.service.d.ts.map