import { type Context } from 'hono';
export declare const getAdminDashboard: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        stats: {
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
        };
        activities: {
            activityId: string;
            type: string;
            description: string;
            timestamp: string;
            userId?: string | undefined;
            username?: string | undefined;
        }[];
        analytics: {
            user: {
                date: string;
                registrations: number;
            }[];
            property: {
                date: string;
                listings: number;
                verified: number;
            }[];
            revenue: {
                date: string;
                revenue: number;
                payments: number;
            }[];
            subscription: {
                totalSubscriptions: number;
                activeSubscriptions: number;
                trialSubscriptions: number;
                expiredSubscriptions: number;
                cancelledSubscriptions: number;
                monthlyRevenue: number;
                averageRevenuePerUser: number;
                churnRate: number;
                trialConversionRate: number;
            };
            planDistribution: {
                planName: string;
                count: number;
                percentage: number;
                revenue: number;
                avgRevenuePerUser: number;
            }[];
            subscriptionGrowth: {
                date: string;
                newSubscriptions: number;
                cancelledSubscriptions: number;
                activeSubscriptions: number;
                netGrowth: number;
            }[];
            usage: {
                planName: string;
                avgPropertiesUsed: number;
                avgVisitsUsed: number;
                avgBoostsUsed: number;
                maxProperties: number;
                maxVisitsPerMonth: number;
                maxBoostsPerMonth: number;
                usagePercentage: number;
            }[];
            churn: {
                date: string;
                newSubscribers: number;
                churnedSubscribers: number;
                churnRate: number;
                retentionRate: number;
            }[];
            revenueBreakdown: {
                planName: string;
                revenue: number;
                subscribers: number;
                avgRevenuePerSubscriber: number;
                percentage: number;
            }[];
        };
        summaries: {
            roles: {
                role: string;
                count: number;
            }[];
            agentStatus: {
                status: string;
                count: number;
            }[];
            verifications: {
                status: string;
                count: number;
                avgProcessingTime: number;
            }[];
        };
        popularLocations: {
            county: string;
            area: string;
            propertyCount: number;
            avgRent: number;
        }[];
        subscriptionAlerts: {
            expiringTrials: {
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
            }[];
            expiringSubscriptions: {
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
            }[];
        };
        subscriptionOverview: {
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
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getDashboardStats: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
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
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getRecentActivities: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        activityId: string;
        type: string;
        description: string;
        timestamp: string;
        userId?: string | undefined;
        username?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getUserAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        date: string;
        registrations: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getPropertyAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        date: string;
        listings: number;
        verified: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getRevenueAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        date: string;
        revenue: number;
        payments: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getUserRoleSummary: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        role: string;
        count: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getAgentStatusSummary: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        status: string;
        count: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getPopularLocations: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        county: string;
        area: string;
        propertyCount: number;
        avgRent: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getVerificationAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        status: string;
        count: number;
        avgProcessingTime: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalSubscriptions: number;
        activeSubscriptions: number;
        trialSubscriptions: number;
        expiredSubscriptions: number;
        cancelledSubscriptions: number;
        monthlyRevenue: number;
        averageRevenuePerUser: number;
        churnRate: number;
        trialConversionRate: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getPlanDistribution: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        planName: string;
        count: number;
        percentage: number;
        revenue: number;
        avgRevenuePerUser: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionGrowth: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        date: string;
        newSubscriptions: number;
        cancelledSubscriptions: number;
        activeSubscriptions: number;
        netGrowth: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getUsageAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        planName: string;
        avgPropertiesUsed: number;
        avgVisitsUsed: number;
        avgBoostsUsed: number;
        maxProperties: number;
        maxVisitsPerMonth: number;
        maxBoostsPerMonth: number;
        usagePercentage: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getChurnAnalytics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        date: string;
        newSubscribers: number;
        churnedSubscribers: number;
        churnRate: number;
        retentionRate: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getRevenueBreakdown: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        planName: string;
        revenue: number;
        subscribers: number;
        avgRevenuePerSubscriber: number;
        percentage: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getActiveSubscriptions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        subscriptions: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getExpiringTrials: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
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
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getExpiringSubscriptions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
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
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionPlans: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        planId: string;
        name: string;
        displayName: string;
        price?: number | undefined;
        basePrice: number;
        currency: string;
        description: string;
        features?: string[] | undefined;
        isActive: boolean;
        billingCycle: string;
        propertiesLimit?: number | undefined;
        visitsLimit?: number | undefined;
        boostsLimit?: number | undefined;
        mediaLimit?: number | undefined;
        amenitiesLimit?: number | undefined;
        trialDays: number;
        maxProperties: number;
        maxVisitsPerMonth: number;
        maxMediaPerProperty: number;
        maxAmenitiesPerProperty: number;
        allowBoost: boolean;
        maxBoostsPerMonth: number;
        allowPremiumSupport: boolean;
        allowAdvancedAnalytics: boolean;
        allowBulkOperations: boolean;
        activeSubscribers: number;
        totalRevenue: number;
        avgRating: number;
        isVisible: boolean;
        sortOrder: number;
        highlightFeatures: string[];
        createdAt: string;
        updatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionInvoices: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        invoices: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionEvents: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        events: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionUsageLogs: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        logs: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const updateSubscriptionPlan: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: any;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const cancelSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: any;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const reactivateSubscription: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: any;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const overrideSubscriptionLimits: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: any;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const generateInvoice: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: any;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const sendSubscriptionNotification: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: any;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionStats: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
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
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionUserDetails: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        userId: string;
        userName: string;
        userEmail: string;
        userRole: string;
        currentSubscription: {
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
        } | null;
        subscriptionHistory: {
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
        }[];
        paymentHistory: {
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
        }[];
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
        featureGates: {
            feature: string;
            gateType: string;
            triggerLimit: number;
            triggerCount: number;
            isActive: boolean;
        }[];
        nextBillingDate: string | null;
        totalSpent: number;
        joinedDate: string;
    } | null;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionPaymentHistory: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
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
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getQuickStats: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalUsers: number;
        totalProperties: number;
        activeVisits: number;
        totalRevenue: number;
        pendingVerifications: number;
        subscriptionStats: {
            activeSubscriptions: number;
            trialSubscriptions: number;
            monthlyRevenue: number;
            expiringTrials: number;
            expiringSubscriptions: number;
        };
        recentActivities: {
            activityId: string;
            type: string;
            description: string;
            timestamp: string;
            userId?: string | undefined;
            username?: string | undefined;
        }[];
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSystemOverview: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        overview: {
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
        };
        userDistribution: {
            role: string;
            count: number;
        }[];
        agentStatus: {
            status: string;
            count: number;
        }[];
        verificationStatus: {
            status: string;
            count: number;
            avgProcessingTime: number;
        }[];
        subscriptionOverview: {
            totalSubscriptions: number;
            activeSubscriptions: number;
            trialSubscriptions: number;
            expiredSubscriptions: number;
            cancelledSubscriptions: number;
            monthlyRevenue: number;
            averageRevenuePerUser: number;
            churnRate: number;
            trialConversionRate: number;
        };
        planDistribution: {
            planName: string;
            count: number;
            percentage: number;
            revenue: number;
            avgRevenuePerUser: number;
        }[];
        churnRate: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const exportSubscriptionData: (c: Context) => Promise<(Response & import("hono").TypedResponse<string, import("hono/utils/http-status").ContentfulStatusCode, "text">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        subscriptions: {
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
        }[];
        invoices: {
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
        }[];
        usageLogs: {
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
        }[];
        exportedAt: string;
        exportFormat: string;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getSubscriptionHealthCheck: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        status: string;
        issues: string[];
        warnings: string[];
        stats: {
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
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=adminController.d.ts.map