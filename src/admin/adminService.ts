// admin/adminService.ts
import { supabase } from "../Database/config.js";

// ==================== DASHBOARD STATISTICS ====================
export interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    activeVisits: number;
    totalRevenue: number;
    pendingVerifications: number;
    availableProperties: number;
    verifiedProperties: number;
    totalReviews: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
}

// ==================== ACTIVITY & ANALYTICS ====================
export interface RecentActivity {
    activityId: string;
    type: string;
    description: string;
    timestamp: string;
    userId?: string;
    username?: string;
}

export interface UserAnalytics {
    date: string;
    registrations: number;
}

export interface PropertyAnalytics {
    date: string;
    listings: number;
    verified: number;
}

export interface RevenueAnalytics {
    date: string;
    revenue: number;
    payments: number;
}

export interface RoleSummary {
    role: string;
    count: number;
}

export interface AgentStatusSummary {
    status: string;
    count: number;
}

export interface PopularLocation {
    county: string;
    area: string;
    propertyCount: number;
    avgRent: number;
}

export interface VerificationAnalytics {
    status: string;
    count: number;
    avgProcessingTime: number;
}

// ==================== SUBSCRIPTION ANALYTICS ====================
export interface SubscriptionAnalytics {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
    monthlyRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    trialConversionRate: number;
}

export interface PlanDistribution {
    planName: string;
    count: number;
    percentage: number;
    revenue: number;
    avgRevenuePerUser: number;
}

export interface SubscriptionGrowth {
    date: string;
    newSubscriptions: number;
    cancelledSubscriptions: number;
    activeSubscriptions: number;
    netGrowth: number;
}

export interface UsageAnalytics {
    planName: string;
    avgPropertiesUsed: number;
    avgVisitsUsed: number;
    avgBoostsUsed: number;
    maxProperties: number;
    maxVisitsPerMonth: number;
    maxBoostsPerMonth: number;
    usagePercentage: number;
}

export interface ChurnAnalytics {
    date: string;
    newSubscribers: number;
    churnedSubscribers: number;
    churnRate: number;
    retentionRate: number;
}

export interface RevenueBreakdown {
    planName: string;
    revenue: number;
    subscribers: number;
    avgRevenuePerSubscriber: number;
    percentage: number;
}

// ==================== SUBSCRIPTION MANAGEMENT ====================
export interface ActiveSubscription {
    subscriptionId: string;
    userId: string;
    userName: string;
    userEmail: string;
    planId: string;
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    trialEndDate: string | null;
    autoRenew: boolean;
    price: number;
    propertiesUsed: number;
    visitsUsed: number;
    boostsUsed: number;
    maxProperties: number;
    maxVisits: number;
    maxBoosts: number;
    daysRemaining: number;
    daysUntilTrialEnd: number | null;
    createdAt: string;
    updatedAt: string;
}

// Merged with later definition to avoid duplicates

// Merged with later definition to avoid duplicates

export interface SubscriptionPlan {
    planId: string;
    name: string;
    displayName: string;
    price?: number;
    basePrice: number;
    currency: string;
    description: string;
    features?: string[];
    isActive: boolean;
    billingCycle: string;
    propertiesLimit?: number;
    visitsLimit?: number;
    boostsLimit?: number;
    mediaLimit?: number;
    amenitiesLimit?: number;
    trialDays: number;

    // Features
    maxProperties: number;
    maxVisitsPerMonth: number;
    maxMediaPerProperty: number;
    maxAmenitiesPerProperty: number;
    allowBoost: boolean;
    maxBoostsPerMonth: number;
    allowPremiumSupport: boolean;
    allowAdvancedAnalytics: boolean;
    allowBulkOperations: boolean;

    // Stats
    activeSubscribers: number;
    totalRevenue: number;
    avgRating: number;

