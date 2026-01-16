import { getDashboardStatsService, getRecentActivitiesService, getUserRegistrationAnalyticsService, getPropertyAnalyticsService, getRevenueAnalyticsService, getUserRoleSummaryService, getAgentStatusSummaryService, getPopularLocationsService, getVerificationAnalyticsService, getSubscriptionAnalyticsService, getPlanDistributionService, getSubscriptionGrowthService, getUsageAnalyticsService, getChurnAnalyticsService, getRevenueBreakdownService, getActiveSubscriptionsService, getExpiringTrialsService, getExpiringSubscriptionsService, getSubscriptionPlansService, getSubscriptionInvoicesService, getSubscriptionEventsService, getSubscriptionUsageLogsService, updateSubscriptionPlanService, cancelSubscriptionService, reactivateSubscriptionService, overrideSubscriptionLimitsService, generateInvoiceService, sendSubscriptionNotificationService, getSubscriptionStatsService, getSubscriptionUserDetailsService, getSubscriptionPaymentHistoryService,
// type SubscriptionUserDetails,
// type PaymentHistory
 } from "./adminService.js";
// Get complete admin dashboard data
export const getAdminDashboard = async (c) => {
    try {
        const [stats, activities, userAnalytics, propertyAnalytics, revenueAnalytics, roleSummary, agentStatusSummary, popularLocations, verificationAnalytics, subscriptionAnalytics, planDistribution, subscriptionGrowth, usageAnalytics, churnAnalytics, revenueBreakdown, expiringTrials, expiringSubscriptions, subscriptionStats] = await Promise.all([
            getDashboardStatsService(),
            getRecentActivitiesService(15),
            getUserRegistrationAnalyticsService(30),
            getPropertyAnalyticsService(30),
            getRevenueAnalyticsService(30),
            getUserRoleSummaryService(),
            getAgentStatusSummaryService(),
            getPopularLocationsService(10),
            getVerificationAnalyticsService(),
            getSubscriptionAnalyticsService(),
            getPlanDistributionService(),
            getSubscriptionGrowthService(30),
            getUsageAnalyticsService(),
            getChurnAnalyticsService(30),
            getRevenueBreakdownService(),
            getExpiringTrialsService(7),
            getExpiringSubscriptionsService(7),
            getSubscriptionStatsService()
        ]);
        return c.json({
            success: true,
            data: {
                stats,
                activities,
                analytics: {
                    user: userAnalytics,
                    property: propertyAnalytics,
                    revenue: revenueAnalytics,
                    subscription: subscriptionAnalytics,
                    planDistribution,
                    subscriptionGrowth,
                    usage: usageAnalytics,
                    churn: churnAnalytics,
                    revenueBreakdown
                },
                summaries: {
                    roles: roleSummary,
                    agentStatus: agentStatusSummary,
                    verifications: verificationAnalytics
                },
                popularLocations,
                subscriptionAlerts: {
                    expiringTrials,
                    expiringSubscriptions
                },
                subscriptionOverview: subscriptionStats
            }
        });
    }
    catch (error) {
        console.error("Admin dashboard error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch admin dashboard data",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get dashboard statistics only
export const getDashboardStats = async (c) => {
    try {
        const stats = await getDashboardStatsService();
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error("Dashboard stats error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get recent activities
export const getRecentActivities = async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '15');
        const activities = await getRecentActivitiesService(limit);
        return c.json({
            success: true,
            data: activities
        });
    }
    catch (error) {
        console.error("Recent activities error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch recent activities",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get user analytics
export const getUserAnalytics = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '30');
        const analytics = await getUserRegistrationAnalyticsService(days);
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("User analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch user analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get property analytics
export const getPropertyAnalytics = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '30');
        const analytics = await getPropertyAnalyticsService(days);
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Property analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch property analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get revenue analytics
export const getRevenueAnalytics = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '30');
        const analytics = await getRevenueAnalyticsService(days);
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Revenue analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch revenue analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get user role summary
export const getUserRoleSummary = async (c) => {
    try {
        const summary = await getUserRoleSummaryService();
        return c.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error("User role summary error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch user role summary",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get agent status summary
export const getAgentStatusSummary = async (c) => {
    try {
        const summary = await getAgentStatusSummaryService();
        return c.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error("Agent status summary error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch agent status summary",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get popular locations
export const getPopularLocations = async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '10');
        const locations = await getPopularLocationsService(limit);
        return c.json({
            success: true,
            data: locations
        });
    }
    catch (error) {
        console.error("Popular locations error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch popular locations",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get verification analytics
export const getVerificationAnalytics = async (c) => {
    try {
        const analytics = await getVerificationAnalyticsService();
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Verification analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch verification analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// SUBSCRIPTION MANAGEMENT CONTROLLERS
// Get subscription analytics
export const getSubscriptionAnalytics = async (c) => {
    try {
        const analytics = await getSubscriptionAnalyticsService();
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Subscription analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get plan distribution
export const getPlanDistribution = async (c) => {
    try {
        const distribution = await getPlanDistributionService();
        return c.json({
            success: true,
            data: distribution
        });
    }
    catch (error) {
        console.error("Plan distribution error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch plan distribution",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription growth
export const getSubscriptionGrowth = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '90');
        const growth = await getSubscriptionGrowthService(days);
        return c.json({
            success: true,
            data: growth
        });
    }
    catch (error) {
        console.error("Subscription growth error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription growth",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get usage analytics
export const getUsageAnalytics = async (c) => {
    try {
        const analytics = await getUsageAnalyticsService();
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Usage analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch usage analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get churn analytics
export const getChurnAnalytics = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '30');
        const analytics = await getChurnAnalyticsService(days);
        return c.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Churn analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch churn analytics",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get revenue breakdown
export const getRevenueBreakdown = async (c) => {
    try {
        const breakdown = await getRevenueBreakdownService();
        return c.json({
            success: true,
            data: breakdown
        });
    }
    catch (error) {
        console.error("Revenue breakdown error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch revenue breakdown",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get active subscriptions list
export const getActiveSubscriptions = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const status = c.req.query('status') || undefined;
        const planId = c.req.query('planId') || undefined;
        const result = await getActiveSubscriptionsService(page, limit, status, planId);
        return c.json({
            success: true,
            data: {
                subscriptions: result.subscriptions,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error("Active subscriptions error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch active subscriptions",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get expiring trials
export const getExpiringTrials = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');
        const trials = await getExpiringTrialsService(days);
        return c.json({
            success: true,
            data: trials
        });
    }
    catch (error) {
        console.error("Expiring trials error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch expiring trials",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get expiring subscriptions
export const getExpiringSubscriptions = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');
        const subscriptions = await getExpiringSubscriptionsService(days);
        return c.json({
            success: true,
            data: subscriptions
        });
    }
    catch (error) {
        console.error("Expiring subscriptions error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch expiring subscriptions",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get all subscription plans
export const getSubscriptionPlans = async (c) => {
    try {
        const plans = await getSubscriptionPlansService();
        return c.json({
            success: true,
            data: plans
        });
    }
    catch (error) {
        console.error("Subscription plans error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription plans",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription invoices
export const getSubscriptionInvoices = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const status = c.req.query('status') || undefined;
        const userId = c.req.query('userId') || undefined;
        const result = await getSubscriptionInvoicesService(page, limit, status, userId);
        return c.json({
            success: true,
            data: {
                invoices: result.invoices,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error("Subscription invoices error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription invoices",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription events
export const getSubscriptionEvents = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const eventType = c.req.query('eventType') || undefined;
        const processed = c.req.query('processed') || undefined;
        const result = await getSubscriptionEventsService(page, limit, eventType, processed);
        return c.json({
            success: true,
            data: {
                events: result.events,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error("Subscription events error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription events",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription usage logs
export const getSubscriptionUsageLogs = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const userId = c.req.query('userId') || undefined;
        const feature = c.req.query('feature') || undefined;
        const startDate = c.req.query('startDate');
        const endDate = c.req.query('endDate');
        const result = await getSubscriptionUsageLogsService(page, limit, userId, feature, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        return c.json({
            success: true,
            data: {
                logs: result.logs,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error("Subscription usage logs error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription usage logs",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
//heeey
// Update subscription plan
export const updateSubscriptionPlan = async (c) => {
    try {
        const body = await c.req.json();
        const { subscriptionId, planId, newEndDate, priceOverride, notes } = body;
        if (!subscriptionId || !planId) {
            return c.json({
                success: false,
                message: "subscriptionId and planId are required"
            }, 400);
        }
        const result = await updateSubscriptionPlanService(subscriptionId, planId, newEndDate ? new Date(newEndDate) : undefined, priceOverride, notes);
        return c.json({
            success: true,
            data: result,
            message: "Subscription plan updated successfully"
        });
    }
    catch (error) {
        console.error("Update subscription plan error:", error);
        return c.json({
            success: false,
            message: "Failed to update subscription plan",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Cancel subscription
export const cancelSubscription = async (c) => {
    try {
        const body = await c.req.json();
        const { subscriptionId, cancelImmediately, refundAmount, reason } = body;
        if (!subscriptionId) {
            return c.json({
                success: false,
                message: "subscriptionId is required"
            }, 400);
        }
        const result = await cancelSubscriptionService(subscriptionId, cancelImmediately || false, refundAmount, reason);
        return c.json({
            success: true,
            data: result,
            message: cancelImmediately ?
                "Subscription cancelled immediately" :
                "Subscription will cancel at period end"
        });
    }
    catch (error) {
        console.error("Cancel subscription error:", error);
        return c.json({
            success: false,
            message: "Failed to cancel subscription",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Reactivate subscription
export const reactivateSubscription = async (c) => {
    try {
        const body = await c.req.json();
        const { subscriptionId, newPlanId, startDate, price, notes } = body;
        if (!subscriptionId) {
            return c.json({
                success: false,
                message: "subscriptionId is required"
            }, 400);
        }
        const result = await reactivateSubscriptionService(subscriptionId, newPlanId, startDate ? new Date(startDate) : undefined, price, notes);
        return c.json({
            success: true,
            data: result,
            message: "Subscription reactivated successfully"
        });
    }
    catch (error) {
        console.error("Reactivate subscription error:", error);
        return c.json({
            success: false,
            message: "Failed to reactivate subscription",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Override subscription limits
export const overrideSubscriptionLimits = async (c) => {
    try {
        const body = await c.req.json();
        const { subscriptionId, propertiesLimit, visitsLimit, boostsLimit, mediaLimit, amenitiesLimit, expiryDate, notes } = body;
        if (!subscriptionId) {
            return c.json({
                success: false,
                message: "subscriptionId is required"
            }, 400);
        }
        const result = await overrideSubscriptionLimitsService(subscriptionId, propertiesLimit, visitsLimit, boostsLimit, mediaLimit, amenitiesLimit, expiryDate ? new Date(expiryDate) : undefined, notes);
        return c.json({
            success: true,
            data: result,
            message: "Subscription limits overridden successfully"
        });
    }
    catch (error) {
        console.error("Override subscription limits error:", error);
        return c.json({
            success: false,
            message: "Failed to override subscription limits",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Generate invoice
export const generateInvoice = async (c) => {
    try {
        const body = await c.req.json();
        const { subscriptionId, amount, description, dueDate, items } = body;
        if (!subscriptionId || !amount) {
            return c.json({
                success: false,
                message: "subscriptionId and amount are required"
            }, 400);
        }
        const result = await generateInvoiceService(subscriptionId, amount, description, dueDate ? new Date(dueDate) : undefined, items);
        return c.json({
            success: true,
            data: result,
            message: "Invoice generated successfully"
        });
    }
    catch (error) {
        console.error("Generate invoice error:", error);
        return c.json({
            success: false,
            message: "Failed to generate invoice",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Send subscription notification
export const sendSubscriptionNotification = async (c) => {
    try {
        const body = await c.req.json();
        const { subscriptionId, notificationType, subject, message, includeInvoice } = body;
        if (!subscriptionId || !notificationType) {
            return c.json({
                success: false,
                message: "subscriptionId and notificationType are required"
            }, 400);
        }
        const result = await sendSubscriptionNotificationService(subscriptionId, notificationType, subject, message, includeInvoice || false);
        return c.json({
            success: true,
            data: result,
            message: "Notification sent successfully"
        });
    }
    catch (error) {
        console.error("Send subscription notification error:", error);
        return c.json({
            success: false,
            message: "Failed to send notification",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription stats
export const getSubscriptionStats = async (c) => {
    try {
        const stats = await getSubscriptionStatsService();
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error("Subscription stats error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription stats",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription user details
export const getSubscriptionUserDetails = async (c) => {
    try {
        const userId = c.req.query('userId') || undefined;
        const subscriptionId = c.req.query('subscriptionId') || undefined;
        if (!userId && !subscriptionId) {
            return c.json({
                success: false,
                message: "Either userId or subscriptionId is required"
            }, 400);
        }
        const details = await getSubscriptionUserDetailsService(userId, subscriptionId);
        return c.json({
            success: true,
            data: details
        });
    }
    catch (error) {
        console.error("Subscription user details error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch subscription user details",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription payment history
export const getSubscriptionPaymentHistory = async (c) => {
    try {
        const subscriptionId = c.req.query('subscriptionId') || undefined;
        const userId = c.req.query('userId') || undefined;
        if (!subscriptionId && !userId) {
            return c.json({
                success: false,
                message: "Either subscriptionId or userId is required"
            }, 400);
        }
        const history = await getSubscriptionPaymentHistoryService(subscriptionId, userId);
        return c.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error("Subscription payment history error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch payment history",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Quick stats for dashboard widgets
export const getQuickStats = async (c) => {
    try {
        const [stats, activities, pendingVerifications, subscriptionStats, expiringTrials, expiringSubscriptions] = await Promise.all([
            getDashboardStatsService(),
            getRecentActivitiesService(5),
            getAgentStatusSummaryService(),
            getSubscriptionStatsService(),
            getExpiringTrialsService(7),
            getExpiringSubscriptionsService(7)
        ]);
        const pendingCount = pendingVerifications.find(v => v.status === 'PENDING')?.count || 0;
        return c.json({
            success: true,
            data: {
                totalUsers: stats.totalUsers,
                totalProperties: stats.totalProperties,
                activeVisits: stats.activeVisits,
                totalRevenue: stats.totalRevenue,
                pendingVerifications: pendingCount,
                subscriptionStats: {
                    activeSubscriptions: subscriptionStats.activeSubscriptions,
                    trialSubscriptions: subscriptionStats.trialSubscriptions,
                    monthlyRevenue: subscriptionStats.monthlyRevenue,
                    expiringTrials: expiringTrials.length,
                    expiringSubscriptions: expiringSubscriptions.length
                },
                recentActivities: activities.slice(0, 5)
            }
        });
    }
    catch (error) {
        console.error("Quick stats error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch quick stats",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// System overview
export const getSystemOverview = async (c) => {
    try {
        const [stats, roleSummary, agentStatusSummary, verificationAnalytics, subscriptionAnalytics, planDistribution, churnAnalytics] = await Promise.all([
            getDashboardStatsService(),
            getUserRoleSummaryService(),
            getAgentStatusSummaryService(),
            getVerificationAnalyticsService(),
            getSubscriptionAnalyticsService(),
            getPlanDistributionService(),
            getChurnAnalyticsService(30)
        ]);
        return c.json({
            success: true,
            data: {
                overview: stats,
                userDistribution: roleSummary,
                agentStatus: agentStatusSummary,
                verificationStatus: verificationAnalytics,
                subscriptionOverview: subscriptionAnalytics,
                planDistribution: planDistribution,
                churnRate: churnAnalytics[churnAnalytics.length - 1]?.churnRate || 0
            }
        });
    }
    catch (error) {
        console.error("System overview error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch system overview",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Export subscription data (for reports)
export const exportSubscriptionData = async (c) => {
    try {
        const format = c.req.query('format') || 'csv';
        // This would typically generate a CSV/Excel file
        // For now, return JSON data that can be converted
        const [subscriptions, invoices, usageLogs] = await Promise.all([
            getActiveSubscriptionsService(1, 1000), // Get all subscriptions
            getSubscriptionInvoicesService(1, 1000),
            getSubscriptionUsageLogsService(1, 1000)
        ]);
        const data = {
            subscriptions: subscriptions.subscriptions,
            invoices: invoices.invoices,
            usageLogs: usageLogs.logs,
            exportedAt: new Date().toISOString(),
            exportFormat: format
        };
        if (format === 'csv') {
            // Set CSV headers
            c.header('Content-Type', 'text/csv');
            c.header('Content-Disposition', `attachment; filename="subscriptions_export_${Date.now()}.csv"`);
            // Generate CSV (simplified example)
            let csv = 'Subscription ID,User ID,User Name,Plan Name,Status,Start Date,End Date,Price\n';
            for (const sub of subscriptions.subscriptions) {
                csv += `"${sub.subscriptionId}","${sub.userId}","${sub.userName}","${sub.planName}","${sub.status}","${sub.startDate}","${sub.endDate}",${sub.price}\n`;
            }
            return c.text(csv);
        }
        return c.json({
            success: true,
            data: data,
            message: "Data exported successfully"
        });
    }
    catch (error) {
        console.error("Export subscription data error:", error);
        return c.json({
            success: false,
            message: "Failed to export subscription data",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
// Get subscription health check
export const getSubscriptionHealthCheck = async (c) => {
    try {
        const [stats, expiringTrials, expiringSubscriptions, failedPayments] = await Promise.all([
            getSubscriptionStatsService(),
            getExpiringTrialsService(3), // Trials expiring in 3 days
            getExpiringSubscriptionsService(3), // Subscriptions expiring in 3 days
            getSubscriptionEventsService(1, 50, 'PAYMENT_FAILED', '0') // Recent failed payments
        ]);
        const health = {
            status: 'HEALTHY',
            issues: [],
            warnings: [],
            stats: stats
        };
        // Check for issues
        if (expiringTrials.length > 10) {
            health.status = 'WARNING';
            health.warnings.push(`High number of expiring trials: ${expiringTrials.length}`);
        }
        if (expiringSubscriptions.length > 5) {
            health.status = 'WARNING';
            health.warnings.push(`High number of expiring subscriptions: ${expiringSubscriptions.length}`);
        }
        if (failedPayments.total > 10) {
            health.status = 'ISSUE';
            health.issues.push(`Multiple failed payments detected: ${failedPayments.total}`);
        }
        if (stats.churnRate > 15) {
            health.status = 'ISSUE';
            health.issues.push(`High churn rate detected: ${stats.churnRate}%`);
        }
        else if (stats.churnRate > 10) {
            health.status = 'WARNING';
            health.warnings.push(`Elevated churn rate: ${stats.churnRate}%`);
        }
        return c.json({
            success: true,
            data: health
        });
    }
    catch (error) {
        console.error("Subscription health check error:", error);
        return c.json({
            success: false,
            message: "Failed to perform health check",
            error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
    }
};
//# sourceMappingURL=adminController.js.map