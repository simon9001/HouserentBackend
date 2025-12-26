export interface UserSubscription {
    SubscriptionId: string;
    UserId: string;
    PlanId: string;
    PaymentId?: string;
    Price: number;
    Currency: string;
    BillingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    StartDate: Date;
    EndDate: Date;
    TrialEndDate?: Date;
    CancelAtPeriodEnd: boolean;
    CancelledDate?: Date;
    Status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'SUSPENDED';
    AutoRenew: boolean;
    RenewalAttempts: number;
    LastRenewalAttempt?: Date;
    PropertiesUsed: number;
    VisitsUsedThisMonth: number;
    MediaUsedThisMonth: number;
    AmenitiesUsedThisMonth: number;
    BoostsUsedThisMonth: number;
    LastUsageReset: Date;
    NextUsageReset: Date;
    CreatedAt: Date;
    UpdatedAt: Date;
}
export interface UserSubscriptionWithPlan extends UserSubscription {
    PlanName?: string;
    DisplayName?: string;
    MaxProperties?: number;
    MaxVisitsPerMonth?: number;
    MaxMediaPerProperty?: number;
    MaxAmenitiesPerProperty?: number;
    AllowBoost?: boolean;
    MaxBoostsPerMonth?: number;
    AllowPremiumSupport?: boolean;
    AllowAdvancedAnalytics?: boolean;
    AllowBulkOperations?: boolean;
}
export interface CreateSubscriptionInput {
    userId: string;
    planId: string;
    paymentId?: string;
    price?: number;
    currency?: string;
    billingCycle?: UserSubscription['BillingCycle'];
    startDate?: Date;
    trialDays?: number;
    autoRenew?: boolean;
}
export interface UpdateSubscriptionInput {
    status?: UserSubscription['Status'];
    autoRenew?: boolean;
    cancelAtPeriodEnd?: boolean;
    paymentId?: string;
}
export interface UsageCheckResult {
    hasAccess: boolean;
    isGated: boolean;
    gateType?: 'SOFT' | 'HARD' | 'UPSELL';
    currentUsage: number;
    maxLimit: number;
    remaining: number;
    subscriptionId?: string;
    planId?: string;
}
export declare class UserSubscriptionsService {
    private db;
    constructor();
    private getDb;
    createSubscription(data: CreateSubscriptionInput): Promise<UserSubscription>;
    getSubscriptionById(subscriptionId: string): Promise<UserSubscriptionWithPlan | null>;
    getActiveSubscription(userId: string): Promise<UserSubscriptionWithPlan | null>;
    getUserSubscriptions(userId: string, includeExpired?: boolean): Promise<UserSubscription[]>;
    updateSubscription(subscriptionId: string, data: UpdateSubscriptionInput): Promise<UserSubscription>;
    cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<UserSubscription>;
    renewSubscription(subscriptionId: string, paymentId?: string): Promise<UserSubscription>;
    checkUsageLimit(userId: string, feature: string, requiredCount?: number): Promise<UsageCheckResult>;
    private checkFreePlanUsage;
    private getFreePlanUsage;
    private getFeatureLimit;
    private getFeatureUsage;
    private checkFeatureAccess;
    private checkFeatureAccessFallback;
    private getFeatureLimitFallback;
    recordUsage(userId: string, feature: string, resourceId?: string, action?: string, count?: number, override?: boolean, overrideReason?: string, ipAddress?: string, userAgent?: string, metadata?: any): Promise<void>;
    private updateSubscriptionUsage;
    getUsageStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<{
        totalUsage: number;
        byFeature: Record<string, number>;
        byDay: Record<string, number>;
        gatedActions: number;
    }>;
    resetMonthlyUsage(): Promise<number>;
    getExpiringSubscriptions(days?: number): Promise<UserSubscriptionWithPlan[]>;
    getTrialEndingSubscriptions(days?: number): Promise<UserSubscriptionWithPlan[]>;
    private createSubscriptionEvent;
    getSubscriptionSummary(userId: string): Promise<{
        subscription: UserSubscriptionWithPlan | null;
        usage: {
            properties: {
                used: number;
                limit: number;
                remaining: number;
            };
            visits: {
                used: number;
                limit: number;
                remaining: number;
            };
            boosts: {
                used: number;
                limit: number;
                remaining: number;
            };
            media: {
                used: number;
                limit: number;
                remaining: number;
            };
            amenities: {
                used: number;
                limit: number;
                remaining: number;
            };
        };
        features: {
            allowBoost: boolean;
            allowPremiumSupport: boolean;
            allowAdvancedAnalytics: boolean;
            allowBulkOperations: boolean;
        };
        nextReset: Date;
    }>;
}
export declare const userSubscriptionsService: UserSubscriptionsService;
//# sourceMappingURL=userSubscriptions.service.d.ts.map