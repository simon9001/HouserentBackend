import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class SubscriptionPlansService {
    // Create new subscription plan
    async createPlan(data) {
        // Validate required fields
        if (!data.name || !data.displayName || data.basePrice === undefined) {
            throw new Error('Name, display name, and base price are required');
        }
        // Check if plan name already exists
        const { data: existing, error: checkError } = await supabase
            .from('SubscriptionPlans')
            .select('PlanId')
            .eq('Name', data.name)
            .single();
        if (checkError && checkError.code !== 'PGRST116')
            throw new Error(checkError.message);
        if (existing)
            throw new Error('Subscription plan with this name already exists');
        const { data: newPlan, error } = await supabase
            .from('SubscriptionPlans')
            .insert({
            Name: data.name,
            DisplayName: data.displayName,
            Description: data.description || null,
            BasePrice: data.basePrice,
            Currency: data.currency || 'KES',
            BillingCycle: data.billingCycle || 'MONTHLY',
            TrialDays: data.trialDays || 0,
            MaxProperties: data.maxProperties || 5,
            MaxVisitsPerMonth: data.maxVisitsPerMonth || 10,
            MaxMediaPerProperty: data.maxMediaPerProperty || 10,
            MaxAmenitiesPerProperty: data.maxAmenitiesPerProperty || 15,
            AllowBoost: data.allowBoost || false,
            MaxBoostsPerMonth: data.maxBoostsPerMonth || 0,
            AllowPremiumSupport: data.allowPremiumSupport || false,
            AllowAdvancedAnalytics: data.allowAdvancedAnalytics || false,
            AllowBulkOperations: data.allowBulkOperations || false,
            IsVisible: data.isVisible !== undefined ? data.isVisible : true,
            SortOrder: data.sortOrder || 0,
            HighlightFeatures: data.highlightFeatures || null, // Supabase handles array/json
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
            IsActive: true // Default active on create? interface says boolean.
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return newPlan;
    }
    // Get plan by ID
    async getPlanById(planId) {
        if (!ValidationUtils.isValidUUID(planId))
            throw new Error('Invalid plan ID format');
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('PlanId', planId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return data;
    }
    // Get plan by name
    async getPlanByName(name) {
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('Name', name)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return data;
    }
    // Get all plans (with optional filters)
    async getAllPlans(isActive, isVisible) {
        let query = supabase
            .from('SubscriptionPlans')
            .select('*')
            .order('SortOrder', { ascending: true })
            .order('DisplayName', { ascending: true });
        if (isActive !== undefined) {
            query = query.eq('IsActive', isActive);
        }
        if (isVisible !== undefined) {
            query = query.eq('IsVisible', isVisible);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Update plan
    async updatePlan(planId, data) {
        if (!ValidationUtils.isValidUUID(planId))
            throw new Error('Invalid plan ID format');
        const updates = {};
        if (data.displayName !== undefined)
            updates.DisplayName = data.displayName;
        if (data.description !== undefined)
            updates.Description = data.description;
        if (data.basePrice !== undefined)
            updates.BasePrice = data.basePrice;
        if (data.isActive !== undefined)
            updates.IsActive = data.isActive;
        if (data.isVisible !== undefined)
            updates.IsVisible = data.isVisible;
        if (data.sortOrder !== undefined)
            updates.SortOrder = data.sortOrder;
        if (data.highlightFeatures !== undefined)
            updates.HighlightFeatures = data.highlightFeatures;
        if (Object.keys(updates).length === 0)
            throw new Error('No fields to update');
        updates.UpdatedAt = new Date().toISOString();
        const { data: updated, error } = await supabase
            .from('SubscriptionPlans')
            .update(updates)
            .eq('PlanId', planId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return updated;
    }
    // Delete plan (soft delete)
    async deletePlan(planId) {
        if (!ValidationUtils.isValidUUID(planId))
            throw new Error('Invalid plan ID format');
        // Check active subscriptions
        const { count, error: countError } = await supabase
            .from('UserSubscriptions')
            .select('SubscriptionId', { count: 'exact', head: true })
            .eq('PlanId', planId)
            .in('Status', ['TRIAL', 'ACTIVE']);
        if (countError)
            throw new Error(countError.message);
        if ((count || 0) > 0) {
            throw new Error('Cannot delete plan with active subscriptions');
        }
        // Soft delete
        const { error, count: updatedCount } = await supabase
            .from('SubscriptionPlans')
            .update({ IsActive: false, IsVisible: false })
            .eq('PlanId', planId)
            .select('PlanId', { count: 'exact' });
        if (error)
            throw new Error(error.message);
        return (updatedCount || 0) > 0;
    }
    // Compare plans
    async comparePlans(planIds) {
        // Validation
        planIds.forEach(id => {
            if (!ValidationUtils.isValidUUID(id))
                throw new Error(`Invalid plan ID format: ${id}`);
        });
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .in('PlanId', planIds)
            .eq('IsActive', true)
            .order('SortOrder', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get default (free) plan
    async getFreePlan() {
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('Name', 'FREE')
            .eq('IsActive', true)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return data;
    }
    // Get featured/premium plans (for upsell)
    async getFeaturedPlans(limit = 3) {
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('IsActive', true)
            .eq('IsVisible', true)
            .neq('Name', 'FREE')
            .order('SortOrder', { ascending: true })
            .order('BasePrice', { ascending: true })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return data;
    }
}
export const subscriptionPlansService = new SubscriptionPlansService();
//# sourceMappingURL=subscriptionPlans.service.js.map