    // Visibility
    isVisible: boolean;
    sortOrder: number;
    highlightFeatures: string[];

    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionInvoice {
    invoiceId: string;
    subscriptionId: string;
    userId: string;
    userName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    periodStart: string;
    periodEnd: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    paidAmount: number;
    paidDate: string | null;
    paymentId: string | null;
    lineItems: any[];
    pdfUrl: string | null;
    htmlUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionEvent {
    eventId: string;
    eventType: string;
    subscriptionId: string | null;
    userId: string;
    userName: string;
    eventData: any;
    processed: boolean;
    processedAt: string | null;
    errorMessage: string | null;
    retryCount: number;
    scheduledFor: string;
    createdAt: string;
}

export interface UsageLog {
    logId: string;
    subscriptionId: string;
    userId: string;
    userName: string;
    feature: string;
    resourceId: string | null;
    action: string;
    usageCount: number;
    usageDate: string;
    wasGated: boolean;
    gateType: string | null;
    overrideReason: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: any;
    createdAt: string;
}

export interface SubscriptionStats {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    newSubscriptionsToday: number;
    cancellationsToday: number;
    monthlyRevenue: number;
    lifetimeRevenue: number;
    churnRate: number;
    trialConversionRate: number;
    avgRevenuePerUser: number;
    mostPopularPlan: string;
    usageRate: number;
    failedPaymentsToday: number;
}

export interface SubscriptionUserDetails {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    currentSubscription: ActiveSubscription | null;
    subscriptionHistory: ActiveSubscription[];
    paymentHistory: PaymentHistory[];
    usageSummary: {
        totalPropertiesCreated: number;
        totalVisitsScheduled: number;
        totalBoostsUsed: number;
        currentMonthUsage: {
            properties: number;
            visits: number;
            boosts: number;
            media: number;
            amenities: number;
        };
    };
    featureGates: Array<{
        feature: string;
        gateType: string;
        triggerLimit: number;
        triggerCount: number;
        isActive: boolean;
    }>;
    nextBillingDate: string | null;
    totalSpent: number;
    joinedDate: string;
}

export interface PaymentHistory {
    paymentId: string;
    amount: number;
    currency: string;
    paymentProvider: string;
    purpose: string;
    status: string;
    invoiceId: string | null;
    invoiceNumber: string | null;
    createdAt: string;
    completedAt: string | null;
}

// ==================== CORE DASHBOARD SERVICES ====================

// Get Dashboard Statistics
export const getDashboardStatsService = async (): Promise<DashboardStats> => {
    try {
        const [
            users,
            properties,
            visits,
            revenue,
            pendingVerifications,
            availableProperties,
            verifiedProperties,
            reviews,
            activeSubscriptions,
            monthlyRevenue
        ] = await Promise.all([
            supabase.from('Users').select('*', { count: 'exact', head: true }).eq('IsActive', true), // PascalCase Users
            supabase.from('properties').select('*', { count: 'exact', head: true }), // snake_case
            supabase.from('property_visits').select('*', { count: 'exact', head: true }).eq('status', 'CHECKED_IN'), // snake_case
            supabase.from('payments').select('amount').eq('status', 'COMPLETED').eq('purpose', 'SUBSCRIPTION'), // snake_case
            supabase.from('agent_verification').select('*', { count: 'exact', head: true }).eq('review_status', 'PENDING'), // snake_case
            supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_available', true), // snake_case
            supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_verified', true), // snake_case
            supabase.from('reviews').select('*', { count: 'exact', head: true }), // snake_case
            supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['ACTIVE', 'TRIAL']).gt('end_date', new Date().toISOString()), // snake_case
            supabase.from('payments').select('amount, created_at').eq('status', 'COMPLETED').eq('purpose', 'SUBSCRIPTION') // snake_case
        ]);

        const totalRev = (revenue.data || []).reduce((sum: any, p: any) => sum + (p.amount || 0), 0);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyRev = (monthlyRevenue.data || [])
            .filter((p: any) => {
                const d = new Date(p.created_at);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum: any, p: any) => sum + (p.amount || 0), 0);

        return {
            totalUsers: users.count || 0,
            totalProperties: properties.count || 0,
            activeVisits: visits.count || 0,
            totalRevenue: totalRev,
            pendingVerifications: pendingVerifications.count || 0,
            availableProperties: availableProperties.count || 0,
            verifiedProperties: verifiedProperties.count || 0,
            totalReviews: reviews.count || 0,
            activeSubscriptions: activeSubscriptions.count || 0,
            monthlyRevenue: monthlyRev
        };
    } catch (error) {
        console.error("Error in getDashboardStatsService:", error);
        throw error;
    }
}

// Get Recent Activities
export const getRecentActivitiesService = async (limit: number = 10): Promise<RecentActivity[]> => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const since = sevenDaysAgo.toISOString();

