export interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    activeVisits: number;
    totalRevenue: number;
    pendingVerifications: number;
    availableProperties: number;
    verifiedProperties: number;
    totalReviews: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
}
export interface RecentActivity {
    activityId: string;
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
    username?: string;
}
export interface UserAnalytics {
    date: string;
    registrations: number;
}
export interface PropertyAnalytics {
    date: string;
    listings: number;
    verified: number;
}
export interface RevenueAnalytics {
    date: string;
    revenue: number;
    payments: number;
}
export interface RoleSummary {
    role: string;
    count: number;
}
export interface AgentStatusSummary {
    status: string;
    count: number;
}
export interface PopularLocation {
    county: string;
    area: string;
    propertyCount: number;
    avgRent: number;
}
export interface VerificationAnalytics {
    status: string;
    count: number;
    avgProcessingTime: number;
}
export interface SubscriptionAnalytics {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    monthlyRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    trialConversionRate: number;
}
export interface PlanDistribution {
    planName: string;
    count: number;
    percentage: number;
    revenue: number;
    avgRevenuePerUser: number;
}
export interface SubscriptionGrowth {
    date: string;
    newSubscriptions: number;
    cancelledSubscriptions: number;
    activeSubscriptions: number;
    netGrowth: number;
}
export interface UsageAnalytics {
    planName: string;
    avgPropertiesUsed: number;
    avgVisitsUsed: number;
    avgBoostsUsed: number;
    maxProperties: number;
    maxVisitsPerMonth: number;
    maxBoostsPerMonth: number;
    usagePercentage: number;
}
export interface ChurnAnalytics {
    date: string;
    newSubscribers: number;
    churnedSubscribers: number;
    churnRate: number;
    retentionRate: number;
}
export interface RevenueBreakdown {
    planName: string;
    revenue: number;
    subscribers: number;
    avgRevenuePerSubscriber: number;
    percentage: number;
}
export interface ActiveSubscription {
    subscriptionId: string;
    userId: string;
    userName: string;
    userEmail: string;
    planId: string;
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    trialEndDate: string | null;
    autoRenew: boolean;
    price: number;
    propertiesUsed: number;
    visitsUsed: number;
    boostsUsed: number;
    maxProperties: number;
    maxVisits: number;
    maxBoosts: number;
    daysRemaining: number;
    daysUntilTrialEnd: number | null;
    createdAt: string;
    updatedAt: string;
}
export interface SubscriptionPlan {
    planId: string;
    name: string;
    displayName: string;
    description: string;
    basePrice: number;
    currency: string;
    billingCycle: string;
    trialDays: number;
    maxProperties: number;
    maxVisitsPerMonth: number;
    maxMediaPerProperty: number;
    maxAmenitiesPerProperty: number;
    allowBoost: boolean;
    maxBoostsPerMonth: number;
    allowPremiumSupport: boolean;
    allowAdvancedAnalytics: boolean;
    allowBulkOperations: boolean;
    activeSubscribers: number;
    totalRevenue: number;
    avgRating: number;
    isActive: boolean;
    isVisible: boolean;
    sortOrder: number;
    highlightFeatures: string[];
    createdAt: string;
    updatedAt: string;
}
export interface SubscriptionInvoice {
    invoiceId: string;
    subscriptionId: string;
    userId: string;
    userName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    periodStart: string;
    periodEnd: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    paidAmount: number;
    paidDate: string | null;
    paymentId: string | null;
    lineItems: any[];
    pdfUrl: string | null;
    htmlUrl: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface SubscriptionEvent {
    eventId: string;
    eventType: string;
    subscriptionId: string | null;
    userId: string;
    userName: string;
    eventData: any;
    processed: boolean;
    processedAt: string | null;
    errorMessage: string | null;
    retryCount: number;
    scheduledFor: string;
    createdAt: string;
}
export interface UsageLog {
    logId: string;
    subscriptionId: string;
    userId: string;
    userName: string;
    feature: string;
    resourceId: string | null;
    action: string;
    usageCount: number;
    usageDate: string;
    wasGated: boolean;
    gateType: string | null;
    overrideReason: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: any;
    createdAt: string;
}
export interface SubscriptionStats {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    newSubscriptionsToday: number;
    cancellationsToday: number;
    monthlyRevenue: number;
    lifetimeRevenue: number;
    churnRate: number;
    trialConversionRate: number;
    avgRevenuePerUser: number;
    mostPopularPlan: string;
    usageRate: number;
    failedPaymentsToday: number;
}
export interface SubscriptionUserDetails {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    currentSubscription: ActiveSubscription | null;
    subscriptionHistory: ActiveSubscription[];
    paymentHistory: PaymentHistory[];
    usageSummary: {
        totalPropertiesCreated: number;
        totalVisitsScheduled: number;
        totalBoostsUsed: number;
        currentMonthUsage: {
            properties: number;
            visits: number;
            boosts: number;
            media: number;
            amenities: number;
        };
    };
    featureGates: Array<{
        feature: string;
        gateType: string;
        triggerLimit: number;
        triggerCount: number;
        isActive: boolean;
    }>;
    nextBillingDate: string | null;
    totalSpent: number;
    joinedDate: string;
}
export interface PaymentHistory {
    paymentId: string;
    amount: number;
    currency: string;
    paymentProvider: string;
    purpose: string;
    status: string;
    invoiceId: string | null;
    invoiceNumber: string | null;
    createdAt: string;
    completedAt: string | null;
}
export declare const getDashboardStatsService: () => Promise<DashboardStats>;
export declare const getRecentActivitiesService: (limit?: number) => Promise<RecentActivity[]>;
export declare const getUserRegistrationAnalyticsService: (days?: number) => Promise<UserAnalytics[]>;
export declare const getPropertyAnalyticsService: (days?: number) => Promise<PropertyAnalytics[]>;
export declare const getRevenueAnalyticsService: (days?: number) => Promise<RevenueAnalytics[]>;
export declare const getUserRoleSummaryService: () => Promise<RoleSummary[]>;
export declare const getAgentStatusSummaryService: () => Promise<AgentStatusSummary[]>;
export declare const getPopularLocationsService: (limit?: number) => Promise<PopularLocation[]>;
export declare const getVerificationAnalyticsService: () => Promise<VerificationAnalytics[]>;
export declare const getSubscriptionAnalyticsService: () => Promise<SubscriptionAnalytics>;
export declare const getPlanDistributionService: () => Promise<PlanDistribution[]>;
export declare const getSubscriptionGrowthService: (days?: number) => Promise<SubscriptionGrowth[]>;
export declare const getUsageAnalyticsService: () => Promise<UsageAnalytics[]>;
export declare const getChurnAnalyticsService: (_days?: number) => Promise<ChurnAnalytics[]>;
export declare const getRevenueBreakdownService: () => Promise<RevenueBreakdown[]>;
export declare const getActiveSubscriptionsService: (page?: number, limit?: number, status?: string, planId?: string) => Promise<{
    subscriptions: ActiveSubscription[];
    total: number;
}>;
export declare const getSubscriptionPaymentHistoryService: (_subscriptionId?: string, _userId?: string, _limit?: number) => Promise<PaymentHistory[]>;
export declare const updateSubscriptionPlanService: (subscriptionId: string, planId: string, newEndDate?: Date, priceOverride?: number, notes?: string) => Promise<any>;
export declare const cancelSubscriptionService: (subscriptionId: string, cancelImmediately?: boolean, refundAmount?: number, reason?: string) => Promise<any>;
export declare const getSubscriptionInvoicesService: (..._args: any[]) => Promise<{
    invoices: never[];
    total: number;
}>;
export declare const getExpiringTrialsService: (..._args: any[]) => Promise<never[]>;
export declare const getExpiringSubscriptionsService: (..._args: any[]) => Promise<never[]>;
export declare const getSubscriptionPlansService: (..._args: any[]) => Promise<never[]>;
export declare const getSubscriptionEventsService: (..._args: any[]) => Promise<{
    events: never[];
    total: number;
}>;
export declare const getSubscriptionUsageLogsService: (..._args: any[]) => Promise<{
    logs: never[];
    total: number;
}>;
export declare const reactivateSubscriptionService: (..._args: any[]) => Promise<{}>;
export declare const overrideSubscriptionLimitsService: (..._args: any[]) => Promise<{}>;
export declare const generateInvoiceService: (..._args: any[]) => Promise<{}>;
export declare const sendSubscriptionNotificationService: (..._args: any[]) => Promise<{}>;
export declare const getSubscriptionStatsService: (..._args: any[]) => Promise<SubscriptionStats>;
export declare const getSubscriptionUserDetailsService: (..._args: any[]) => Promise<SubscriptionUserDetails>;
//# sourceMappingURL=adminService.d.ts.map