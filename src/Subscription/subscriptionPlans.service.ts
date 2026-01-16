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

    // Helper to map DB result to SubscriptionPlan interface
    private mapDBToPlan(data: any): SubscriptionPlan {
        if (!data) return data;
        return {
            PlanId: data.plan_id,
            Name: data.name,
            DisplayName: data.display_name,
            Description: data.description,
            BasePrice: data.base_price,
            Currency: data.currency,
            BillingCycle: data.billing_cycle,
            TrialDays: data.trial_days,
            MaxProperties: data.max_properties,
            MaxVisitsPerMonth: data.max_visits_per_month,
            MaxMediaPerProperty: data.max_media_per_property,
            MaxAmenitiesPerProperty: data.max_amenities_per_property,
            AllowBoost: data.allow_boost,
            MaxBoostsPerMonth: data.max_boosts_per_month,
            AllowPremiumSupport: data.allow_premium_support,
            AllowAdvancedAnalytics: data.allow_advanced_analytics,
            AllowBulkOperations: data.allow_bulk_operations,
            IsActive: data.is_active,
            IsVisible: data.is_visible,
            SortOrder: data.sort_order,
            HighlightFeatures: data.highlight_features,
            CreatedAt: data.created_at,
            UpdatedAt: data.updated_at
        };
    }

    // Create new subscription plan
    async createPlan(data: CreatePlanInput): Promise<SubscriptionPlan> {
        // Validate required fields
        if (!data.name || !data.displayName || data.basePrice === undefined) {
            throw new Error('Name, display name, and base price are required');
        }

        // Check if plan name already exists
        const { data: existing, error: checkError } = await supabase
            .from('subscription_plans')
            .select('plan_id')
            .eq('name', data.name)
            .single();

        if (checkError && checkError.code !== 'PGRST116') throw new Error(checkError.message);
        if (existing) throw new Error('Subscription plan with this name already exists');

        const { data: newPlan, error } = await supabase
            .from('subscription_plans')
            .insert({
                name: data.name,
                display_name: data.displayName,
                description: data.description || null,
                base_price: data.basePrice,
                currency: data.currency || 'KES',
                billing_cycle: data.billingCycle || 'MONTHLY',
                trial_days: data.trialDays || 0,
                max_properties: data.maxProperties || 5,
                max_visits_per_month: data.maxVisitsPerMonth || 10,
                max_media_per_property: data.maxMediaPerProperty || 10,
                max_amenities_per_property: data.maxAmenitiesPerProperty || 15,
                allow_boost: data.allowBoost || false,
                max_boosts_per_month: data.maxBoostsPerMonth || 0,
                allow_premium_support: data.allowPremiumSupport || false,
                allow_advanced_analytics: data.allowAdvancedAnalytics || false,
                allow_bulk_operations: data.allowBulkOperations || false,
                is_visible: data.isVisible !== undefined ? data.isVisible : true,
                sort_order: data.sortOrder || 0,
                highlight_features: data.highlightFeatures || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return this.mapDBToPlan(newPlan);
    }

    // Get plan by ID
    async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
        if (!ValidationUtils.isValidUUID(planId)) throw new Error('Invalid plan ID format');

        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('plan_id', planId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return this.mapDBToPlan(data);
    }

    // Get plan by name
    async getPlanByName(name: string): Promise<SubscriptionPlan | null> {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return this.mapDBToPlan(data);
    }

    // Get all plans (with optional filters)
    async getAllPlans(isActive?: boolean, isVisible?: boolean): Promise<SubscriptionPlan[]> {
        let query = supabase
            .from('subscription_plans')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('display_name', { ascending: true });

        if (isActive !== undefined) {
            query = query.eq('is_active', isActive);
        }
        if (isVisible !== undefined) {
            query = query.eq('is_visible', isVisible);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return (data || []).map((item: any) => this.mapDBToPlan(item));
    }

    // Update plan
    async updatePlan(planId: string, data: UpdatePlanInput): Promise<SubscriptionPlan> {
        if (!ValidationUtils.isValidUUID(planId)) throw new Error('Invalid plan ID format');

        const updates: any = {};
        if (data.displayName !== undefined) updates.display_name = data.displayName;
        if (data.description !== undefined) updates.description = data.description;
        if (data.basePrice !== undefined) updates.base_price = data.basePrice;
        if (data.isActive !== undefined) updates.is_active = data.isActive;
        if (data.isVisible !== undefined) updates.is_visible = data.isVisible;
        if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
        if (data.highlightFeatures !== undefined) updates.highlight_features = data.highlightFeatures;

        if (Object.keys(updates).length === 0) throw new Error('No fields to update');

        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('subscription_plans')
            .update(updates)
            .eq('plan_id', planId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return this.mapDBToPlan(updated);
    }

    // Delete plan (soft delete)
    async deletePlan(planId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(planId)) throw new Error('Invalid plan ID format');

        // Check active subscriptions (user_subscriptions table)
        const { data: activeSubs, error: countError } = await supabase
            .from('user_subscriptions')
            .select('subscription_id')
            .eq('plan_id', planId)
            .in('status', ['TRIAL', 'ACTIVE']);

        if (countError) throw new Error(countError.message);

        if ((activeSubs?.length || 0) > 0) {
            throw new Error('Cannot delete plan with active subscriptions');
        }

        // Soft delete
        const { error, data } = await supabase
            .from('subscription_plans')
            .update({ is_active: false, is_visible: false })
            .eq('plan_id', planId)
            .select('plan_id');

        if (error) throw new Error(error.message);

        return (data?.length || 0) > 0;
    }

    // Compare plans
    async comparePlans(planIds: string[]): Promise<SubscriptionPlan[]> {
        // Validation
        planIds.forEach(id => {
            if (!ValidationUtils.isValidUUID(id)) throw new Error(`Invalid plan ID format: ${id}`);
        });

        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .in('plan_id', planIds)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw new Error(error.message);

        return (data || []).map((item: any) => this.mapDBToPlan(item));
    }

    // Get default (free) plan
    async getFreePlan(): Promise<SubscriptionPlan | null> {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', 'FREE')
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return this.mapDBToPlan(data);
    }

    // Get featured/premium plans (for upsell)
    async getFeaturedPlans(limit: number = 3): Promise<SubscriptionPlan[]> {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .eq('is_visible', true)
            .neq('name', 'FREE')
            .order('sort_order', { ascending: true })
            .order('base_price', { ascending: true })
            .limit(limit);

        if (error) throw new Error(error.message);

        return (data || []).map((item: any) => this.mapDBToPlan(item));
    }
}

export const subscriptionPlansService = new SubscriptionPlansService();
