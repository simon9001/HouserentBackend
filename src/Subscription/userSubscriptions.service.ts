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

    // Create new subscription
    async createSubscription(data: CreateSubscriptionInput): Promise<UserSubscription> {
        // Validate user exists
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('UserId')
            .eq('UserId', data.userId)
            .eq('IsActive', true)
            .single();

        if (userError || !user) throw new Error('User not found or inactive');

        // Validate plan exists and is active
        const { data: plan, error: planError } = await supabase
            .from('SubscriptionPlans')
            .select('*')
            .eq('PlanId', data.planId)
            .eq('IsActive', true)
            .single();

        if (planError || !plan) throw new Error('Subscription plan not found or inactive');

        // Check for existing active subscription
        const { data: existingSubscription } = await supabase
            .from('UserSubscriptions')
            .select('SubscriptionId')
            .eq('UserId', data.userId)
            .in('Status', ['TRIAL', 'ACTIVE'])
            .gt('EndDate', new Date().toISOString())
            .single();

        if (existingSubscription) throw new Error('User already has an active subscription');

        // Calculate dates
        const startDate = data.startDate || new Date();
        const trialDays = data.trialDays !== undefined ? data.trialDays : plan.TrialDays;
        const trialEndDate = trialDays > 0 ?
            new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;

        // Calculate end date based on billing cycle
        let endDate = new Date(startDate);
        const billingCycle = data.billingCycle || plan.BillingCycle || 'MONTHLY';

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
            .from('UserSubscriptions')
            .insert({
                UserId: data.userId,
                PlanId: data.planId,
                PaymentId: data.paymentId || null,
                Price: data.price !== undefined ? data.price : plan.BasePrice,
                Currency: data.currency || plan.Currency || 'KES',
                BillingCycle: billingCycle,
                StartDate: startDate.toISOString(),
                EndDate: endDate.toISOString(),
                TrialEndDate: trialEndDate ? trialEndDate.toISOString() : null,
                Status: status,
                AutoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
                LastUsageReset: startDate.toISOString(),
                NextUsageReset: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Create subscription event
        await this.createSubscriptionEvent(
            newSub.SubscriptionId,
            data.userId,
            'SUBSCRIPTION_CREATED',
            {
                planId: data.planId,
                status: status,
                trialDays: trialDays,
                billingCycle: billingCycle
            }
        );

        return newSub as UserSubscription;
    }

    // Get subscription by ID
    async getSubscriptionById(subscriptionId: string): Promise<UserSubscriptionWithPlan | null> {
        if (!ValidationUtils.isValidUUID(subscriptionId)) throw new Error('Invalid subscription ID format');

        const { data, error } = await supabase
            .from('UserSubscriptions')
            .select(`
                *,
                SubscriptionPlans:PlanId (*)
            `)
            .eq('SubscriptionId', subscriptionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        const plan = data.SubscriptionPlans;
        const result: any = { ...data };
        delete result.SubscriptionPlans;

        if (plan) {
            result.PlanName = plan.DisplayName;
            result.DisplayName = plan.DisplayName;
            result.MaxProperties = plan.MaxProperties;
            result.MaxVisitsPerMonth = plan.MaxVisitsPerMonth;
            result.MaxMediaPerProperty = plan.MaxMediaPerProperty;
            result.MaxAmenitiesPerProperty = plan.MaxAmenitiesPerProperty;
            result.AllowBoost = plan.AllowBoost;
            result.MaxBoostsPerMonth = plan.MaxBoostsPerMonth;
            result.AllowPremiumSupport = plan.AllowPremiumSupport;
            result.AllowAdvancedAnalytics = plan.AllowAdvancedAnalytics;
            result.AllowBulkOperations = plan.AllowBulkOperations;
        }

        return result as UserSubscriptionWithPlan;
    }

    // Get active subscription for user
    async getActiveSubscription(userId: string): Promise<UserSubscriptionWithPlan | null> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { data, error } = await supabase
            .from('UserSubscriptions')
            .select(`
                *,
                SubscriptionPlans:PlanId (*)
            `)
            .eq('UserId', userId)
            .in('Status', ['TRIAL', 'ACTIVE'])
            .gt('EndDate', new Date().toISOString())
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            return null;
        }

        const plan = data.SubscriptionPlans;
        const result: any = { ...data };
        delete result.SubscriptionPlans;

        if (plan) {
            result.PlanName = plan.DisplayName;
            result.DisplayName = plan.DisplayName;
            result.MaxProperties = plan.MaxProperties;
            result.MaxVisitsPerMonth = plan.MaxVisitsPerMonth;
            result.MaxMediaPerProperty = plan.MaxMediaPerProperty;
            result.MaxAmenitiesPerProperty = plan.MaxAmenitiesPerProperty;
            result.AllowBoost = plan.AllowBoost;
            result.MaxBoostsPerMonth = plan.MaxBoostsPerMonth;
            result.AllowPremiumSupport = plan.AllowPremiumSupport;
            result.AllowAdvancedAnalytics = plan.AllowAdvancedAnalytics;
            result.AllowBulkOperations = plan.AllowBulkOperations;
        }

        return result as UserSubscriptionWithPlan;
    }

    // Get all subscriptions for user
    async getUserSubscriptions(userId: string, includeExpired: boolean = false): Promise<UserSubscription[]> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        let query = supabase
            .from('UserSubscriptions')
            .select('*')
            .eq('UserId', userId)
            .order('CreatedAt', { ascending: false });

        if (!includeExpired) {
            query = query.gt('EndDate', new Date().toISOString());
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return data as UserSubscription[];
    }

    // Update subscription
    async updateSubscription(subscriptionId: string, data: UpdateSubscriptionInput): Promise<UserSubscription> {
        if (!ValidationUtils.isValidUUID(subscriptionId)) throw new Error('Invalid subscription ID format');

        // Get current subscription
        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) throw new Error('Subscription not found');

        const updates: any = {};
        if (data.status !== undefined) {
            updates.Status = data.status;
            // If cancelling, set cancelled date
            if (data.status === 'CANCELLED' && currentSubscription.Status !== 'CANCELLED') {
                updates.CancelledDate = new Date().toISOString();
            }
        }
        if (data.autoRenew !== undefined) updates.AutoRenew = data.autoRenew;
        if (data.cancelAtPeriodEnd !== undefined) updates.CancelAtPeriodEnd = data.cancelAtPeriodEnd;
        if (data.paymentId !== undefined) updates.PaymentId = data.paymentId;

        if (Object.keys(updates).length === 0) throw new Error('No fields to update');

        updates.UpdatedAt = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('UserSubscriptions')
            .update(updates)
            .eq('SubscriptionId', subscriptionId)
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

        return updated as UserSubscription;
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
            .from('UserSubscriptions')
            .update({
                StartDate: newStartDate.toISOString(),
                EndDate: newEndDate.toISOString(),
                Status: 'ACTIVE',
                CancelAtPeriodEnd: false,
                CancelledDate: null,
                RenewalAttempts: (currentSubscription.RenewalAttempts || 0) + 1,
                LastRenewalAttempt: new Date().toISOString(),
                PaymentId: paymentId || null,
                UpdatedAt: new Date().toISOString()
            })
            .eq('SubscriptionId', subscriptionId)
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

        return updated as UserSubscription;
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
                    .from('Properties')
                    .select('*', { count: 'exact', head: true })
                    .eq('OwnerId', userId);
                if (!error) count = c || 0;
                break;
            }
            case 'VISIT_SCHEDULE': {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

                const { count: c, error } = await supabase
                    .from('PropertyVisits')
                    .select('*', { count: 'exact', head: true })
                    .eq('TenantId', userId)
                    .gte('VisitDate', startOfMonth)
                    .lte('VisitDate', endOfMonth);
                if (!error) count = c || 0;
                break;
            }
            case 'BOOST_PROPERTY': {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

                const { count: c, error } = await supabase
                    .from('Properties')
                    .select('*', { count: 'exact', head: true })
                    .eq('OwnerId', userId)
                    .eq('IsBoosted', true)
                    .gte('CreatedAt', startOfMonth)
                    .lte('CreatedAt', endOfMonth);
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
            .from('SubscriptionUsageLogs')
            .insert({
                SubscriptionId: subscription?.SubscriptionId || null,
                UserId: userId,
                Feature: feature,
                ResourceId: resourceId || null,
                Action: action,
                UsageCount: count,
                WasGated: usageCheck.isGated,
                GateType: usageCheck.gateType || null,
                OverrideReason: overrideReason || null,
                IpAddress: ipAddress || null,
                UserAgent: userAgent || null,
                Metadata: metadata ? JSON.stringify(metadata) : null,
                UsageDate: new Date().toISOString()
            });

        if (error) console.error('Error logging usage:', error);
    }

    private async updateSubscriptionUsage(subscriptionId: string, feature: string, count: number): Promise<void> {
        const { data: current, error: fetchError } = await supabase
            .from('UserSubscriptions')
            .select('*')
            .eq('SubscriptionId', subscriptionId)
            .single();

        if (fetchError || !current) return;

        const updates: any = { UpdatedAt: new Date().toISOString() };

        switch (feature) {
            case 'PROPERTY_CREATE': updates.PropertiesUsed = (current.PropertiesUsed || 0) + count; break;
            case 'VISIT_SCHEDULE': updates.VisitsUsedThisMonth = (current.VisitsUsedThisMonth || 0) + count; break;
            case 'BOOST_PROPERTY': updates.BoostsUsedThisMonth = (current.BoostsUsedThisMonth || 0) + count; break;
            case 'MEDIA_UPLOAD': updates.MediaUsedThisMonth = (current.MediaUsedThisMonth || 0) + count; break;
            case 'AMENITY_ADD': updates.AmenitiesUsedThisMonth = (current.AmenitiesUsedThisMonth || 0) + count; break;
            default: return;
        }

        await supabase
            .from('UserSubscriptions')
            .update(updates)
            .eq('SubscriptionId', subscriptionId);
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
            .from('SubscriptionUsageLogs')
            .select('Feature, UsageCount, WasGated, UsageDate')
            .eq('UserId', userId)
            .order('UsageDate', { ascending: false });

        if (startDate) query = query.gte('UsageDate', startDate.toISOString());
        if (endDate) query = query.lte('UsageDate', endDate.toISOString());

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        const statistics = {
            totalUsage: 0,
            byFeature: {} as Record<string, number>,
            byDay: {} as Record<string, number>,
            gatedActions: 0
        };

        data.forEach((row: any) => {
            statistics.totalUsage += row.UsageCount;
            statistics.byFeature[row.Feature] = (statistics.byFeature[row.Feature] || 0) + row.UsageCount;
            const dateKey = new Date(row.UsageDate).toISOString().split('T')[0];
            statistics.byDay[dateKey] = (statistics.byDay[dateKey] || 0) + row.UsageCount;
            if (row.WasGated) statistics.gatedActions += 1;
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
            .from('UserSubscriptions')
            .select(`
                *,
                SubscriptionPlans:PlanId (*),
                Users:UserId (Email)
            `)
            .in('Status', ['TRIAL', 'ACTIVE'])
            .gt('EndDate', new Date().toISOString())
            .lte('EndDate', endDateLimit.toISOString())
            .order('EndDate', { ascending: true });

        if (error) throw new Error(error.message);

        return data.map((sub: any) => {
            const plan = sub.SubscriptionPlans;
            const user = sub.Users;
            const res: any = { ...sub };
            delete res.SubscriptionPlans;
            delete res.Users;

            if (plan) {
                res.PlanName = plan.DisplayName;
                res.DisplayName = plan.DisplayName;
            }
            if (user) {
                res.UserEmail = user.Email;
            }
            return res;
        });
    }

    // Get trial subscriptions ending soon
    async getTrialEndingSubscriptions(days: number = 3): Promise<UserSubscriptionWithPlan[]> {
        const endDateLimit = new Date();
        endDateLimit.setDate(endDateLimit.getDate() + days);

        const { data, error } = await supabase
            .from('UserSubscriptions')
            .select(`
                *,
                SubscriptionPlans:PlanId (*),
                Users:UserId (Email)
            `)
            .eq('Status', 'TRIAL')
            .gt('TrialEndDate', new Date().toISOString())
            .lte('TrialEndDate', endDateLimit.toISOString())
            .order('TrialEndDate', { ascending: true });

        if (error) throw new Error(error.message);

        return data.map((sub: any) => {
            const plan = sub.SubscriptionPlans;
            const user = sub.Users;
            const res: any = { ...sub };
            delete res.SubscriptionPlans;
            delete res.Users;

            if (plan) {
                res.PlanName = plan.DisplayName;
                res.DisplayName = plan.DisplayName;
            }
            if (user) {
                res.UserEmail = user.Email;
            }
            return res;
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
            .from('SubscriptionEvents')
            .insert({
                EventType: eventType,
                SubscriptionId: subscriptionId,
                UserId: userId,
                EventData: JSON.stringify(eventData),
                CreatedAt: new Date().toISOString()
            });
    }

    // Get subscription summary for dashboard
    async getSubscriptionSummary(userId: string): Promise<{
        subscription: UserSubscriptionWithPlan | null;
        usage: {
            properties: { used: number; limit: number; remaining: number };
            visits: { used: number; limit: number; remaining: number };
            boosts: { used: number; limit: number; remaining: number };
            media: { used: number; limit: number; remaining: number };
            amenities: { used: number; limit: number; remaining: number };
        };
        features: {
            allowBoost: boolean;
            allowPremiumSupport: boolean;
            allowAdvancedAnalytics: boolean;
            allowBulkOperations: boolean;
        };
        nextReset: string;
    }> {
        const subscription = await this.getActiveSubscription(userId);

        if (!subscription) {
            // Return free plan summary
            const freePlan = await subscriptionPlansService.getFreePlan();
            const nextResetDate = new Date();
            nextResetDate.setDate(nextResetDate.getDate() + 30);

            return {
                subscription: null,
                usage: {
                    properties: { used: 0, limit: freePlan?.MaxProperties || 3, remaining: freePlan?.MaxProperties || 3 },
                    visits: { used: 0, limit: freePlan?.MaxVisitsPerMonth || 5, remaining: freePlan?.MaxVisitsPerMonth || 5 },
                    boosts: { used: 0, limit: freePlan?.MaxBoostsPerMonth || 0, remaining: freePlan?.MaxBoostsPerMonth || 0 },
                    media: { used: 0, limit: freePlan?.MaxMediaPerProperty || 5, remaining: freePlan?.MaxMediaPerProperty || 5 },
                    amenities: { used: 0, limit: freePlan?.MaxAmenitiesPerProperty || 10, remaining: freePlan?.MaxAmenitiesPerProperty || 10 }
                },
                features: {
                    allowBoost: freePlan?.AllowBoost || false,
                    allowPremiumSupport: freePlan?.AllowPremiumSupport || false,
                    allowAdvancedAnalytics: freePlan?.AllowAdvancedAnalytics || false,
                    allowBulkOperations: freePlan?.AllowBulkOperations || false
                },
                nextReset: nextResetDate.toISOString()
            };
        }

        return {
            subscription,
            usage: {
                properties: {
                    used: subscription.PropertiesUsed,
                    limit: subscription.MaxProperties || 0,
                    remaining: Math.max(0, (subscription.MaxProperties || 0) - subscription.PropertiesUsed)
                },
                visits: {
                    used: subscription.VisitsUsedThisMonth,
                    limit: subscription.MaxVisitsPerMonth || 0,
                    remaining: Math.max(0, (subscription.MaxVisitsPerMonth || 0) - subscription.VisitsUsedThisMonth)
                },
                boosts: {
                    used: subscription.BoostsUsedThisMonth,
                    limit: subscription.MaxBoostsPerMonth || 0,
                    remaining: Math.max(0, (subscription.MaxBoostsPerMonth || 0) - subscription.BoostsUsedThisMonth)
                },
                media: {
                    used: subscription.MediaUsedThisMonth,
                    limit: subscription.MaxMediaPerProperty || 0,
                    remaining: Math.max(0, (subscription.MaxMediaPerProperty || 0) - subscription.MediaUsedThisMonth)
                },
                amenities: {
                    used: subscription.AmenitiesUsedThisMonth,
                    limit: subscription.MaxAmenitiesPerProperty || 0,
                    remaining: Math.max(0, (subscription.MaxAmenitiesPerProperty || 0) - subscription.AmenitiesUsedThisMonth)
                }
            },
            features: {
                allowBoost: subscription.AllowBoost || false,
                allowPremiumSupport: subscription.AllowPremiumSupport || false,
                allowAdvancedAnalytics: subscription.AllowAdvancedAnalytics || false,
                allowBulkOperations: subscription.AllowBulkOperations || false
            },
            nextReset: subscription.NextUsageReset
        };
    }
}

export const userSubscriptionsService = new UserSubscriptionsService();