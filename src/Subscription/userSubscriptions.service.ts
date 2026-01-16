import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
import { subscriptionPlansService } from './subscriptionPlans.service.js';

export interface UserSubscription {
    SubscriptionId: string;
    UserId: string;
    PlanId: string;
    PaymentId?: string;
    Price: number;
    Currency: string;
    BillingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    StartDate: string;
    EndDate: string;
    TrialEndDate?: string;
    CancelAtPeriodEnd: boolean;
    CancelledDate?: string;
    Status: 'TRIAL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'SUSPENDED';
    AutoRenew: boolean;
    RenewalAttempts: number;
    LastRenewalAttempt?: string;
    PropertiesUsed: number;
    VisitsUsedThisMonth: number;
    MediaUsedThisMonth: number;
    AmenitiesUsedThisMonth: number;
    BoostsUsedThisMonth: number;
    LastUsageReset: string;
    NextUsageReset: string;
    CreatedAt: string;
    UpdatedAt: string;
}

// Extended interface with plan properties for joined queries
export interface UserSubscriptionWithPlan extends UserSubscription {
    PlanName?: string;
    DisplayName?: string;
    MaxProperties?: number;
    MaxVisitsPerMonth?: number;
    MaxMediaPerProperty?: number;
    MaxAmenitiesPerProperty?: number;
    AllowBoost?: boolean;
    MaxBoostsPerMonth?: number;
    AllowPremiumSupport?: boolean;
    AllowAdvancedAnalytics?: boolean;
    AllowBulkOperations?: boolean;
}

export interface CreateSubscriptionInput {
    userId: string;
    planId: string;
    paymentId?: string;
    price?: number;
    currency?: string;
    billingCycle?: UserSubscription['BillingCycle'];
    startDate?: Date;
    trialDays?: number;
    autoRenew?: boolean;
}

export interface UpdateSubscriptionInput {
    status?: UserSubscription['Status'];
    autoRenew?: boolean;
    cancelAtPeriodEnd?: boolean;
    paymentId?: string;
}

export interface UsageCheckResult {
    hasAccess: boolean;
    isGated: boolean;
    gateType?: 'SOFT' | 'HARD' | 'UPSELL';
    currentUsage: number;
    maxLimit: number;
    remaining: number;
    subscriptionId?: string;
    planId?: string;
}

export class UserSubscriptionsService {

    // Helper to map DB result to UserSubscription interface
    private mapDBToSubscription(data: any): UserSubscription {
        if (!data) return data;
        return {
            SubscriptionId: data.subscription_id,
            UserId: data.user_id,
            PlanId: data.plan_id,
            PaymentId: data.payment_id,
            Price: data.price,
            Currency: data.currency,
            BillingCycle: data.billing_cycle,
            StartDate: data.start_date,
            EndDate: data.end_date,
            TrialEndDate: data.trial_end_date,
            CancelAtPeriodEnd: data.cancel_at_period_end,
            CancelledDate: data.cancelled_date,
            Status: data.status,
            AutoRenew: data.auto_renew,
            RenewalAttempts: data.renewal_attempts,
            LastRenewalAttempt: data.last_renewal_attempt,
            PropertiesUsed: data.properties_used,
            VisitsUsedThisMonth: data.visits_used_this_month,
            MediaUsedThisMonth: data.media_used_this_month,
            AmenitiesUsedThisMonth: data.amenities_used_this_month,
            BoostsUsedThisMonth: data.boosts_used_this_month,
            LastUsageReset: data.last_usage_reset,
            NextUsageReset: data.next_usage_reset,
            CreatedAt: data.created_at,
            UpdatedAt: data.updated_at
        };
    }

