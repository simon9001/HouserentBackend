import { Context, Next } from 'hono';
export interface SubscriptionGateOptions {
    feature: string;
    requiredCount?: number;
    gateType?: 'SOFT' | 'HARD';
    upsellPlanId?: string;
}
export declare const subscriptionGate: (options: SubscriptionGateOptions) => (c: Context, next: Next) => Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
    data: {
        gateType: "SOFT" | "HARD" | "UPSELL" | undefined;
        currentUsage: number;
        maxLimit: number;
        remaining: number;
        feature: string;
        upsellPlanId: string | undefined;
    };
}, 403, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const requireSubscription: (feature: string) => (c: Context, next: Next) => Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
    data: {
        feature: string;
        requiredPlan: string;
    };
}, 403, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
//# sourceMappingURL=subscription.middleware.d.ts.map