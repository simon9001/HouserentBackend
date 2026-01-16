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
    price?: number;
    basePrice: number;
    currency: string;
    description: string;
    features?: string[];
    isActive: boolean;
    billingCycle: string;
    propertiesLimit?: number;
    visitsLimit?: number;
    boostsLimit?: number;
    mediaLimit?: number;
    amenitiesLimit?: number;
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
    page: number;
    totalPages: number;
}>;
export declare const getExpiringTrialsService: (days?: number) => Promise<ActiveSubscription[]>;
export declare const getExpiringSubscriptionsService: (days?: number) => Promise<ActiveSubscription[]>;
export declare const getSubscriptionPlansService: () => Promise<SubscriptionPlan[]>;
export declare const getSubscriptionInvoicesService: (_page: number, _limit: number, _status?: string, _userId?: string) => Promise<{
    invoices: SubscriptionInvoice[];
    total: number;
}>;
export declare const getSubscriptionEventsService: (_page: number, _limit: number, _eventType?: string, _processed?: string) => Promise<{
    events: SubscriptionEvent[];
    total: number;
}>;
export declare const getSubscriptionUsageLogsService: (_page: number, _limit: number, _userId?: string, _feature?: string, _startDate?: Date, _endDate?: Date) => Promise<{
    logs: UsageLog[];
    total: number;
}>;
export declare const updateSubscriptionPlanService: (subscriptionId: string, planId: string, newEndDate?: Date, priceOverride?: number, _notes?: string) => Promise<any>;
export declare const cancelSubscriptionService: (subscriptionId: string, cancelImmediately: boolean, _refundAmount?: number, _reason?: string) => Promise<any>;
export declare const reactivateSubscriptionService: (subscriptionId: string, newPlanId?: string, _startDate?: Date, _price?: number, _notes?: string) => Promise<any>;
export declare const overrideSubscriptionLimitsService: (_subscriptionId: string, _propertiesLimit?: number, _visitsLimit?: number, _boostsLimit?: number, _mediaLimit?: number, _amenitiesLimit?: number, _expiryDate?: Date, _notes?: string) => Promise<any>;
export declare const generateInvoiceService: (_subscriptionId: string, _amount: number, _description?: string, _dueDate?: Date, _items?: any) => Promise<any>;
export declare const sendSubscriptionNotificationService: (_subscriptionId: string, _type: string, _subject?: string, _message?: string, _includeInvoice?: boolean) => Promise<any>;
export declare const getSubscriptionStatsService: () => Promise<SubscriptionStats>;
export declare const getSubscriptionUserDetailsService: (_userId?: string, _subscriptionId?: string) => Promise<SubscriptionUserDetails | null>;
export declare const getSubscriptionPaymentHistoryService: (_subscriptionId?: string, _userId?: string) => Promise<PaymentHistory[]>;
//# sourceMappingURL=adminService.d.ts.map