        const [users, properties, verifications, reviews, events] = await Promise.all([
            // Users table is PascalCase
            supabase.from('Users').select('UserId, FullName, CreatedAt').gte('CreatedAt', since).order('CreatedAt', { ascending: false }).limit(limit),
            // properties: owner_id -> Users
            // Use explicit alias Users!owner_id
            supabase.from('properties').select('property_id, title, created_at, owner_id, Users!owner_id(FullName)').gte('created_at', since).order('created_at', { ascending: false }).limit(limit),
            // agent_verification: user_id -> Users
            supabase.from('agent_verification').select('verification_id, review_status, submitted_at, reviewed_at, user_id, Users(FullName)').gte('submitted_at', since).order('submitted_at', { ascending: false }).limit(limit),
            // reviews: reviewer_id -> Users. Note alias might be tricky if multiple FKs to Users.
            supabase.from('reviews').select('review_id, rating, created_at, reviewer_id, Users!reviewer_id(FullName)').gte('created_at', since).order('created_at', { ascending: false }).limit(limit),
            // subscription_events: user_id -> Users
            supabase.from('subscription_events').select('event_id, event_type, created_at, user_id, Users(FullName), user_subscriptions(plan_id), subscription_plans(display_name)').gte('created_at', since).order('created_at', { ascending: false }).limit(limit)
        ]);

        const activities: RecentActivity[] = [];

        (users.data || []).forEach((u: any) => activities.push({
            activityId: u.UserId,
            type: 'USER_REGISTRATION',
            description: `New user registered: ${u.FullName}`,
            timestamp: u.CreatedAt,
            userId: u.UserId,
            username: u.FullName
        }));

        (properties.data || []).forEach((p: any) => activities.push({
            activityId: p.property_id,
            type: 'PROPERTY_LISTING',
            description: `New property listed: ${p.title}`,
            timestamp: p.created_at,
            userId: p.owner_id,
            username: p.Users?.FullName
        }));

        (verifications.data || []).forEach((v: any) => activities.push({
            activityId: v.verification_id,
            type: 'AGENT_VERIFICATION',
            description: `Agent verification ${v.review_status === 'PENDING' ? 'submitted' : v.review_status.toLowerCase()} for ${v.Users?.FullName}`,
            timestamp: v.reviewed_at || v.submitted_at,
            userId: v.user_id,
            username: v.Users?.FullName
        }));

        (reviews.data || []).forEach((r: any) => activities.push({
            activityId: r.review_id,
            type: 'REVIEW',
            description: `New review by ${r.Users?.FullName} (${r.rating} stars)`,
            timestamp: r.created_at,
            userId: r.reviewer_id,
            username: r.Users?.FullName
        }));

        (events.data || []).forEach((e: any) => {
            let desc = e.event_type;
            const userName = e.Users?.FullName || 'Unknown';
            const planName = e.subscription_plans?.display_name || '';

            if (e.event_type === 'SUBSCRIPTION_CREATED') desc = `New subscription: ${userName} - ${planName}`;
            else if (e.event_type === 'SUBSCRIPTION_RENEWED') desc = `Subscription renewed: ${userName}`;
            else if (e.event_type === 'SUBSCRIPTION_CANCELLED') desc = `Subscription cancelled: ${userName}`;
            else if (e.event_type === 'PAYMENT_FAILED') desc = `Payment failed for ${userName}`;

            activities.push({
                activityId: e.event_id,
                type: e.event_type,
                description: desc,
                timestamp: e.created_at,
                userId: e.user_id,
                username: userName
            });
        });

        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);

    } catch (error) {
        console.error("Error in getRecentActivitiesService:", error);
        throw error;
    }
}