    // Helper to map DB result to UserSubscriptionWithPlan
    private mapDBToSubscriptionWithPlan(data: any): UserSubscriptionWithPlan {
        if (!data) return data;
        const sub = this.mapDBToSubscription(data);
        const plan = data.subscription_plans; // joined table alias

        const res: any = { ...sub };
        if (plan) {
            res.PlanName = plan.name;
            res.DisplayName = plan.display_name;
            res.MaxProperties = plan.max_properties;
            res.MaxVisitsPerMonth = plan.max_visits_per_month;
            res.MaxMediaPerProperty = plan.max_media_per_property;
            res.MaxAmenitiesPerProperty = plan.max_amenities_per_property;
            res.AllowBoost = plan.allow_boost;
            res.MaxBoostsPerMonth = plan.max_boosts_per_month;
            res.AllowPremiumSupport = plan.allow_premium_support;
            res.AllowAdvancedAnalytics = plan.allow_advanced_analytics;
            res.AllowBulkOperations = plan.allow_bulk_operations;
        }
        return res as UserSubscriptionWithPlan;
    }


    // Create new subscription
    async createSubscription(data: CreateSubscriptionInput): Promise<UserSubscription> {
        // Validate user exists (Users table is PascalCase)
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('UserId')
            .eq('UserId', data.userId)
            .eq('IsActive', true)
            .single();

        if (userError || !user) throw new Error('User not found or inactive');

        // Validate plan exists and is active (snake_case)
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('plan_id', data.planId)
            .eq('is_active', true)
            .single();

        if (planError || !plan) throw new Error('Subscription plan not found or inactive');

        // Check for existing active subscription
        const { data: existingSubscription } = await supabase
            .from('user_subscriptions')
            .select('subscription_id')
            .eq('user_id', data.userId)
            .in('status', ['TRIAL', 'ACTIVE'])
            .gt('end_date', new Date().toISOString())
            .single();

        if (existingSubscription) throw new Error('User already has an active subscription');

        // Calculate dates
        const startDate = data.startDate || new Date();
        const trialDays = data.trialDays !== undefined ? data.trialDays : plan.trial_days;
        const trialEndDate = trialDays > 0 ?
            new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;

        // Calculate end date based on billing cycle
        let endDate = new Date(startDate);
        const billingCycle = data.billingCycle || plan.billing_cycle || 'MONTHLY';

        switch (billingCycle) {
            case 'DAILY':
                endDate.setDate(endDate.getDate() + 1);
                break;
            case 'WEEKLY':
                endDate.setDate(endDate.getDate() + 7);
                break;
            case 'MONTHLY':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'ANNUALLY':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }

        // Determine initial status
        let status: UserSubscription['Status'] = 'ACTIVE';
        if (trialDays > 0) {
            status = 'TRIAL';
        }

        const { data: newSub, error } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: data.userId,
                plan_id: data.planId,
                payment_id: data.paymentId || null,
                price: data.price !== undefined ? data.price : plan.base_price,
                currency: data.currency || plan.currency || 'KES',
                billing_cycle: billingCycle,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                trial_end_date: trialEndDate ? trialEndDate.toISOString() : null,
                status: status,
                auto_renew: data.autoRenew !== undefined ? data.autoRenew : true,
                last_usage_reset: startDate.toISOString(),
                next_usage_reset: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Create subscription event
        await this.createSubscriptionEvent(
            newSub.subscription_id,
            data.userId,
            'SUBSCRIPTION_CREATED',
            {
                planId: data.planId,
                status: status,
                trialDays: trialDays,
                billingCycle: billingCycle
            }
        );

        return this.mapDBToSubscription(newSub);
    }

