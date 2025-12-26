import { Context } from 'hono';
export declare const createUserSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getUserSubscriptionById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PlanName?: string | undefined;
        DisplayName?: string | undefined;
        MaxProperties?: number | undefined;
        MaxVisitsPerMonth?: number | undefined;
        MaxMediaPerProperty?: number | undefined;
        MaxAmenitiesPerProperty?: number | undefined;
        AllowBoost?: boolean | undefined;
        MaxBoostsPerMonth?: number | undefined;
        AllowPremiumSupport?: boolean | undefined;
        AllowAdvancedAnalytics?: boolean | undefined;
        AllowBulkOperations?: boolean | undefined;
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getMyActiveSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PlanName?: string | undefined;
        DisplayName?: string | undefined;
        MaxProperties?: number | undefined;
        MaxVisitsPerMonth?: number | undefined;
        MaxMediaPerProperty?: number | undefined;
        MaxAmenitiesPerProperty?: number | undefined;
        AllowBoost?: boolean | undefined;
        MaxBoostsPerMonth?: number | undefined;
        AllowPremiumSupport?: boolean | undefined;
        AllowAdvancedAnalytics?: boolean | undefined;
        AllowBulkOperations?: boolean | undefined;
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    } | null;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getMySubscriptions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateUserSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const cancelUserSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const renewUserSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        SubscriptionId: string;
        UserId: string;
        PlanId: string;
        PaymentId?: string | undefined;
        Price: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        StartDate: string;
        EndDate: string;
        TrialEndDate?: string | undefined;
        CancelAtPeriodEnd: boolean;
        CancelledDate?: string | undefined;
        Status: "TRIAL" | "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "SUSPENDED";
        AutoRenew: boolean;
        RenewalAttempts: number;
        LastRenewalAttempt?: string | undefined;
        PropertiesUsed: number;
        VisitsUsedThisMonth: number;
        MediaUsedThisMonth: number;
        AmenitiesUsedThisMonth: number;
        BoostsUsedThisMonth: number;
        LastUsageReset: string;
        NextUsageReset: string;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const checkUsageLimit: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        hasAccess: boolean;
        isGated: boolean;
        gateType?: "SOFT" | "HARD" | "UPSELL" | undefined;
        currentUsage: number;
        maxLimit: number;
        remaining: number;
        subscriptionId?: string | undefined;
        planId?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const recordUsage: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getUsageStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalUsage: number;
        byFeature: {
            [x: string]: number;
        };
        byDay: {
            [x: string]: number;
        };
        gatedActions: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=userSubscriptions.controller.d.ts.map