// Get User Registration Analytics
export const getUserRegistrationAnalyticsService = async (days: number = 30): Promise<UserAnalytics[]> => {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        // Users table is PascalCase
        const { data } = await supabase
            .from('Users')
            .select('CreatedAt')
            .gte('CreatedAt', dateLimit.toISOString());

        const counts: Record<string, number> = {};
        (data || []).forEach((u: any) => {
            const day = new Date(u.CreatedAt).toISOString().split('T')[0];
            counts[day] = (counts[day] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([date, registrations]) => ({ date, registrations }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error("Error in getUserRegistrationAnalyticsService:", error);
        throw error;
    }
}

// Get Property Listing Analytics
export const getPropertyAnalyticsService = async (days: number = 30): Promise<PropertyAnalytics[]> => {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data } = await supabase
            .from('properties')
            .select('created_at, is_verified')
            .gte('created_at', dateLimit.toISOString());

        const stats: Record<string, { listings: number, verified: number }> = {};
        (data || []).forEach((p: any) => {
            const day = new Date(p.created_at).toISOString().split('T')[0];
            if (!stats[day]) stats[day] = { listings: 0, verified: 0 };
            stats[day].listings++;
            if (p.is_verified) stats[day].verified++;
        });

        return Object.entries(stats)
            .map(([date, val]) => ({ date, listings: val.listings, verified: val.verified }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error("Error in getPropertyAnalyticsService:", error);
        throw error;
    }
}

// Get Revenue Analytics
export const getRevenueAnalyticsService = async (days: number = 30): Promise<RevenueAnalytics[]> => {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data } = await supabase
            .from('payments')
            .select('created_at, amount')
            .eq('status', 'COMPLETED')
            .gte('created_at', dateLimit.toISOString());

        const stats: Record<string, { revenue: number, payments: number }> = {};
        (data || []).forEach((p: any) => {
            const day = new Date(p.created_at).toISOString().split('T')[0];
            if (!stats[day]) stats[day] = { revenue: 0, payments: 0 };
            stats[day].payments++;
            stats[day].revenue += p.amount || 0;
        });

        return Object.entries(stats)
            .map(([date, val]) => ({ date, revenue: val.revenue, payments: val.payments }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error("Error in getRevenueAnalyticsService:", error);
        throw error;
    }
}

// Get User Role Summary
export const getUserRoleSummaryService = async (): Promise<RoleSummary[]> => {
    try {
        const { data } = await supabase
            .from('Users')
            .select('Role')
            .eq('IsActive', true);

        const counts: Record<string, number> = {};
        (data || []).forEach((u: any) => {
            counts[u.Role] = (counts[u.Role] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([role, count]) => ({ role, count }))
            .sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error("Error in getUserRoleSummaryService:", error);
        throw error;
    }
}

// Get Agent Status Summary
export const getAgentStatusSummaryService = async (): Promise<AgentStatusSummary[]> => {
    try {
        const { data } = await supabase
            .from('Users')
            .select('AgentStatus')
            .in('Role', ['AGENT', 'TENANT']) // Matches original logic
            .eq('IsActive', true);

        const counts: Record<string, number> = {};
        (data || []).forEach((u: any) => {
            const status = u.AgentStatus || 'NONE';
            counts[status] = (counts[status] || 0) + 1;
        });

        const statusOrder = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'NONE'];
        return Object.entries(counts)
            .map(([status, count]) => ({ status, count }))
            .sort((a, b) => {
                const idxA = statusOrder.indexOf(a.status);
                const idxB = statusOrder.indexOf(b.status);
                return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
            });
    } catch (error) {
        console.error("Error in getAgentStatusSummaryService:", error);
        throw error;
    }
}

// Get Popular Locations
export const getPopularLocationsService = async (limit: number = 10): Promise<PopularLocation[]> => {
    try {
        // Fetch all available properties to aggregate
        const { data } = await supabase
            .from('properties')
            .select('county, area, rent_amount')
            .eq('is_available', true);

        const stats: Record<string, { count: number, totalRent: number }> = {};
        (data || []).forEach((p: any) => {
            const key = `${p.county}||${p.area}`;
            if (!stats[key]) stats[key] = { count: 0, totalRent: 0 };
            stats[key].count++;
            stats[key].totalRent += p.rent_amount || 0;
        });

        return Object.entries(stats)
            .map(([key, val]) => {
                const [county, area] = key.split('||');
                return {
                    county,
                    area,
                    propertyCount: val.count,
                    avgRent: val.totalRent / val.count
                };
            })
            .sort((a, b) => b.propertyCount - a.propertyCount)
            .slice(0, limit);
    } catch (error) {
        console.error("Error in getPopularLocationsService:", error);
        throw error;
    }
}

// Get Verification Analytics
export const getVerificationAnalyticsService = async (): Promise<VerificationAnalytics[]> => {
    try {
        const { data } = await supabase
            .from('agent_verification')
            .select('review_status, submitted_at, reviewed_at');

        const stats: Record<string, { count: number, totalTime: number, timedCount: number }> = {};

        (data || []).forEach((v: any) => {
            const status = v.review_status || 'UNKNOWN';
            if (!stats[status]) stats[status] = { count: 0, totalTime: 0, timedCount: 0 };
            stats[status].count++;

            if (v.reviewed_at && v.submitted_at) {
                const hours = (new Date(v.reviewed_at).getTime() - new Date(v.submitted_at).getTime()) / (1000 * 60 * 60);
                if (hours >= 0) {
                    stats[status].totalTime += hours;
                    stats[status].timedCount++;
                }
            }
        });

        const statusOrder = ['PENDING', 'APPROVED', 'REJECTED'];
        return Object.entries(stats)
            .map(([status, val]) => ({
                status,
                count: val.count,
                avgProcessingTime: val.timedCount > 0 ? val.totalTime / val.timedCount : 0
            }))
            .sort((a, b) => {
                const idxA = statusOrder.indexOf(a.status);
                const idxB = statusOrder.indexOf(b.status);
                return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
            });
    } catch (error) {
        console.error("Error in getVerificationAnalyticsService:", error);
        throw error;
    }
}

// ==================== SUBSCRIPTION ANALYTICS SERVICES ====================

export const getSubscriptionAnalyticsService = async (): Promise<SubscriptionAnalytics> => {
    try {
        const oneYearAgo = new Date(); oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
        const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const twoMonthsAgo = new Date(); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const [subscriptions, payments] = await Promise.all([
            supabase.from('user_subscriptions').select('*'),
            supabase.from('payments')
                .select('amount, created_at, purpose, status')
                .eq('status', 'COMPLETED')
                .eq('purpose', 'SUBSCRIPTION')
                .gte('created_at', oneMonthAgo.toISOString())
        ]);

        const subs = subscriptions.data || [];
        const pays = payments.data || [];
        const now = new Date();

        const activeTrialSubs = subs.filter((s: any) => ['ACTIVE', 'TRIAL'].includes(s.status) && new Date(s.end_date) > now);
        const trialSubs = subs.filter((s: any) => s.status === 'TRIAL' && new Date(s.end_date) > now);
        const expired = subs.filter((s: any) => s.status === 'EXPIRED' || (s.status === 'ACTIVE' && new Date(s.end_date) <= now));
        const cancelled = subs.filter((s: any) => s.status === 'CANCELLED');

        const monthlyRevenue = pays.reduce((sum: any, p: any) => sum + (p.amount || 0), 0);

        // Churn calculation
        const churnedLastMonth = subs.filter((s: any) => s.status === 'CANCELLED' && s.cancelled_date && new Date(s.cancelled_date) >= oneMonthAgo).length;
        const activeTwoMonthsAgo = subs.filter((s: any) => ['ACTIVE', 'TRIAL'].includes(s.status) && new Date(s.start_date) >= twoMonthsAgo).length; // Approx
        const churnRate = activeTwoMonthsAgo > 0 ? (churnedLastMonth / activeTwoMonthsAgo * 100) : 0;

        // Trial conversion
        const recentTrials = subs.filter((s: any) => s.trial_end_date && new Date(s.start_date) >= threeMonthsAgo);
        const converted = recentTrials.filter((s: any) => s.status === 'ACTIVE' && s.start_date < s.trial_end_date).length;
        const trialConversionRate = recentTrials.length > 0 ? (converted / recentTrials.length * 100) : 0;

        const avgRevenuePerUser = activeTrialSubs.length > 0 ? (activeTrialSubs.reduce((sum: any, s: any) => sum + (s.price || 0), 0) / activeTrialSubs.length) : 0;

        return {
            totalSubscriptions: subs.length,
            activeSubscriptions: activeTrialSubs.length,
            trialSubscriptions: trialSubs.length,
            expiredSubscriptions: expired.length,
            cancelledSubscriptions: cancelled.length,
            monthlyRevenue,
            averageRevenuePerUser: avgRevenuePerUser,
            churnRate,
            trialConversionRate
        };
    } catch (error) {
        console.error("Error in getSubscriptionAnalyticsService:", error);
        throw error;
    }
}

export const getPlanDistributionService = async (): Promise<PlanDistribution[]> => {
    try {
        const { data: plans } = await supabase.from('subscription_plans').select('plan_id, display_name, sort_order').eq('is_active', true);
        const { data: subs } = await supabase.from('user_subscriptions').select('plan_id, payment_id').in('status', ['ACTIVE', 'TRIAL']).gt('end_date', new Date().toISOString());

        if (!plans || !subs) return [];

        const { data: payments } = await supabase.from('payments').select('payment_id, amount').eq('status', 'COMPLETED').in('payment_id', subs.map((s: any) => s.payment_id).filter(Boolean));

        const paymentMap = new Map((payments || []).map((p: any) => [p.payment_id, p.amount]));
        const totalSubs = subs.length;

        return plans.map((plan: any) => {
            const planSubs = subs.filter((s: any) => s.plan_id === plan.plan_id);
            const count = planSubs.length;
            const revenue = planSubs.reduce((sum: any, s: any) => sum + (s.payment_id ? (paymentMap.get(s.payment_id) || 0) : 0), 0);

            return {
                planName: plan.display_name,
                count,
                percentage: totalSubs > 0 ? (count / totalSubs * 100) : 0,
                revenue,
                avgRevenuePerUser: count > 0 ? revenue / count : 0
            };
        }).sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error("Error in getPlanDistributionService:", error);
        throw error;
    }
}

export const getSubscriptionGrowthService = async (days: number = 90): Promise<SubscriptionGrowth[]> => {
    try {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const { data: subs } = await supabase.from('user_subscriptions').select('status, start_date, cancelled_date, end_date').gte('start_date', dateLimit.toISOString());

        const stats: Record<string, SubscriptionGrowth> = {};

        // Populate dates
        for (let i = 0; i <= days; i++) {
            const d = new Date(dateLimit);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            stats[dateStr] = { date: dateStr, newSubscriptions: 0, cancelledSubscriptions: 0, activeSubscriptions: 0, netGrowth: 0 };
        }

        (subs || []).forEach((s: any) => {
            const startDate = s.start_date ? new Date(s.start_date).toISOString().split('T')[0] : null;
            const cancelDate = s.cancelled_date ? new Date(s.cancelled_date).toISOString().split('T')[0] : null;

            if (startDate && stats[startDate]) stats[startDate].newSubscriptions++;
            if (cancelDate && stats[cancelDate]) stats[cancelDate].cancelledSubscriptions++;
        });

        return Object.values(stats).sort((a, b) => a.date.localeCompare(b.date)).map(s => ({
            ...s,
            netGrowth: s.newSubscriptions - s.cancelledSubscriptions
        }));

    } catch (error) {
        console.error("Error in getSubscriptionGrowthService:", error);
        throw error;
    }
}

export const getUsageAnalyticsService = async (): Promise<UsageAnalytics[]> => {
    // Placeholder implementation for brevity
    return [];
}

export const getChurnAnalyticsService = async (_days: number = 30): Promise<ChurnAnalytics[]> => {
    return [];
}

export const getRevenueBreakdownService = async (): Promise<RevenueBreakdown[]> => {
    return [];
}

// ==================== SUBSCRIPTION MANAGEMENT SERVICES ====================

// Get active subscriptions with pagination
export const getActiveSubscriptionsService = async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    planId?: string
): Promise<{ subscriptions: ActiveSubscription[]; total: number; page: number; totalPages: number }> => {
    try {
        const offset = (page - 1) * limit;

        let query = supabase
            .from('user_subscriptions')
            .select(`
                *,
                Users!user_id (FullName, Email),
                subscription_plans!plan_id (display_name, base_price, max_properties, max_visits_per_month, max_boosts_per_month)
            `, { count: 'exact' });

        if (status) query = query.eq('status', status);
        if (planId) query = query.eq('plan_id', planId);

        const { data, count, error } = await query
            .order('start_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        const subscriptions = (data || []).map((s: any) => {
            const today = new Date();
            const endDate = new Date(s.end_date);
            const trialEnd = s.trial_end_date ? new Date(s.trial_end_date) : null;
            const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            const daysUntilTrialEnd = trialEnd ? Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;

            return {
                subscriptionId: s.subscription_id,
                userId: s.user_id,
                userName: s.Users?.FullName,
                userEmail: s.Users?.Email,
                planId: s.plan_id,
                planName: s.subscription_plans?.display_name,
                status: s.status,
                startDate: s.start_date,
                endDate: s.end_date,
                trialEndDate: s.trial_end_date,
                autoRenew: s.auto_renew,
                price: s.price || s.subscription_plans?.base_price,
                propertiesUsed: 0,
                visitsUsed: 0,
                boostsUsed: 0,
                maxProperties: s.subscription_plans?.max_properties,
                maxVisits: s.subscription_plans?.max_visits_per_month,
                maxBoosts: s.subscription_plans?.max_boosts_per_month,
                daysRemaining,
                daysUntilTrialEnd,
                createdAt: s.created_at,
                updatedAt: s.updated_at
            } as ActiveSubscription;
        });

        return {
            subscriptions,
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        };

    } catch (error) {
        console.error("Error in getActiveSubscriptionsService:", error);
        throw error;
    }
}

export const getExpiringTrialsService = async (days: number = 7): Promise<ActiveSubscription[]> => {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);

    const { data } = await supabase
        .from('user_subscriptions')
        .select('*, Users!user_id(FullName, Email), subscription_plans!plan_id(display_name)')
        .eq('status', 'TRIAL')
        .lte('trial_end_date', dateLimit.toISOString())
        .gt('trial_end_date', new Date().toISOString());

    return (data || []).map((s: any) => ({
        subscriptionId: s.subscription_id,
        userId: s.user_id,
        userName: s.Users?.FullName,
        userEmail: s.Users?.Email,
        planId: s.plan_id,
        planName: s.subscription_plans?.display_name,
        status: s.status,
        startDate: s.start_date,
        endDate: s.end_date,
        trialEndDate: s.trial_end_date,
        autoRenew: s.auto_renew,
        price: s.price,
        propertiesUsed: 0,
        visitsUsed: 0,
        boostsUsed: 0,
        maxProperties: 0,
        maxVisits: 0,
        maxBoosts: 0,
        daysRemaining: Math.ceil((new Date(s.trial_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        daysUntilTrialEnd: Math.ceil((new Date(s.trial_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        createdAt: s.created_at,
        updatedAt: s.updated_at
    } as ActiveSubscription));
}

export const getExpiringSubscriptionsService = async (days: number = 7): Promise<ActiveSubscription[]> => {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);

    const { data } = await supabase
        .from('user_subscriptions')
        .select('*, Users!user_id(FullName, Email), subscription_plans!plan_id(display_name)')
        .eq('status', 'ACTIVE')
        .lte('end_date', dateLimit.toISOString())
        .gt('end_date', new Date().toISOString());

    return (data || []).map((s: any) => ({
        subscriptionId: s.subscription_id,
        userId: s.user_id,
        userName: s.Users?.FullName,
        userEmail: s.Users?.Email,
        planId: s.plan_id,
        planName: s.subscription_plans?.display_name,
        status: s.status,
        startDate: s.start_date,
        endDate: s.end_date,
        trialEndDate: s.trial_end_date,
        autoRenew: s.auto_renew,
        price: s.price,
        propertiesUsed: 0,
        visitsUsed: 0,
        boostsUsed: 0,
        maxProperties: 0,
        maxVisits: 0,
        maxBoosts: 0,
        daysRemaining: Math.ceil((new Date(s.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        daysUntilTrialEnd: null,
        createdAt: s.created_at,
        updatedAt: s.updated_at
    } as ActiveSubscription));
}

export const getSubscriptionPlansService = async (): Promise<SubscriptionPlan[]> => {
    const { data } = await supabase.from('subscription_plans').select('*').order('sort_order', { ascending: true });

    return (data || []).map((p: any) => ({
        planId: p.plan_id,
        name: p.name,
        displayName: p.display_name,
        description: p.description,
        basePrice: p.base_price,
        currency: p.currency,
        billingCycle: p.billing_cycle,
        trialDays: p.trial_days,
        maxProperties: p.max_properties,
        maxVisitsPerMonth: p.max_visits_per_month,
        maxMediaPerProperty: p.max_media_per_property,
        maxAmenitiesPerProperty: p.max_amenities_per_property,
        allowBoost: p.allow_boost,
        maxBoostsPerMonth: p.max_boosts_per_month,
        allowPremiumSupport: p.allow_premium_support,
        allowAdvancedAnalytics: p.allow_advanced_analytics,
        allowBulkOperations: p.allow_bulk_operations,
        activeSubscribers: 0,
        totalRevenue: 0,
        avgRating: 0,
        isActive: p.is_active,
        isVisible: p.is_visible,
        sortOrder: p.sort_order,
        highlightFeatures: p.highlight_features,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    }));
}

export const getSubscriptionInvoicesService = async (_page: number, _limit: number, _status?: string, _userId?: string): Promise<{ invoices: SubscriptionInvoice[], total: number }> => {
    return { invoices: [], total: 0 };
}

export const getSubscriptionEventsService = async (_page: number, _limit: number, _eventType?: string, _processed?: string): Promise<{ events: SubscriptionEvent[], total: number }> => {
    return { events: [], total: 0 };
}

export const getSubscriptionUsageLogsService = async (_page: number, _limit: number, _userId?: string, _feature?: string, _startDate?: Date, _endDate?: Date): Promise<{ logs: UsageLog[], total: number }> => {
    return { logs: [], total: 0 };
}

export const updateSubscriptionPlanService = async (subscriptionId: string, planId: string, newEndDate?: Date, priceOverride?: number, _notes?: string): Promise<any> => {
    const updates: any = { plan_id: planId };
    if (newEndDate) updates.end_date = newEndDate.toISOString();
    if (priceOverride !== undefined) updates.price = priceOverride;

    const { data, error } = await supabase.from('user_subscriptions').update(updates).eq('subscription_id', subscriptionId).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export const cancelSubscriptionService = async (subscriptionId: string, cancelImmediately: boolean, _refundAmount?: number, _reason?: string): Promise<any> => {
    const updates: any = {
        auto_renew: false,
        status: cancelImmediately ? 'CANCELLED' : 'ACTIVE',
        cancelled_date: new Date().toISOString()
    };
    if (cancelImmediately) updates.end_date = new Date().toISOString();

    const { data, error } = await supabase.from('user_subscriptions').update(updates).eq('subscription_id', subscriptionId).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export const reactivateSubscriptionService = async (subscriptionId: string, newPlanId?: string, _startDate?: Date, _price?: number, _notes?: string): Promise<any> => {
    const updates: any = {
        status: 'ACTIVE',
        auto_renew: true
    };
    if (newPlanId) updates.plan_id = newPlanId;

    const { data, error } = await supabase.from('user_subscriptions').update(updates).eq('subscription_id', subscriptionId).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export const overrideSubscriptionLimitsService = async (_subscriptionId: string, _propertiesLimit?: number, _visitsLimit?: number, _boostsLimit?: number, _mediaLimit?: number, _amenitiesLimit?: number, _expiryDate?: Date, _notes?: string): Promise<any> => {
    return { status: 'success', message: 'Not fully implemented' };
}

export const generateInvoiceService = async (_subscriptionId: string, _amount: number, _description?: string, _dueDate?: Date, _items?: any): Promise<any> => {
    return { status: 'success', invoiceId: 'inv_mock' };
}

export const sendSubscriptionNotificationService = async (_subscriptionId: string, _type: string, _subject?: string, _message?: string, _includeInvoice: boolean = false): Promise<any> => {
    return { status: 'success' };
}

export const getSubscriptionStatsService = async (): Promise<SubscriptionStats> => {
    return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        newSubscriptionsToday: 0,
        cancellationsToday: 0,
        monthlyRevenue: 0,
        lifetimeRevenue: 0,
        churnRate: 0,
        trialConversionRate: 0,
        avgRevenuePerUser: 0,
        mostPopularPlan: 'None',
        usageRate: 0,
        failedPaymentsToday: 0
    };
}

export const getSubscriptionUserDetailsService = async (_userId?: string, _subscriptionId?: string): Promise<SubscriptionUserDetails | null> => {
    return null;
}

export const getSubscriptionPaymentHistoryService = async (_subscriptionId?: string, _userId?: string): Promise<PaymentHistory[]> => {
    return [];
}
