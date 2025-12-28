import { Context } from 'hono';
import { 
    userSubscriptionsService, 
    CreateSubscriptionInput, 
    UpdateSubscriptionInput} from './userSubscriptions.service.js';
import { ValidationUtils } from '../utils/validators.js';

// Create new subscription
export const createUserSubscription = async (c: Context) => {
    try {
        const body = await c.req.json();
        const userId = c.get('userId'); // From auth middleware

        // Validate required fields
        if (!body.planId) {
            return c.json({
                success: false,
                error: 'Plan ID is required'
            }, 400);
        }

        // Validate UUID
        if (!ValidationUtils.isValidUUID(body.planId)) {
            return c.json({
                success: false,
                error: 'Invalid plan ID format'
            }, 400);
        }

        if (body.paymentId && !ValidationUtils.isValidUUID(body.paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }

        const subscriptionData: CreateSubscriptionInput = {
            userId: userId,
            planId: body.planId,
            paymentId: body.paymentId,
            price: body.price,
            currency: body.currency,
            billingCycle: body.billingCycle,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            trialDays: body.trialDays,
            autoRenew: body.autoRenew
        };

        const subscription = await userSubscriptionsService.createSubscription(subscriptionData);

        return c.json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        }, 201);
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to create subscription'
        }, 400);
    }
};

// Get subscription by ID
export const getUserSubscriptionById = async (c: Context) => {
    try {
        const subscriptionId = c.req.param('subscriptionId');

        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            return c.json({
                success: false,
                error: 'Invalid subscription ID format'
            }, 400);
        }

        const subscription = await userSubscriptionsService.getSubscriptionById(subscriptionId);

        if (!subscription) {
            return c.json({
                success: false,
                error: 'Subscription not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: subscription
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch subscription'
        }, 400);
    }
};

// Get active subscription for current user
export const getMyActiveSubscription = async (c: Context) => {
    try {
        const userId = c.get('userId'); // From auth middleware

        const subscription = await userSubscriptionsService.getActiveSubscription(userId);

        return c.json({
            success: true,
            data: subscription
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch active subscription'
        }, 400);
    }
};

// Get all subscriptions for current user
export const getMySubscriptions = async (c: Context) => {
    try {
        const userId = c.get('userId'); // From auth middleware
        const includeExpired = c.req.query('includeExpired') === 'true';

        const subscriptions = await userSubscriptionsService.getUserSubscriptions(userId, includeExpired);

        return c.json({
            success: true,
            data: subscriptions
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch subscriptions'
        }, 400);
    }
};

// Update subscription
export const updateUserSubscription = async (c: Context) => {
    try {
        const subscriptionId = c.req.param('subscriptionId');
        const body = await c.req.json();
        const userId = c.get('userId'); // From auth middleware

        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            return c.json({
                success: false,
                error: 'Invalid subscription ID format'
            }, 400);
        }

        // Verify user owns this subscription
        const subscription = await userSubscriptionsService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.UserId !== userId) {
            return c.json({
                success: false,
                error: 'Subscription not found or access denied'
            }, 404);
        }

        const updateData: UpdateSubscriptionInput = {};
        if (body.status !== undefined) updateData.status = body.status;
        if (body.autoRenew !== undefined) updateData.autoRenew = body.autoRenew;
        if (body.cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = body.cancelAtPeriodEnd;
        if (body.paymentId !== undefined) updateData.paymentId = body.paymentId;

        if (Object.keys(updateData).length === 0) {
            return c.json({
                success: false,
                error: 'No fields to update'
            }, 400);
        }

        const updatedSubscription = await userSubscriptionsService.updateSubscription(subscriptionId, updateData);

        return c.json({
            success: true,
            message: 'Subscription updated successfully',
            data: updatedSubscription
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to update subscription'
        }, 400);
    }
};

