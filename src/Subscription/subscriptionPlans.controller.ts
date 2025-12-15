import { Context } from 'hono';
import { subscriptionPlansService, CreatePlanInput, UpdatePlanInput } from './subscriptionPlans.service.js';
import { ValidationUtils } from '../utils/validators.js';

// Create new subscription plan (admin only)
export const createSubscriptionPlan = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.name || !body.displayName || body.basePrice === undefined) {
            return c.json({
                success: false,
                error: 'Name, display name, and base price are required'
            }, 400);
        }

        if (body.basePrice < 0) {
            return c.json({
                success: false,
                error: 'Base price cannot be negative'
            }, 400);
        }

        const planData: CreatePlanInput = {
            name: body.name,
            displayName: body.displayName,
            description: body.description,
            basePrice: parseFloat(body.basePrice),
            currency: body.currency,
            billingCycle: body.billingCycle,
            trialDays: body.trialDays,
            maxProperties: body.maxProperties,
            maxVisitsPerMonth: body.maxVisitsPerMonth,
            maxMediaPerProperty: body.maxMediaPerProperty,
            maxAmenitiesPerProperty: body.maxAmenitiesPerProperty,
            allowBoost: body.allowBoost,
            maxBoostsPerMonth: body.maxBoostsPerMonth,
            allowPremiumSupport: body.allowPremiumSupport,
            allowAdvancedAnalytics: body.allowAdvancedAnalytics,
            allowBulkOperations: body.allowBulkOperations,
            isVisible: body.isVisible,
            sortOrder: body.sortOrder,
            highlightFeatures: body.highlightFeatures
        };

        const plan = await subscriptionPlansService.createPlan(planData);

        return c.json({
            success: true,
            message: 'Subscription plan created successfully',
            data: plan
        }, 201);
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to create subscription plan'
        }, 400);
    }
};

// Get plan by ID
export const getSubscriptionPlanById = async (c: Context) => {
    try {
        const planId = c.req.param('planId');

        if (!ValidationUtils.isValidUUID(planId)) {
            return c.json({
                success: false,
                error: 'Invalid plan ID format'
            }, 400);
        }

        const plan = await subscriptionPlansService.getPlanById(planId);

        if (!plan) {
            return c.json({
                success: false,
                error: 'Subscription plan not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: plan
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch subscription plan'
        }, 400);
    }
};

// Get all plans
export const getAllSubscriptionPlans = async (c: Context) => {
    try {
        const isActive = c.req.query('isActive') === 'true' ? true : 
                        c.req.query('isActive') === 'false' ? false : undefined;
        const isVisible = c.req.query('isVisible') === 'true' ? true : 
                         c.req.query('isVisible') === 'false' ? false : undefined;

        const plans = await subscriptionPlansService.getAllPlans(isActive, isVisible);

        return c.json({
            success: true,
            data: plans
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch subscription plans'
        }, 400);
    }
};

// Update plan (admin only)
export const updateSubscriptionPlan = async (c: Context) => {
    try {
        const planId = c.req.param('planId');
        const body = await c.req.json();

        if (!ValidationUtils.isValidUUID(planId)) {
            return c.json({
                success: false,
                error: 'Invalid plan ID format'
            }, 400);
        }

        if (body.basePrice !== undefined && body.basePrice < 0) {
            return c.json({
                success: false,
                error: 'Base price cannot be negative'
            }, 400);
        }

        const updateData: UpdatePlanInput = {};
        if (body.displayName !== undefined) updateData.displayName = body.displayName;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.basePrice !== undefined) updateData.basePrice = parseFloat(body.basePrice);
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;
        if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
        if (body.highlightFeatures !== undefined) updateData.highlightFeatures = body.highlightFeatures;

        if (Object.keys(updateData).length === 0) {
            return c.json({
                success: false,
                error: 'No fields to update'
            }, 400);
        }

        const updatedPlan = await subscriptionPlansService.updatePlan(planId, updateData);

        return c.json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: updatedPlan
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to update subscription plan'
        }, 400);
    }
};

// Delete plan (admin only)
export const deleteSubscriptionPlan = async (c: Context) => {
    try {
        const planId = c.req.param('planId');

        if (!ValidationUtils.isValidUUID(planId)) {
            return c.json({
                success: false,
                error: 'Invalid plan ID format'
            }, 400);
        }

        const deleted = await subscriptionPlansService.deletePlan(planId);

        if (!deleted) {
            return c.json({
                success: false,
                error: 'Failed to delete subscription plan'
            }, 400);
        }

        return c.json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to delete subscription plan'
        }, 400);
    }
};

// Compare plans
export const compareSubscriptionPlans = async (c: Context) => {
    try {
        const planIds = c.req.query('planIds');
        
        if (!planIds) {
            return c.json({
                success: false,
                error: 'Plan IDs are required'
            }, 400);
        }

        const planIdArray = planIds.split(',').map((id: string) => id.trim());
        
        if (planIdArray.length < 2) {
            return c.json({
                success: false,
                error: 'At least two plan IDs are required for comparison'
            }, 400);
        }

        const plans = await subscriptionPlansService.comparePlans(planIdArray);

        return c.json({
            success: true,
            data: plans
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to compare subscription plans'
        }, 400);
    }
};