    // Get subscription by ID
    async getSubscriptionById(subscriptionId: string): Promise<UserSubscriptionWithPlan | null> {
        if (!ValidationUtils.isValidUUID(subscriptionId)) throw new Error('Invalid subscription ID format');

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans:plan_id (*)
            `)
            .eq('subscription_id', subscriptionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return this.mapDBToSubscriptionWithPlan(data);
    }

    // Get active subscription for user
    async getActiveSubscription(userId: string): Promise<UserSubscriptionWithPlan | null> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans:plan_id (*)
            `)
            .eq('user_id', userId)
            .in('status', ['TRIAL', 'ACTIVE'])
            .gt('end_date', new Date().toISOString())
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            return null;
        }

        return this.mapDBToSubscriptionWithPlan(data);
    }

    // Get all subscriptions for user
    async getUserSubscriptions(userId: string, includeExpired: boolean = false): Promise<UserSubscription[]> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        let query = supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!includeExpired) {
            query = query.gt('end_date', new Date().toISOString());
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return (data || []).map((s: any) => this.mapDBToSubscription(s));
    }

    // Update subscription
    async updateSubscription(subscriptionId: string, data: UpdateSubscriptionInput): Promise<UserSubscription> {
        if (!ValidationUtils.isValidUUID(subscriptionId)) throw new Error('Invalid subscription ID format');

        // Get current subscription
        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) throw new Error('Subscription not found');

        const updates: any = {};
        if (data.status !== undefined) {
            updates.status = data.status;
            // If cancelling, set cancelled date
            if (data.status === 'CANCELLED' && currentSubscription.Status !== 'CANCELLED') {
                updates.cancelled_date = new Date().toISOString();
            }
        }
        if (data.autoRenew !== undefined) updates.auto_renew = data.autoRenew;
        if (data.cancelAtPeriodEnd !== undefined) updates.cancel_at_period_end = data.cancelAtPeriodEnd;
        if (data.paymentId !== undefined) updates.payment_id = data.paymentId;

        if (Object.keys(updates).length === 0) throw new Error('No fields to update');

        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('user_subscriptions')
            .update(updates)
            .eq('subscription_id', subscriptionId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Create subscription event if status changed
        if (data.status && data.status !== currentSubscription.Status) {
            await this.createSubscriptionEvent(
                subscriptionId,
                currentSubscription.UserId,
                `SUBSCRIPTION_${data.status.toUpperCase()}`,
                {
                    previousStatus: currentSubscription.Status,
                    newStatus: data.status,
                    subscriptionId: subscriptionId
                }
            );
        }

        return this.mapDBToSubscription(updated);
    }

    // Cancel subscription
    async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = false): Promise<UserSubscription> {
        if (!ValidationUtils.isValidUUID(subscriptionId)) throw new Error('Invalid subscription ID format');

        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) throw new Error('Subscription not found');

        if (currentSubscription.Status === 'CANCELLED') throw new Error('Subscription is already cancelled');
        if (currentSubscription.Status === 'EXPIRED') throw new Error('Subscription is already expired');

        if (cancelAtPeriodEnd) {
            return this.updateSubscription(subscriptionId, { cancelAtPeriodEnd: true });
        } else {
            return this.updateSubscription(subscriptionId, { status: 'CANCELLED' });
        }
    }

    // Renew subscription
    async renewSubscription(subscriptionId: string, paymentId?: string): Promise<UserSubscription> {
        if (!ValidationUtils.isValidUUID(subscriptionId)) throw new Error('Invalid subscription ID format');

        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) throw new Error('Subscription not found');

        if (currentSubscription.Status === 'CANCELLED' && !currentSubscription.CancelAtPeriodEnd) {
            throw new Error('Cancelled subscription cannot be renewed');
        }
        if (currentSubscription.Status === 'EXPIRED') throw new Error('Expired subscription cannot be renewed');

        const currentEndDate = new Date(currentSubscription.EndDate);
        const newStartDate = currentEndDate > new Date() ? currentEndDate : new Date();

        let newEndDate = new Date(newStartDate);
        switch (currentSubscription.BillingCycle) {
            case 'DAILY': newEndDate.setDate(newEndDate.getDate() + 1); break;
            case 'WEEKLY': newEndDate.setDate(newEndDate.getDate() + 7); break;
            case 'MONTHLY': newEndDate.setMonth(newEndDate.getMonth() + 1); break;
            case 'QUARTERLY': newEndDate.setMonth(newEndDate.getMonth() + 3); break;
            case 'ANNUALLY': newEndDate.setFullYear(newEndDate.getFullYear() + 1); break;
        }

        const { data: updated, error } = await supabase
            .from('user_subscriptions')
            .update({
                start_date: newStartDate.toISOString(),
                end_date: newEndDate.toISOString(),
                status: 'ACTIVE',
                cancel_at_period_end: false,
                cancelled_date: null,
                renewal_attempts: (currentSubscription.RenewalAttempts || 0) + 1,
                last_renewal_attempt: new Date().toISOString(),
                payment_id: paymentId || null,
                updated_at: new Date().toISOString()
            })
            .eq('subscription_id', subscriptionId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Create subscription event
        await this.createSubscriptionEvent(
            subscriptionId,
            currentSubscription.UserId,
            'SUBSCRIPTION_RENEWED',
            {
                newStartDate: newStartDate,
                newEndDate: newEndDate,
                billingCycle: currentSubscription.BillingCycle
            }
        );

        return this.mapDBToSubscription(updated);
    }

    // Check usage limit
    async checkUsageLimit(userId: string, feature: string, requiredCount: number = 1): Promise<UsageCheckResult> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const subscription = await this.getActiveSubscription(userId);

        if (!subscription) {
            return this.checkFreePlanUsage(userId, feature, requiredCount);
        }

        const maxLimit = this.getFeatureLimit(feature, subscription);
        const currentUsage = this.getFeatureUsage(feature, subscription);
        const hasAccess = this.checkFeatureAccess(feature, subscription);

        const remaining = maxLimit - currentUsage;
        const isGated = remaining < requiredCount;
        const gateType = isGated ? 'HARD' :
            (remaining <= (maxLimit * 0.2) ? 'SOFT' : undefined);

        return {
            hasAccess,
            isGated,
            gateType,
            currentUsage,
            maxLimit,
            remaining,
            subscriptionId: subscription.SubscriptionId,
            planId: subscription.PlanId
        };
    }

    // Check usage for free plan users
    private async checkFreePlanUsage(userId: string, feature: string, requiredCount: number): Promise<UsageCheckResult> {
        const freePlan = await subscriptionPlansService.getFreePlan();

        if (!freePlan) {
            return {
                hasAccess: this.checkFeatureAccessFallback(feature),
                isGated: false,
                gateType: undefined,
                currentUsage: 0,
                maxLimit: this.getFeatureLimitFallback(feature),
                remaining: this.getFeatureLimitFallback(feature),
                subscriptionId: undefined,
                planId: undefined
            };
        }

        const currentUsage = await this.getFreePlanUsage(userId, feature);
        const maxLimit = this.getFeatureLimit(feature, freePlan);
        const hasAccess = this.checkFeatureAccess(feature, freePlan);

        const remaining = maxLimit - currentUsage;
        const isGated = remaining < requiredCount;
        const gateType = isGated ? 'HARD' :
            (remaining <= (maxLimit * 0.2) ? 'SOFT' : undefined);

        return {
            hasAccess,
            isGated,
            gateType,
            currentUsage,
            maxLimit,
            remaining,
            subscriptionId: undefined,
            planId: freePlan.PlanId
        };
    }

    // Get current usage for free plan users
    private async getFreePlanUsage(userId: string, feature: string): Promise<number> {
        let count = 0;

        switch (feature) {
            case 'PROPERTY_CREATE': {
                const { count: c, error } = await supabase
                    .from('properties')
                    .select('*', { count: 'exact', head: true })
                    .eq('owner_id', userId);
                if (!error) count = c || 0;
                break;
            }
            case 'VISIT_SCHEDULE': {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

                const { count: c, error } = await supabase
                    .from('property_visits')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', userId)
                    .gte('visit_date', startOfMonth)
                    .lte('visit_date', endOfMonth);
                if (!error) count = c || 0;
                break;
            }
            case 'BOOST_PROPERTY': {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

                const { count: c, error } = await supabase
                    .from('properties')
                    .select('*', { count: 'exact', head: true })
                    .eq('owner_id', userId)
                    .eq('is_boosted', true)
                    .gte('created_at', startOfMonth)
                    .lte('created_at', endOfMonth);
                if (!error) count = c || 0;
                break;
            }
            default:
                count = 0;
        }
        return count;
    }

    // Get feature limit from subscription plan
    private getFeatureLimit(feature: string, subscription: any): number {
        switch (feature) {
            case 'PROPERTY_CREATE': return subscription.MaxProperties || 0;
            case 'VISIT_SCHEDULE': return subscription.MaxVisitsPerMonth || 0;
            case 'BOOST_PROPERTY': return subscription.MaxBoostsPerMonth || 0;
            case 'MEDIA_UPLOAD': return subscription.MaxMediaPerProperty || 0;
            case 'AMENITY_ADD': return subscription.MaxAmenitiesPerProperty || 0;
            default: return 0;
        }
    }

    // Get feature usage from subscription
    private getFeatureUsage(feature: string, subscription: any): number {
        switch (feature) {
            case 'PROPERTY_CREATE': return subscription.PropertiesUsed || 0;
            case 'VISIT_SCHEDULE': return subscription.VisitsUsedThisMonth || 0;
            case 'BOOST_PROPERTY': return subscription.BoostsUsedThisMonth || 0;
            case 'MEDIA_UPLOAD': return subscription.MediaUsedThisMonth || 0;
            case 'AMENITY_ADD': return subscription.AmenitiesUsedThisMonth || 0;
            default: return 0;
        }
    }

    // Check feature access from subscription plan
    private checkFeatureAccess(feature: string, subscription: any): boolean {
        switch (feature) {
            case 'BOOST_PROPERTY': return subscription.AllowBoost === true;
            case 'PREMIUM_SUPPORT': return subscription.AllowPremiumSupport === true;
            case 'ADVANCED_ANALYTICS': return subscription.AllowAdvancedAnalytics === true;
            case 'BULK_OPERATIONS': return subscription.AllowBulkOperations === true;
            default: return true;
        }
    }

    private checkFeatureAccessFallback(feature: string): boolean {
        switch (feature) {
            case 'BOOST_PROPERTY':
            case 'PREMIUM_SUPPORT':
            case 'ADVANCED_ANALYTICS':
            case 'BULK_OPERATIONS':
                return false;
            default:
                return true;
        }
    }

    private getFeatureLimitFallback(feature: string): number {
        switch (feature) {
            case 'PROPERTY_CREATE': return 3;
            case 'VISIT_SCHEDULE': return 5;
            case 'BOOST_PROPERTY': return 0;
            case 'MEDIA_UPLOAD': return 5;
            case 'AMENITY_ADD': return 10;
            default: return 0;
        }
    }

    // Record usage
    async recordUsage(
        userId: string,
        feature: string,
        resourceId?: string,
        action: string = 'CREATE',
        count: number = 1,
        override: boolean = false,
        overrideReason?: string,
        ipAddress?: string,
        userAgent?: string,
        metadata?: any
    ): Promise<void> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const usageCheck = await this.checkUsageLimit(userId, feature, count);

        if (usageCheck.isGated && !override) {
            throw new Error(`Usage limit reached for ${feature}. ${usageCheck.remaining} remaining.`);
        }

        const subscription = await this.getActiveSubscription(userId);

        if (subscription) {
            await this.updateSubscriptionUsage(subscription.SubscriptionId, feature, count);
        }

        const { error } = await supabase
            .from('subscription_usage_logs')
            .insert({
                subscription_id: subscription?.SubscriptionId || null,
                user_id: userId,
                feature: feature,
                resource_id: resourceId || null,
                action: action,
                usage_count: count,
                was_gated: usageCheck.isGated,
                gate_type: usageCheck.gateType || null,
                override_reason: overrideReason || null,
                ip_address: ipAddress || null,
                user_agent: userAgent || null,
                metadata: metadata ? JSON.stringify(metadata) : null,
                usage_date: new Date().toISOString()
            });

        if (error) console.error('Error logging usage:', error);
    }

    private async updateSubscriptionUsage(subscriptionId: string, feature: string, count: number): Promise<void> {
        const { data: current, error: fetchError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .single();

        if (fetchError || !current) return;

        const updates: any = { updated_at: new Date().toISOString() };

        // Helper to get raw snake_case column value
        switch (feature) {
            case 'PROPERTY_CREATE': updates.properties_used = (current.properties_used || 0) + count; break;
            case 'VISIT_SCHEDULE': updates.visits_used_this_month = (current.visits_used_this_month || 0) + count; break;
            case 'BOOST_PROPERTY': updates.boosts_used_this_month = (current.boosts_used_this_month || 0) + count; break;
            case 'MEDIA_UPLOAD': updates.media_used_this_month = (current.media_used_this_month || 0) + count; break;
            case 'AMENITY_ADD': updates.amenities_used_this_month = (current.amenities_used_this_month || 0) + count; break;
            default: return;
        }

        await supabase
            .from('user_subscriptions')
            .update(updates)
            .eq('subscription_id', subscriptionId);
    }

    // Get usage statistics
    async getUsageStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<{
        totalUsage: number;
        byFeature: Record<string, number>;
        byDay: Record<string, number>;
        gatedActions: number;
    }> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        let query = supabase
            .from('subscription_usage_logs')
            .select('feature, usage_count, was_gated, usage_date')
            .eq('user_id', userId)
            .order('usage_date', { ascending: false });

        if (startDate) query = query.gte('usage_date', startDate.toISOString());
        if (endDate) query = query.lte('usage_date', endDate.toISOString());

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        const statistics = {
            totalUsage: 0,
            byFeature: {} as Record<string, number>,
            byDay: {} as Record<string, number>,
            gatedActions: 0
        };

        (data || []).forEach((row: any) => {
            const count = row.usage_count || 1;
            statistics.totalUsage += count;
            statistics.byFeature[row.feature] = (statistics.byFeature[row.feature] || 0) + count;
            const dateKey = new Date(row.usage_date).toISOString().split('T')[0];
            statistics.byDay[dateKey] = (statistics.byDay[dateKey] || 0) + count;
            if (row.was_gated) statistics.gatedActions += 1;
        });

        return statistics;
    }

    // Reset monthly usage (admin only)
    async resetMonthlyUsage(): Promise<number> {
        console.warn('resetMonthlyUsage is not fully implemented in client-side migration. Use a database function.');
        return 0;
    }

    // Get subscriptions expiring soon
    async getExpiringSubscriptions(days: number = 7): Promise<UserSubscriptionWithPlan[]> {
        const endDateLimit = new Date();
        endDateLimit.setDate(endDateLimit.getDate() + days);

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans:plan_id (*),
                Users:user_id (Email)
            `)
            .in('status', ['TRIAL', 'ACTIVE'])
            .gt('end_date', new Date().toISOString())
            .lte('end_date', endDateLimit.toISOString())
            .order('end_date', { ascending: true });

        if (error) throw new Error(error.message);

        return data.map((sub: any) => {
            const mapped = this.mapDBToSubscriptionWithPlan(sub);
            // manually handle User join mapping as it's specific here
            if (sub.Users) {
                (mapped as any).UserEmail = sub.Users.Email;
            }
            return mapped;
        });
    }

    // Get trial subscriptions ending soon
    async getTrialEndingSubscriptions(days: number = 3): Promise<UserSubscriptionWithPlan[]> {
        const endDateLimit = new Date();
        endDateLimit.setDate(endDateLimit.getDate() + days);

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select(`
                *,
                subscription_plans:plan_id (*),
                Users:user_id (Email)
            `)
            .eq('status', 'TRIAL')
            .gt('trial_end_date', new Date().toISOString())
            .lte('trial_end_date', endDateLimit.toISOString())
            .order('trial_end_date', { ascending: true });

        if (error) throw new Error(error.message);

        return data.map((sub: any) => {
            const mapped = this.mapDBToSubscriptionWithPlan(sub);
            // manually handle User join mapping
            if (sub.Users) {
                (mapped as any).UserEmail = sub.Users.Email;
            }
            return mapped;
        });
    }

    // Helper method to create subscription events
    private async createSubscriptionEvent(
        subscriptionId: string,
        userId: string,
        eventType: string,
        eventData: any
    ): Promise<void> {
        await supabase
            .from('subscription_events')
            .insert({
                event_type: eventType,
                subscription_id: subscriptionId,
                user_id: userId,
                event_data: JSON.stringify(eventData),
                created_at: new Date().toISOString()
            });
    }

    // Get subscription summary for dashboard
    async getSubscriptionSummary(userId: string): Promise<{
        subscription: UserSubscriptionWithPlan | null;
        stats: any;
    }> {
        const sub = await this.getActiveSubscription(userId);
        const stats = await this.getUsageStatistics(userId);
        return { subscription: sub, stats };
    }
}

export const userSubscriptionsService = new UserSubscriptionsService();