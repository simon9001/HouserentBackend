// admin/adminRoutes.ts
import { Hono } from 'hono'
import * as adminControllers from './adminController.js'

const adminRoutes = new Hono()

// Apply admin middleware
// adminRoutes.use('*', verifyAdmin)

// Main dashboard endpoints
adminRoutes.get('/admin/dashboard', adminControllers.getAdminDashboard)
adminRoutes.get('/dashboard/quick-stats', adminControllers.getQuickStats)
adminRoutes.get('/dashboard/overview', adminControllers.getSystemOverview)

// Core analytics endpoints
adminRoutes.get('/dashboard/stats', adminControllers.getDashboardStats)
adminRoutes.get('/dashboard/activities', adminControllers.getRecentActivities)
adminRoutes.get('/dashboard/analytics/users', adminControllers.getUserAnalytics)
adminRoutes.get('/dashboard/analytics/properties', adminControllers.getPropertyAnalytics)
adminRoutes.get('/dashboard/analytics/revenue', adminControllers.getRevenueAnalytics)

// Subscription analytics endpoints
adminRoutes.get('/dashboard/analytics/subscriptions', adminControllers.getSubscriptionAnalytics)
adminRoutes.get('/dashboard/analytics/plan-distribution', adminControllers.getPlanDistribution)
adminRoutes.get('/dashboard/analytics/subscription-growth', adminControllers.getSubscriptionGrowth)
adminRoutes.get('/dashboard/analytics/usage', adminControllers.getUsageAnalytics)
adminRoutes.get('/dashboard/analytics/churn', adminControllers.getChurnAnalytics)
adminRoutes.get('/dashboard/analytics/revenue-breakdown', adminControllers.getRevenueBreakdown)

// Subscription management endpoints
adminRoutes.get('/subscriptions/active', adminControllers.getActiveSubscriptions)
adminRoutes.get('/subscriptions/expiring-trials', adminControllers.getExpiringTrials)
adminRoutes.get('/subscriptions/expiring', adminControllers.getExpiringSubscriptions)

// Summary endpoints
adminRoutes.get('/dashboard/summary/roles', adminControllers.getUserRoleSummary)
adminRoutes.get('/dashboard/summary/agent-status', adminControllers.getAgentStatusSummary)
adminRoutes.get('/dashboard/summary/verifications', adminControllers.getVerificationAnalytics)

// Location insights
adminRoutes.get('/dashboard/locations/popular', adminControllers.getPopularLocations)

export default adminRoutes