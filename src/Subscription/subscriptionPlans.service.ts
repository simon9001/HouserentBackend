import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface SubscriptionPlan {
    PlanId: string;
    Name: string;
    DisplayName: string;
    Description?: string;
    BasePrice: number;
    Currency: string;
    BillingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
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
    HighlightFeatures?: string[];
    CreatedAt: string;
    UpdatedAt: string;
}

export interface CreatePlanInput {
    name: string;
    displayName: string;
    description?: string;
    basePrice: number;
    currency?: string;
    billingCycle?: SubscriptionPlan['BillingCycle'];
    trialDays?: number;
    maxProperties?: number;
    maxVisitsPerMonth?: number;
    maxMediaPerProperty?: number;
    maxAmenitiesPerProperty?: number;
    allowBoost?: boolean;
    maxBoostsPerMonth?: number;
    allowPremiumSupport?: boolean;
    allowAdvancedAnalytics?: boolean;
    allowBulkOperations?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
    highlightFeatures?: string[];
}

export interface UpdatePlanInput {
    displayName?: string;
    description?: string;
    basePrice?: number;
    isActive?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
    highlightFeatures?: string[];
}

export class SubscriptionPlansService {

    // Create new subscription plan
    async createPlan(data: CreatePlanInput): Promise<SubscriptionPlan> {
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

        if (checkError && checkError.code !== 'PGRST116') throw new Error(checkError.message);
        if (existing) throw new Error('Subscription plan with this name already exists');

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

        if (error) throw new Error(error.message);

        return newPlan as SubscriptionPlan;
    }

    // Get plan by ID
    async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
        if (!ValidationUtils.isValidUUID(planId)) throw new Error('Invalid plan ID format');

        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('PlanId', planId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as SubscriptionPlan;
    }

    // Get plan by name
    async getPlanByName(name: string): Promise<SubscriptionPlan | null> {
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('Name', name)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as SubscriptionPlan;
    }

    // Get all plans (with optional filters)
    async getAllPlans(isActive?: boolean, isVisible?: boolean): Promise<SubscriptionPlan[]> {
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
        if (error) throw new Error(error.message);

        return data as SubscriptionPlan[];
    }

    // Update plan
    async updatePlan(planId: string, data: UpdatePlanInput): Promise<SubscriptionPlan> {
        if (!ValidationUtils.isValidUUID(planId)) throw new Error('Invalid plan ID format');

        const updates: any = {};
        if (data.displayName !== undefined) updates.DisplayName = data.displayName;
        if (data.description !== undefined) updates.Description = data.description;
        if (data.basePrice !== undefined) updates.BasePrice = data.basePrice;
        if (data.isActive !== undefined) updates.IsActive = data.isActive;
        if (data.isVisible !== undefined) updates.IsVisible = data.isVisible;
        if (data.sortOrder !== undefined) updates.SortOrder = data.sortOrder;
        if (data.highlightFeatures !== undefined) updates.HighlightFeatures = data.highlightFeatures;

        if (Object.keys(updates).length === 0) throw new Error('No fields to update');

        updates.UpdatedAt = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('SubscriptionPlans')
            .update(updates)
            .eq('PlanId', planId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return updated as SubscriptionPlan;
    }

    // Delete plan (soft delete)
    async deletePlan(planId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(planId)) throw new Error('Invalid plan ID format');

        // Check active subscriptions
        const { count, error: countError } = await supabase
            .from('UserSubscriptions')
            .select('SubscriptionId', { count: 'exact', head: true })
            .eq('PlanId', planId)
            .in('Status', ['TRIAL', 'ACTIVE']);

        if (countError) throw new Error(countError.message);

        if ((count || 0) > 0) {
            throw new Error('Cannot delete plan with active subscriptions');
        }

        // Soft delete
        const { error, count: updatedCount } = await supabase
            .from('SubscriptionPlans')
            .update({ IsActive: false, IsVisible: false })
            .eq('PlanId', planId)
            .select('PlanId', { count: 'exact' });

        if (error) throw new Error(error.message);

        return (updatedCount || 0) > 0;
    }

    // Compare plans
    async comparePlans(planIds: string[]): Promise<SubscriptionPlan[]> {
        // Validation
        planIds.forEach(id => {
            if (!ValidationUtils.isValidUUID(id)) throw new Error(`Invalid plan ID format: ${id}`);
        });

        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .in('PlanId', planIds)
            .eq('IsActive', true)
            .order('SortOrder', { ascending: true });

        if (error) throw new Error(error.message);

        return data as SubscriptionPlan[];
    }

    // Get default (free) plan
    async getFreePlan(): Promise<SubscriptionPlan | null> {
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('Name', 'FREE')
            .eq('IsActive', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as SubscriptionPlan;
    }

    // Get featured/premium plans (for upsell)
    async getFeaturedPlans(limit: number = 3): Promise<SubscriptionPlan[]> {
        const { data, error } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('IsActive', true)
            .eq('IsVisible', true)
            .neq('Name', 'FREE')
            .order('SortOrder', { ascending: true })
            .order('BasePrice', { ascending: true })
            .limit(limit);

        if (error) throw new Error(error.message);

        return data as SubscriptionPlan[];
    }
}

export const subscriptionPlansService = new SubscriptionPlansService();
