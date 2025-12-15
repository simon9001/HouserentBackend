import { Context, Next } from 'hono';
import { userSubscriptionsService } from '../Subscription/userSubscriptions.service.js';

export interface SubscriptionGateOptions {
    feature: string;
    requiredCount?: number;
    gateType?: 'SOFT' | 'HARD';
    upsellPlanId?: string;
}

export const subscriptionGate = (options: SubscriptionGateOptions) => {
    return async (c: Context, next: Next) => {
        try {
            const userId = c.get('userId');
            if (!userId) {
                return c.json({
                    success: false,
                    error: 'Authentication required'
                }, 401);
            }

            // Check usage limit
            const result = await userSubscriptionsService.checkUsageLimit(
                userId,
                options.feature,
                options.requiredCount || 1
            );

            // Handle hard gate (deny access)
            if (options.gateType === 'HARD' && result.isGated) {
                return c.json({
                    success: false,
                    error: 'Usage limit reached. Please upgrade your plan.',
                    data: {
                        gateType: result.gateType,
                        currentUsage: result.currentUsage,
                        maxLimit: result.maxLimit,
                        remaining: result.remaining,
                        feature: options.feature,
                        upsellPlanId: options.upsellPlanId
                    }
                }, 403);
            }

            // Handle soft gate (allow but add context)
            if (result.isGated) {
                c.set('subscriptionGate', {
                    isGated: true,
                    gateType: result.gateType,
                    currentUsage: result.currentUsage,
                    maxLimit: result.maxLimit,
                    remaining: result.remaining,
                    feature: options.feature,
                    upsellPlanId: options.upsellPlanId
                });
            }

            await next();
        } catch (error: any) {
            return c.json({
                success: false,
                error: error.message || 'Failed to check subscription limits'
            }, 500);
        }
    };
};

export const requireSubscription = (feature: string) => {
    return async (c: Context, next: Next) => {
        try {
            const userId = c.get('userId');
            if (!userId) {
                return c.json({
                    success: false,
                    error: 'Authentication required'
                }, 401);
            }

            const subscription = await userSubscriptionsService.getActiveSubscription(userId);
            
            if (!subscription) {
                return c.json({
                    success: false,
                    error: 'Active subscription required for this feature',
                    data: {
                        feature: feature,
                        requiredPlan: 'PREMIUM' // You can customize this
                    }
                }, 403);
            }

            // Check specific feature access based on plan
            // This is a simplified example - extend based on your feature matrix
            if (feature === 'BOOST_PROPERTY' && !subscription.AllowBoost) {
                return c.json({
                    success: false,
                    error: 'This feature requires a premium plan',
                    data: {
                        feature: feature,
                        requiredPlan: 'PREMIUM'
                    }
                }, 403);
            }

            await next();
        } catch (error: any) {
            return c.json({
                success: false,
                error: error.message || 'Failed to check subscription'
            }, 500);
        }
    };
};