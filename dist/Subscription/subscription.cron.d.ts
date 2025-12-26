export declare class SubscriptionCronJobs {
    static resetMonthlyUsage(): Promise<void>;
    static checkExpiringSubscriptions(days?: number): Promise<number>;
    static checkTrialEndingSubscriptions(days?: number): Promise<number>;
    static processRenewals(): Promise<{
        total: number;
        renewed: number;
        failed: number;
    }>;
    static cleanupOldData(): Promise<number>;
    static checkOverduePayments(): Promise<number>;
    static syncSubscriptionStatuses(): Promise<number>;
    static generateMonthlyReports(): Promise<any>;
    private static getSubscriptionsDueForRenewal;
    private static processRenewal;
    private static handleNonRenewingSubscription;
    private static createExpiryEvent;
    private static createTrialEndingEvent;
    private static sendRenewalNotice;
    private static sendTrialEndingNotice;
    private static performDataCleanup;
    private static getOverdueSubscriptions;
    private static handleOverduePayment;
    private static updateSubscriptionStatuses;
    private static generateReports;
    private static sendReports;
}
export declare function runAllCronJobs(): Promise<{
    monthlyReset: void;
    expiring: number;
    trialEnding: number;
    renewals: {
        total: number;
        renewed: number;
        failed: number;
    };
    overduePayments: number;
    statusSync: number;
    cleanup: number;
}>;
//# sourceMappingURL=subscription.cron.d.ts.map