// Cancel subscription
export const cancelUserSubscription = async (c: Context) => {
    try {
        const subscriptionId = c.req.param('subscriptionId');
        const body = await c.req.json();
        const userId = c.get('userId'); // From auth middleware

        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            return c.json({
                success: false,
                error: 'Invalid subscription ID format'
            }, 400);
        }

        // Verify user owns this subscription
        const subscription = await userSubscriptionsService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.UserId !== userId) {
            return c.json({
                success: false,
                error: 'Subscription not found or access denied'
            }, 404);
        }

        const cancelAtPeriodEnd = body.cancelAtPeriodEnd === true;
        const cancelledSubscription = await userSubscriptionsService.cancelSubscription(
            subscriptionId, 
            cancelAtPeriodEnd
        );

        const message = cancelAtPeriodEnd 
            ? 'Subscription will be cancelled at the end of the billing period'
            : 'Subscription cancelled successfully';

        return c.json({
            success: true,
            message: message,
            data: cancelledSubscription
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to cancel subscription'
        }, 400);
    }
};

// Renew subscription
export const renewUserSubscription = async (c: Context) => {
    try {
        const subscriptionId = c.req.param('subscriptionId');
        const body = await c.req.json();
        const userId = c.get('userId'); // From auth middleware

        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            return c.json({
                success: false,
                error: 'Invalid subscription ID format'
            }, 400);
        }

        // Verify user owns this subscription
        const subscription = await userSubscriptionsService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.UserId !== userId) {
            return c.json({
                success: false,
                error: 'Subscription not found or access denied'
            }, 404);
        }

        if (body.paymentId && !ValidationUtils.isValidUUID(body.paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }

        const renewedSubscription = await userSubscriptionsService.renewSubscription(
            subscriptionId, 
            body.paymentId
        );

        return c.json({
            success: true,
            message: 'Subscription renewed successfully',
            data: renewedSubscription
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to renew subscription'
        }, 400);
    }
};

// Check usage limit
export const checkUsageLimit = async (c: Context) => {
    try {
        const userId = c.get('userId'); // From auth middleware
        const feature = c.req.query('feature');
        const requiredCount = parseInt(c.req.query('count') || '1');

        if (!feature) {
            return c.json({
                success: false,
                error: 'Feature is required'
            }, 400);
        }

        const validFeatures = [
            'PROPERTY_CREATE', 'VISIT_SCHEDULE', 'MEDIA_UPLOAD', 
            'AMENITY_ADD', 'BOOST_PROPERTY', 'SUPPORT_TICKET',
            'ANALYTICS_ACCESS', 'BULK_OPERATION'
        ];

        if (!validFeatures.includes(feature)) {
            return c.json({
                success: false,
                error: 'Invalid feature'
            }, 400);
        }

        if (isNaN(requiredCount) || requiredCount < 1) {
            return c.json({
                success: false,
                error: 'Count must be a positive integer'
            }, 400);
        }

        const result = await userSubscriptionsService.checkUsageLimit(userId, feature, requiredCount);

        return c.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to check usage limit'
        }, 400);
    }
};

// Record usage
export const recordUsage = async (c: Context) => {
    try {
        const userId = c.get('userId'); // From auth middleware
        const body = await c.req.json();

        // Validate required fields
        if (!body.feature) {
            return c.json({
                success: false,
                error: 'Feature is required'
            }, 400);
        }

        const validFeatures = [
            'PROPERTY_CREATE', 'VISIT_SCHEDULE', 'MEDIA_UPLOAD', 
            'AMENITY_ADD', 'BOOST_PROPERTY', 'SUPPORT_TICKET',
            'ANALYTICS_ACCESS', 'BULK_OPERATION'
        ];

        if (!validFeatures.includes(body.feature)) {
            return c.json({
                success: false,
                error: 'Invalid feature'
            }, 400);
        }

        if (body.resourceId && !ValidationUtils.isValidUUID(body.resourceId)) {
            return c.json({
                success: false,
                error: 'Invalid resource ID format'
            }, 400);
        }

        await userSubscriptionsService.recordUsage(
            userId,
            body.feature,
            body.resourceId,
            body.action || 'CREATE',
            body.count || 1,
            body.override || false,
            body.overrideReason,
            body.ipAddress || c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
            body.userAgent || c.req.header('user-agent'),
            body.metadata
        );

        return c.json({
            success: true,
            message: 'Usage recorded successfully'
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to record usage'
        }, 400);
    }
};

// Get usage statistics
export const getUsageStatistics = async (c: Context) => {
    try {
        const userId = c.get('userId'); // From auth middleware
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')!) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')!) : undefined;

        const stats = await userSubscriptionsService.getUsageStatistics(userId, startDate, endDate);

        return c.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch usage statistics'
        }, 400);
    }
};