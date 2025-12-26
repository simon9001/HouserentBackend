import { Context } from 'hono';
export declare const createSubscriptionPlan: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PlanId: string;
        Name: string;
        DisplayName: string;
        Description?: string | undefined;
        BasePrice: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        TrialDays: number;
        MaxProperties: number;
        MaxVisitsPerMonth: number;
        MaxMediaPerProperty: number;
        MaxAmenitiesPerProperty: number;
        AllowBoost: boolean;
        MaxBoostsPerMonth: number;
        AllowPremiumSupport: boolean;
        AllowAdvancedAnalytics: boolean;
        AllowBulkOperations: boolean;
        IsActive: boolean;
        IsVisible: boolean;
        SortOrder: number;
        HighlightFeatures?: string[] | undefined;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getSubscriptionPlanById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PlanId: string;
        Name: string;
        DisplayName: string;
        Description?: string | undefined;
        BasePrice: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        TrialDays: number;
        MaxProperties: number;
        MaxVisitsPerMonth: number;
        MaxMediaPerProperty: number;
        MaxAmenitiesPerProperty: number;
        AllowBoost: boolean;
        MaxBoostsPerMonth: number;
        AllowPremiumSupport: boolean;
        AllowAdvancedAnalytics: boolean;
        AllowBulkOperations: boolean;
        IsActive: boolean;
        IsVisible: boolean;
        SortOrder: number;
        HighlightFeatures?: string[] | undefined;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAllSubscriptionPlans: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PlanId: string;
        Name: string;
        DisplayName: string;
        Description?: string | undefined;
        BasePrice: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        TrialDays: number;
        MaxProperties: number;
        MaxVisitsPerMonth: number;
        MaxMediaPerProperty: number;
        MaxAmenitiesPerProperty: number;
        AllowBoost: boolean;
        MaxBoostsPerMonth: number;
        AllowPremiumSupport: boolean;
        AllowAdvancedAnalytics: boolean;
        AllowBulkOperations: boolean;
        IsActive: boolean;
        IsVisible: boolean;
        SortOrder: number;
        HighlightFeatures?: string[] | undefined;
        CreatedAt: string;
        UpdatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateSubscriptionPlan: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PlanId: string;
        Name: string;
        DisplayName: string;
        Description?: string | undefined;
        BasePrice: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        TrialDays: number;
        MaxProperties: number;
        MaxVisitsPerMonth: number;
        MaxMediaPerProperty: number;
        MaxAmenitiesPerProperty: number;
        AllowBoost: boolean;
        MaxBoostsPerMonth: number;
        AllowPremiumSupport: boolean;
        AllowAdvancedAnalytics: boolean;
        AllowBulkOperations: boolean;
        IsActive: boolean;
        IsVisible: boolean;
        SortOrder: number;
        HighlightFeatures?: string[] | undefined;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const deleteSubscriptionPlan: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const compareSubscriptionPlans: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PlanId: string;
        Name: string;
        DisplayName: string;
        Description?: string | undefined;
        BasePrice: number;
        Currency: string;
        BillingCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
        TrialDays: number;
        MaxProperties: number;
        MaxVisitsPerMonth: number;
        MaxMediaPerProperty: number;
        MaxAmenitiesPerProperty: number;
        AllowBoost: boolean;
        MaxBoostsPerMonth: number;
        AllowPremiumSupport: boolean;
        AllowAdvancedAnalytics: boolean;
        AllowBulkOperations: boolean;
        IsActive: boolean;
        IsVisible: boolean;
        SortOrder: number;
        HighlightFeatures?: string[] | undefined;
        CreatedAt: string;
        UpdatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=subscriptionPlans.controller.d.ts.map