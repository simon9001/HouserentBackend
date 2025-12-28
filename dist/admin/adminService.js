// admin/adminService.ts
import { getConnectionPool } from "../Database/config.js";
let getDbPool = getConnectionPool;
// ==================== CORE DASHBOARD SERVICES ====================
// Get Dashboard Statistics
export const getDashboardStatsService = async () => {
    const db = await getDbPool();
    try {
        const [totalUsersResult, totalPropertiesResult, activeVisitsResult, totalRevenueResult, pendingVerificationsResult, availablePropertiesResult, verifiedPropertiesResult, totalReviewsResult, activeSubscriptionsResult, monthlyRevenueResult] = await Promise.all([
            db.request().query(`SELECT COUNT(*) as count FROM Users WHERE IsActive = 1`),
            db.request().query(`SELECT COUNT(*) as count FROM Properties`),
            db.request().query(`SELECT COUNT(*) as count FROM PropertyVisits WHERE Status = 'CHECKED_IN'`),
            db.request().query(`
                SELECT ISNULL(SUM(Amount), 0) as revenue 
                FROM Payments 
                WHERE Status = 'COMPLETED'
                AND Purpose = 'SUBSCRIPTION'
            `),
            db.request().query(`
                SELECT COUNT(*) as count 
                FROM AgentVerification 
                WHERE ReviewStatus = 'PENDING'
            `),
            db.request().query(`
                SELECT COUNT(*) as count 
                FROM Properties 
                WHERE IsAvailable = 1
            `),
            db.request().query(`
                SELECT COUNT(*) as count 
                FROM Properties 
                WHERE IsVerified = 1
            `),
            db.request().query(`SELECT COUNT(*) as count FROM Reviews`),
            db.request().query(`
                SELECT COUNT(*) as count 
                FROM UserSubscriptions 
                WHERE Status IN ('ACTIVE', 'TRIAL') 
                AND EndDate > GETDATE()
            `),
            db.request().query(`
                SELECT ISNULL(SUM(Amount), 0) as revenue 
                FROM Payments 
                WHERE Status = 'COMPLETED'
                AND Purpose = 'SUBSCRIPTION'
                AND MONTH(CreatedAt) = MONTH(GETDATE())
                AND YEAR(CreatedAt) = YEAR(GETDATE())
            `)
        ]);
        return {
            totalUsers: parseInt(totalUsersResult.recordset[0].count),
            totalProperties: parseInt(totalPropertiesResult.recordset[0].count),
            activeVisits: parseInt(activeVisitsResult.recordset[0].count),
            totalRevenue: parseFloat(totalRevenueResult.recordset[0].revenue) || 0,
            pendingVerifications: parseInt(pendingVerificationsResult.recordset[0].count),
            availableProperties: parseInt(availablePropertiesResult.recordset[0].count),
            verifiedProperties: parseInt(verifiedPropertiesResult.recordset[0].count),
            totalReviews: parseInt(totalReviewsResult.recordset[0].count),
            activeSubscriptions: parseInt(activeSubscriptionsResult.recordset[0].count),
            monthlyRevenue: parseFloat(monthlyRevenueResult.recordset[0].revenue) || 0
        };
    }
    catch (error) {
        console.error("Error in getDashboardStatsService:", error);
        throw error;
    }
};
// Get Recent Activities
export const getRecentActivitiesService = async (limit = 10) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT TOP(@limit)
                ActivityId as activityId,
                ActivityType as type,
                Description as description,
                CreatedAt as timestamp,
                UserId,
                Username
            FROM (
                -- User registrations
                SELECT 
                    UserId as ActivityId,
                    'USER_REGISTRATION' as ActivityType,
                    CONCAT('New user registered: ', FullName) as Description,
                    CreatedAt,
                    UserId,
                    FullName as Username
                FROM Users 
                WHERE CreatedAt >= DATEADD(day, -7, GETDATE())
                
                UNION ALL
                
                -- Property listings
                SELECT 
                    PropertyId as ActivityId,
                    'PROPERTY_LISTING' as ActivityType,
                    CONCAT('New property listed: ', Title) as Description,
                    p.CreatedAt,
                    OwnerId as UserId,
                    u.FullName as Username
                FROM Properties p
                INNER JOIN Users u ON p.OwnerId = u.UserId
                WHERE p.CreatedAt >= DATEADD(day, -7, GETDATE())
                
                UNION ALL
                
                -- Agent verifications
                SELECT 
                    VerificationId as ActivityId,
                    'AGENT_VERIFICATION' as ActivityType,
                    CONCAT('Agent verification ', 
                           CASE WHEN ReviewStatus = 'PENDING' THEN 'submitted' 
                                WHEN ReviewStatus = 'APPROVED' THEN 'approved' 
                                ELSE 'rejected' END,
                           ' for ', u.FullName) as Description,
                    COALESCE(av.ReviewedAt, av.SubmittedAt) as CreatedAt,
                    av.UserId,
                    u.FullName as Username
                FROM AgentVerification av
                INNER JOIN Users u ON av.UserId = u.UserId
                WHERE av.SubmittedAt >= DATEADD(day, -7, GETDATE())
                
                UNION ALL
                
                -- Reviews
                SELECT 
                    ReviewId as ActivityId,
                    'REVIEW' as ActivityType,
                    CONCAT('New review by ', u.FullName, ' (', r.Rating, ' stars)') as Description,
                    r.CreatedAt,
                    r.ReviewerId as UserId,
                    u.FullName as Username
                FROM Reviews r
                INNER JOIN Users u ON r.ReviewerId = u.UserId
                WHERE r.CreatedAt >= DATEADD(day, -7, GETDATE())
                
                UNION ALL
                
                -- Subscription events
                SELECT 
                    se.EventId as ActivityId,
                    se.EventType as ActivityType,
                    CASE se.EventType
                        WHEN 'SUBSCRIPTION_CREATED' THEN CONCAT('New subscription: ', u.FullName, ' - ', sp.DisplayName)
                        WHEN 'SUBSCRIPTION_RENEWED' THEN CONCAT('Subscription renewed: ', u.FullName)
                        WHEN 'SUBSCRIPTION_CANCELLED' THEN CONCAT('Subscription cancelled: ', u.FullName)
                        WHEN 'PAYMENT_FAILED' THEN CONCAT('Payment failed for ', u.FullName)
                        ELSE se.EventType
                    END as Description,
                    se.CreatedAt,
                    se.UserId,
                    u.FullName as Username
                FROM SubscriptionEvents se
                INNER JOIN Users u ON se.UserId = u.UserId
                LEFT JOIN UserSubscriptions us ON se.SubscriptionId = us.SubscriptionId
                LEFT JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
                WHERE se.CreatedAt >= DATEADD(day, -7, GETDATE())
            ) AS Activities
            ORDER BY timestamp DESC
        `;
        const result = await db.request()
            .input('limit', limit)
            .query(query);
        return result.recordset;
    }
    catch (error) {
        console.error("Error in getRecentActivitiesService:", error);
        throw error;
    }
};
// Get User Registration Analytics
export const getUserRegistrationAnalyticsService = async (days = 30) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                CAST(CreatedAt AS DATE) as date,
                COUNT(*) as registrations
            FROM Users 
            WHERE CreatedAt >= DATEADD(day, -@days, GETDATE())
            GROUP BY CAST(CreatedAt AS DATE)
            ORDER BY date ASC
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset;
    }
    catch (error) {
        console.error("Error in getUserRegistrationAnalyticsService:", error);
        throw error;
    }
};
// Get Property Listing Analytics
export const getPropertyAnalyticsService = async (days = 30) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                CAST(CreatedAt AS DATE) as date,
                COUNT(*) as listings,
                SUM(CASE WHEN IsVerified = 1 THEN 1 ELSE 0 END) as verified
            FROM Properties 
            WHERE CreatedAt >= DATEADD(day, -@days, GETDATE())
            GROUP BY CAST(CreatedAt AS DATE)
            ORDER BY date ASC
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset;
    }
    catch (error) {
        console.error("Error in getPropertyAnalyticsService:", error);
        throw error;
    }
};
// Get Revenue Analytics
export const getRevenueAnalyticsService = async (days = 30) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                CAST(CreatedAt AS DATE) as date,
                ISNULL(SUM(CASE WHEN Status = 'COMPLETED' THEN Amount ELSE 0 END), 0) as revenue,
                COUNT(*) as payments
            FROM Payments 
            WHERE CreatedAt >= DATEADD(day, -@days, GETDATE())
            GROUP BY CAST(CreatedAt AS DATE)
            ORDER BY date ASC
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue)
        }));
    }
    catch (error) {
        console.error("Error in getRevenueAnalyticsService:", error);
        throw error;
    }
};
// Get User Role Summary
export const getUserRoleSummaryService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                Role as role,
                COUNT(*) as count
            FROM Users 
            WHERE IsActive = 1
            GROUP BY Role
            ORDER BY count DESC
        `;
        const result = await db.request().query(query);
        return result.recordset;
    }
    catch (error) {
        console.error("Error in getUserRoleSummaryService:", error);
        throw error;
    }
};
// Get Agent Status Summary
export const getAgentStatusSummaryService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                AgentStatus as status,
                COUNT(*) as count
            FROM Users 
            WHERE Role IN ('AGENT', 'TENANT') AND IsActive = 1
            GROUP BY AgentStatus
            ORDER BY 
                CASE AgentStatus
                    WHEN 'PENDING' THEN 1
                    WHEN 'APPROVED' THEN 2
                    WHEN 'REJECTED' THEN 3
                    WHEN 'SUSPENDED' THEN 4
                    WHEN 'NONE' THEN 5
                    ELSE 6
                END
        `;
        const result = await db.request().query(query);
        return result.recordset;
    }
    catch (error) {
        console.error("Error in getAgentStatusSummaryService:", error);
        throw error;
    }
};
// Get Popular Locations
export const getPopularLocationsService = async (limit = 10) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                County as county,
                Area as area,
                COUNT(*) as propertyCount,
                AVG(RentAmount) as avgRent
            FROM Properties 
            WHERE IsAvailable = 1
            GROUP BY County, Area
            ORDER BY propertyCount DESC
            OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const result = await db.request()
            .input('limit', limit)
            .query(query);
        return result.recordset.map(item => ({
            ...item,
            avgRent: parseFloat(item.avgRent) || 0
        }));
    }
    catch (error) {
        console.error("Error in getPopularLocationsService:", error);
        throw error;
    }
};
// Get Verification Analytics
export const getVerificationAnalyticsService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                ReviewStatus as status,
                COUNT(*) as count,
                AVG(
                    CASE 
                        WHEN ReviewedAt IS NOT NULL 
                        THEN DATEDIFF(HOUR, SubmittedAt, ReviewedAt)
                        ELSE NULL 
                    END
                ) as avgProcessingTime
            FROM AgentVerification 
            GROUP BY ReviewStatus
            ORDER BY 
                CASE ReviewStatus
                    WHEN 'PENDING' THEN 1
                    WHEN 'APPROVED' THEN 2
                    WHEN 'REJECTED' THEN 3
                    ELSE 4
                END
        `;
        const result = await db.request().query(query);
        return result.recordset.map(item => ({
            ...item,
            avgProcessingTime: parseFloat(item.avgProcessingTime) || 0
        }));
    }
    catch (error) {
        console.error("Error in getVerificationAnalyticsService:", error);
        throw error;
    }
};
// ==================== SUBSCRIPTION ANALYTICS SERVICES ====================
// Get Subscription Analytics
export const getSubscriptionAnalyticsService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            WITH SubscriptionStats AS (
                SELECT 
                    COUNT(*) as totalSubscriptions,
                    SUM(CASE WHEN Status IN ('ACTIVE', 'TRIAL') AND EndDate > GETDATE() THEN 1 ELSE 0 END) as activeSubscriptions,
                    SUM(CASE WHEN Status = 'TRIAL' AND EndDate > GETDATE() THEN 1 ELSE 0 END) as trialSubscriptions,
                    SUM(CASE WHEN Status = 'EXPIRED' OR (Status = 'ACTIVE' AND EndDate <= GETDATE()) THEN 1 ELSE 0 END) as expiredSubscriptions,
                    SUM(CASE WHEN Status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledSubscriptions,
                    AVG(us.Price) as avgRevenuePerUser
                FROM UserSubscriptions us
                WHERE us.StartDate >= DATEADD(MONTH, -12, GETDATE())
            ),
            RevenueStats AS (
                SELECT 
                    ISNULL(SUM(p.Amount), 0) as monthlyRevenue
                FROM Payments p
                INNER JOIN UserSubscriptions us ON p.PaymentId = us.PaymentId
                WHERE p.Status = 'COMPLETED'
                AND p.Purpose = 'SUBSCRIPTION'
                AND p.CreatedAt >= DATEADD(MONTH, -1, GETDATE())
            ),
            ChurnStats AS (
                SELECT 
                    SUM(CASE WHEN us.Status = 'CANCELLED' AND us.CancelledDate >= DATEADD(MONTH, -1, GETDATE()) THEN 1 ELSE 0 END) as churned,
                    SUM(CASE WHEN us.Status IN ('ACTIVE', 'TRIAL') AND us.StartDate >= DATEADD(MONTH, -2, GETDATE()) THEN 1 ELSE 0 END) as activeMonthAgo
                FROM UserSubscriptions us
            ),
            TrialStats AS (
                SELECT 
                    COUNT(*) as totalTrials,
                    SUM(CASE WHEN us.Status = 'ACTIVE' AND us.StartDate < us.TrialEndDate THEN 1 ELSE 0 END) as convertedTrials
                FROM UserSubscriptions us
                WHERE us.TrialEndDate IS NOT NULL
                AND us.StartDate >= DATEADD(MONTH, -3, GETDATE())
            )
            SELECT 
                ss.*,
                rs.monthlyRevenue,
                CASE 
                    WHEN cs.activeMonthAgo > 0 
                    THEN CAST((cs.churned * 100.0 / cs.activeMonthAgo) AS DECIMAL(5,2))
                    ELSE 0 
                END as churnRate,
                CASE 
                    WHEN ts.totalTrials > 0 
                    THEN CAST((ts.convertedTrials * 100.0 / ts.totalTrials) AS DECIMAL(5,2))
                    ELSE 0 
                END as trialConversionRate
            FROM SubscriptionStats ss, RevenueStats rs, ChurnStats cs, TrialStats ts
        `;
        const result = await db.request().query(query);
        const data = result.recordset[0];
        return {
            totalSubscriptions: parseInt(data.totalSubscriptions),
            activeSubscriptions: parseInt(data.activeSubscriptions),
            trialSubscriptions: parseInt(data.trialSubscriptions),
            expiredSubscriptions: parseInt(data.expiredSubscriptions),
            cancelledSubscriptions: parseInt(data.cancelledSubscriptions),
            monthlyRevenue: parseFloat(data.monthlyRevenue) || 0,
            averageRevenuePerUser: parseFloat(data.avgRevenuePerUser) || 0,
            churnRate: parseFloat(data.churnRate) || 0,
            trialConversionRate: parseFloat(data.trialConversionRate) || 0
        };
    }
    catch (error) {
        console.error("Error in getSubscriptionAnalyticsService:", error);
        throw error;
    }
};
// Get Plan Distribution
export const getPlanDistributionService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            WITH PlanStats AS (
                SELECT 
                    sp.DisplayName as planName,
                    COUNT(us.SubscriptionId) as subscriptionCount,
                    ISNULL(SUM(p.Amount), 0) as planRevenue,
                    AVG(p.Amount) as avgRevenuePerUser
                FROM SubscriptionPlans sp
                LEFT JOIN UserSubscriptions us ON sp.PlanId = us.PlanId
                    AND us.Status IN ('ACTIVE', 'TRIAL')
                    AND us.EndDate > GETDATE()
                LEFT JOIN Payments p ON us.PaymentId = p.PaymentId
                    AND p.Status = 'COMPLETED'
                WHERE sp.IsActive = 1
                GROUP BY sp.DisplayName, sp.SortOrder
            ),
            TotalStats AS (
                SELECT 
                    SUM(subscriptionCount) as totalSubscriptions,
                    SUM(planRevenue) as totalRevenue
                FROM PlanStats
            )
            SELECT 
                ps.planName,
                ps.subscriptionCount as count,
                CAST((ps.subscriptionCount * 100.0 / NULLIF(ts.totalSubscriptions, 0)) AS DECIMAL(5,2)) as percentage,
                ps.planRevenue as revenue,
                ps.avgRevenuePerUser as avgRevenuePerUser
            FROM PlanStats ps, TotalStats ts
            ORDER BY ps.subscriptionCount DESC
        `;
        const result = await db.request().query(query);
        return result.recordset.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue) || 0,
            avgRevenuePerUser: parseFloat(item.avgRevenuePerUser) || 0,
            percentage: parseFloat(item.percentage) || 0
        }));
    }
    catch (error) {
        console.error("Error in getPlanDistributionService:", error);
        throw error;
    }
};
// Get Subscription Growth
export const getSubscriptionGrowthService = async (days = 90) => {
    const db = await getDbPool();
    try {
        const query = `
            WITH DateSeries AS (
                SELECT DATEADD(DAY, -n.n, CAST(GETDATE() AS DATE)) as date
                FROM (SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 as n 
                      FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) a(n)) n
                WHERE n.n <= @days
            ),
            DailyStats AS (
                SELECT 
                    ds.date,
                    COUNT(CASE WHEN us.Status IN ('ACTIVE', 'TRIAL') AND CAST(us.StartDate AS DATE) = ds.date THEN 1 END) as newSubscriptions,
                    COUNT(CASE WHEN us.Status = 'CANCELLED' AND CAST(us.CancelledDate AS DATE) = ds.date THEN 1 END) as cancelledSubscriptions,
                    COUNT(CASE WHEN us.Status IN ('ACTIVE', 'TRIAL') AND CAST(us.StartDate AS DATE) <= ds.date 
                                AND (us.CancelledDate IS NULL OR CAST(us.CancelledDate AS DATE) > ds.date)
                                AND us.EndDate >= ds.date THEN 1 END) as activeSubscriptions
                FROM DateSeries ds
                LEFT JOIN UserSubscriptions us ON 1=1
                GROUP BY ds.date
            )
            SELECT 
                CONVERT(VARCHAR, date, 23) as date,
                ISNULL(newSubscriptions, 0) as newSubscriptions,
                ISNULL(cancelledSubscriptions, 0) as cancelledSubscriptions,
                ISNULL(activeSubscriptions, 0) as activeSubscriptions,
                ISNULL(newSubscriptions, 0) - ISNULL(cancelledSubscriptions, 0) as netGrowth
            FROM DailyStats
            ORDER BY date ASC
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset;
    }
    catch (error) {
        console.error("Error in getSubscriptionGrowthService:", error);
        throw error;
    }
};
// Get Usage Analytics
export const getUsageAnalyticsService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                sp.DisplayName as planName,
                AVG(CAST(us.PropertiesUsed AS FLOAT)) as avgPropertiesUsed,
                AVG(CAST(us.VisitsUsedThisMonth AS FLOAT)) as avgVisitsUsed,
                AVG(CAST(us.BoostsUsedThisMonth AS FLOAT)) as avgBoostsUsed,
                sp.MaxProperties as maxProperties,
                sp.MaxVisitsPerMonth as maxVisitsPerMonth,
                sp.MaxBoostsPerMonth as maxBoostsPerMonth,
                CASE 
                    WHEN sp.MaxProperties > 0 
                    THEN CAST((AVG(CAST(us.PropertiesUsed AS FLOAT)) * 100.0 / sp.MaxProperties) AS DECIMAL(5,2))
                    ELSE 0 
                END as usagePercentage
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.Status IN ('ACTIVE', 'TRIAL')
            AND us.EndDate > GETDATE()
            GROUP BY sp.DisplayName, sp.MaxProperties, sp.MaxVisitsPerMonth, sp.MaxBoostsPerMonth, sp.SortOrder
            ORDER BY sp.SortOrder
        `;
        const result = await db.request().query(query);
        return result.recordset.map(item => ({
            ...item,
            avgPropertiesUsed: parseFloat(item.avgPropertiesUsed) || 0,
            avgVisitsUsed: parseFloat(item.avgVisitsUsed) || 0,
            avgBoostsUsed: parseFloat(item.avgBoostsUsed) || 0,
            usagePercentage: parseFloat(item.usagePercentage) || 0
        }));
    }
    catch (error) {
        console.error("Error in getUsageAnalyticsService:", error);
        throw error;
    }
};
// Get Churn Analytics
export const getChurnAnalyticsService = async (days = 30) => {
    const db = await getDbPool();
    try {
        const query = `
            WITH DailyStats AS (
                SELECT 
                    CAST(CreatedAt AS DATE) as date,
                    COUNT(CASE WHEN Status IN ('ACTIVE', 'TRIAL') THEN 1 END) as newSubscribers,
                    COUNT(CASE WHEN Status = 'CANCELLED' THEN 1 END) as churnedSubscribers
                FROM UserSubscriptions
                WHERE CreatedAt >= DATEADD(DAY, -@days, GETDATE())
                GROUP BY CAST(CreatedAt AS DATE)
            )
            SELECT 
                CONVERT(VARCHAR, date, 23) as date,
                ISNULL(newSubscribers, 0) as newSubscribers,
                ISNULL(churnedSubscribers, 0) as churnedSubscribers,
                CASE 
                    WHEN LAG(ISNULL(newSubscribers, 0)) OVER (ORDER BY date) > 0 
                    THEN CAST((ISNULL(churnedSubscribers, 0) * 100.0 / NULLIF(LAG(ISNULL(newSubscribers, 0)) OVER (ORDER BY date), 0)) AS DECIMAL(5,2))
                    ELSE 0 
                END as churnRate,
                CASE 
                    WHEN LAG(ISNULL(newSubscribers, 0)) OVER (ORDER BY date) > 0 
                    THEN CAST((100 - (ISNULL(churnedSubscribers, 0) * 100.0 / NULLIF(LAG(ISNULL(newSubscribers, 0)) OVER (ORDER BY date), 0))) AS DECIMAL(5,2))
                    ELSE 100 
                END as retentionRate
            FROM DailyStats
            ORDER BY date
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset.map(item => ({
            ...item,
            churnRate: parseFloat(item.churnRate) || 0,
            retentionRate: parseFloat(item.retentionRate) || 100
        }));
    }
    catch (error) {
        console.error("Error in getChurnAnalyticsService:", error);
        throw error;
    }
};
// Get Revenue Breakdown
export const getRevenueBreakdownService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            WITH RevenueStats AS (
                SELECT 
                    sp.DisplayName as planName,
                    ISNULL(SUM(p.Amount), 0) as revenue,
                    COUNT(DISTINCT us.UserId) as subscribers,
                    CASE 
                        WHEN COUNT(DISTINCT us.UserId) > 0 
                        THEN ISNULL(SUM(p.Amount), 0) / COUNT(DISTINCT us.UserId)
                        ELSE 0 
                    END as avgRevenuePerSubscriber
                FROM SubscriptionPlans sp
                LEFT JOIN UserSubscriptions us ON sp.PlanId = us.PlanId
                LEFT JOIN Payments p ON us.PaymentId = p.PaymentId
                    AND p.Status = 'COMPLETED'
                    AND p.Purpose = 'SUBSCRIPTION'
                WHERE sp.IsActive = 1
                GROUP BY sp.DisplayName, sp.SortOrder
            ),
            TotalRevenue AS (
                SELECT SUM(revenue) as total FROM RevenueStats
            )
            SELECT 
                rs.planName,
                rs.revenue,
                rs.subscribers,
                rs.avgRevenuePerSubscriber,
                CASE 
                    WHEN tr.total > 0 
                    THEN CAST((rs.revenue * 100.0 / tr.total) AS DECIMAL(5,2))
                    ELSE 0 
                END as percentage
            FROM RevenueStats rs, TotalRevenue tr
            ORDER BY rs.revenue DESC
        `;
        const result = await db.request().query(query);
        return result.recordset.map(item => ({
            ...item,
            revenue: parseFloat(item.revenue) || 0,
            avgRevenuePerSubscriber: parseFloat(item.avgRevenuePerSubscriber) || 0,
            percentage: parseFloat(item.percentage) || 0
        }));
    }
    catch (error) {
        console.error("Error in getRevenueBreakdownService:", error);
        throw error;
    }
};
// ==================== SUBSCRIPTION MANAGEMENT SERVICES ====================
// Get Active Subscriptions List
export const getActiveSubscriptionsService = async (page = 1, limit = 20, status, planId) => {
    const db = await getDbPool();
    try {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE us.Status IN ('ACTIVE', 'TRIAL') AND us.EndDate > GETDATE()";
        const inputs = { offset, limit };
        if (status) {
            whereClause += ` AND us.Status = @status`;
            inputs.status = status;
        }
        if (planId) {
            whereClause += ` AND us.PlanId = @planId`;
            inputs.planId = planId;
        }
        const query = `
            WITH TotalCount AS (
                SELECT COUNT(*) as total
                FROM UserSubscriptions us
                ${whereClause}
            )
            SELECT 
                us.SubscriptionId as subscriptionId,
                us.UserId as userId,
                u.FullName as userName,
                u.Email as userEmail,
                us.PlanId as planId,
                sp.DisplayName as planName,
                us.Status as status,
                CONVERT(VARCHAR, us.StartDate, 120) as startDate,
                CONVERT(VARCHAR, us.EndDate, 120) as endDate,
                CONVERT(VARCHAR, us.TrialEndDate, 120) as trialEndDate,
                us.AutoRenew as autoRenew,
                us.Price as price,
                us.PropertiesUsed as propertiesUsed,
                us.VisitsUsedThisMonth as visitsUsed,
                us.BoostsUsedThisMonth as boostsUsed,
                sp.MaxProperties as maxProperties,
                sp.MaxVisitsPerMonth as maxVisits,
                sp.MaxBoostsPerMonth as maxBoosts,
                DATEDIFF(DAY, GETDATE(), us.EndDate) as daysRemaining,
                CASE 
                    WHEN us.TrialEndDate IS NOT NULL 
                    THEN DATEDIFF(DAY, GETDATE(), us.TrialEndDate)
                    ELSE NULL 
                END as daysUntilTrialEnd,
                CONVERT(VARCHAR, us.CreatedAt, 120) as createdAt,
                CONVERT(VARCHAR, us.UpdatedAt, 120) as updatedAt,
                tc.total
            FROM UserSubscriptions us
            INNER JOIN Users u ON us.UserId = u.UserId
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            CROSS JOIN TotalCount tc
            ${whereClause}
            ORDER BY us.StartDate DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const request = db.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });
        const result = await request.query(query);
        const subscriptions = result.recordset.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0,
            propertiesUsed: parseInt(item.propertiesUsed) || 0,
            visitsUsed: parseInt(item.visitsUsed) || 0,
            boostsUsed: parseInt(item.boostsUsed) || 0,
            maxProperties: parseInt(item.maxProperties) || 0,
            maxVisits: parseInt(item.maxVisits) || 0,
            maxBoosts: parseInt(item.maxBoosts) || 0,
            daysRemaining: parseInt(item.daysRemaining) || 0,
            daysUntilTrialEnd: item.daysUntilTrialEnd ? parseInt(item.daysUntilTrialEnd) : null
        }));
        const total = result.recordset.length > 0 ? parseInt(result.recordset[0].total) : 0;
        return { subscriptions, total };
    }
    catch (error) {
        console.error("Error in getActiveSubscriptionsService:", error);
        throw error;
    }
};
// Get Expiring Trials
export const getExpiringTrialsService = async (days = 7) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                us.SubscriptionId as subscriptionId,
                us.UserId as userId,
                u.FullName as userName,
                u.Email as userEmail,
                sp.DisplayName as planName,
                us.Status as status,
                CONVERT(VARCHAR, us.StartDate, 120) as startDate,
                CONVERT(VARCHAR, us.EndDate, 120) as endDate,
                CONVERT(VARCHAR, us.TrialEndDate, 120) as trialEndDate,
                DATEDIFF(DAY, GETDATE(), us.TrialEndDate) as daysUntilTrialEnd,
                us.AutoRenew as autoRenew,
                us.Price as price,
                sp.MaxProperties as maxProperties,
                sp.MaxVisitsPerMonth as maxVisits,
                us.PropertiesUsed as propertiesUsed,
                us.VisitsUsedThisMonth as visitsUsed
            FROM UserSubscriptions us
            INNER JOIN Users u ON us.UserId = u.UserId
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.Status = 'TRIAL'
            AND us.TrialEndDate IS NOT NULL
            AND us.TrialEndDate BETWEEN GETDATE() AND DATEADD(DAY, @days, GETDATE())
            ORDER BY us.TrialEndDate ASC
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0,
            maxProperties: parseInt(item.maxProperties) || 0,
            maxVisits: parseInt(item.maxVisits) || 0,
            propertiesUsed: parseInt(item.propertiesUsed) || 0,
            visitsUsed: parseInt(item.visitsUsed) || 0,
            daysUntilTrialEnd: parseInt(item.daysUntilTrialEnd) || 0
        }));
    }
    catch (error) {
        console.error("Error in getExpiringTrialsService:", error);
        throw error;
    }
};
// Get Expiring Subscriptions
export const getExpiringSubscriptionsService = async (days = 7) => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                us.SubscriptionId as subscriptionId,
                us.UserId as userId,
                u.FullName as userName,
                u.Email as userEmail,
                sp.DisplayName as planName,
                us.Status as status,
                CONVERT(VARCHAR, us.StartDate, 120) as startDate,
                CONVERT(VARCHAR, us.EndDate, 120) as endDate,
                CONVERT(VARCHAR, us.TrialEndDate, 120) as trialEndDate,
                DATEDIFF(DAY, GETDATE(), us.EndDate) as daysUntilEnd,
                us.AutoRenew as autoRenew,
                us.Price as price,
                us.PropertiesUsed as propertiesUsed,
                us.VisitsUsedThisMonth as visitsUsed,
                sp.MaxProperties as maxProperties,
                sp.MaxVisitsPerMonth as maxVisits
            FROM UserSubscriptions us
            INNER JOIN Users u ON us.UserId = u.UserId
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.Status IN ('ACTIVE', 'TRIAL')
            AND us.EndDate BETWEEN GETDATE() AND DATEADD(DAY, @days, GETDATE())
            ORDER BY us.EndDate ASC
        `;
        const result = await db.request()
            .input('days', days)
            .query(query);
        return result.recordset.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0,
            propertiesUsed: parseInt(item.propertiesUsed) || 0,
            visitsUsed: parseInt(item.visitsUsed) || 0,
            maxProperties: parseInt(item.maxProperties) || 0,
            maxVisits: parseInt(item.maxVisits) || 0,
            daysUntilEnd: parseInt(item.daysUntilEnd) || 0
        }));
    }
    catch (error) {
        console.error("Error in getExpiringSubscriptionsService:", error);
        throw error;
    }
};
// Get Subscription Plans
export const getSubscriptionPlansService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                sp.PlanId as planId,
                sp.Name as name,
                sp.DisplayName as displayName,
                sp.Description as description,
                sp.BasePrice as basePrice,
                sp.Currency as currency,
                sp.BillingCycle as billingCycle,
                sp.TrialDays as trialDays,
                sp.MaxProperties as maxProperties,
                sp.MaxVisitsPerMonth as maxVisitsPerMonth,
                sp.MaxMediaPerProperty as maxMediaPerProperty,
                sp.MaxAmenitiesPerProperty as maxAmenitiesPerProperty,
                sp.AllowBoost as allowBoost,
                sp.MaxBoostsPerMonth as maxBoostsPerMonth,
                sp.AllowPremiumSupport as allowPremiumSupport,
                sp.AllowAdvancedAnalytics as allowAdvancedAnalytics,
                sp.AllowBulkOperations as allowBulkOperations,
                sp.IsActive as isActive,
                sp.IsVisible as isVisible,
                sp.SortOrder as sortOrder,
                sp.HighlightFeatures as highlightFeatures,
                CONVERT(VARCHAR, sp.CreatedAt, 120) as createdAt,
                CONVERT(VARCHAR, sp.UpdatedAt, 120) as updatedAt,
                COUNT(us.SubscriptionId) as activeSubscribers,
                ISNULL(SUM(p.Amount), 0) as totalRevenue,
                0 as avgRating -- You can add rating calculation if needed
            FROM SubscriptionPlans sp
            LEFT JOIN UserSubscriptions us ON sp.PlanId = us.PlanId
                AND us.Status IN ('ACTIVE', 'TRIAL')
                AND us.EndDate > GETDATE()
            LEFT JOIN Payments p ON us.PaymentId = p.PaymentId
                AND p.Status = 'COMPLETED'
            GROUP BY 
                sp.PlanId, sp.Name, sp.DisplayName, sp.Description, sp.BasePrice, sp.Currency,
                sp.BillingCycle, sp.TrialDays, sp.MaxProperties, sp.MaxVisitsPerMonth,
                sp.MaxMediaPerProperty, sp.MaxAmenitiesPerProperty, sp.AllowBoost,
                sp.MaxBoostsPerMonth, sp.AllowPremiumSupport, sp.AllowAdvancedAnalytics,
                sp.AllowBulkOperations, sp.IsActive, sp.IsVisible, sp.SortOrder,
                sp.HighlightFeatures, sp.CreatedAt, sp.UpdatedAt
            ORDER BY sp.SortOrder ASC, sp.DisplayName ASC
        `;
        const result = await db.request().query(query);
        return result.recordset.map(item => ({
            ...item,
            basePrice: parseFloat(item.basePrice) || 0,
            maxProperties: parseInt(item.maxProperties) || 0,
            maxVisitsPerMonth: parseInt(item.maxVisitsPerMonth) || 0,
            maxMediaPerProperty: parseInt(item.maxMediaPerProperty) || 0,
            maxAmenitiesPerProperty: parseInt(item.maxAmenitiesPerProperty) || 0,
            maxBoostsPerMonth: parseInt(item.maxBoostsPerMonth) || 0,
            activeSubscribers: parseInt(item.activeSubscribers) || 0,
            totalRevenue: parseFloat(item.totalRevenue) || 0,
            avgRating: parseFloat(item.avgRating) || 0,
            highlightFeatures: item.highlightFeatures ? JSON.parse(item.highlightFeatures) : [],
            isActive: Boolean(item.isActive),
            isVisible: Boolean(item.isVisible),
            allowBoost: Boolean(item.allowBoost),
            allowPremiumSupport: Boolean(item.allowPremiumSupport),
            allowAdvancedAnalytics: Boolean(item.allowAdvancedAnalytics),
            allowBulkOperations: Boolean(item.allowBulkOperations)
        }));
    }
    catch (error) {
        console.error("Error in getSubscriptionPlansService:", error);
        throw error;
    }
};
// Get Subscription Invoices
export const getSubscriptionInvoicesService = async (page = 1, limit = 20, status, userId) => {
    const db = await getDbPool();
    try {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE 1=1";
        const inputs = { offset, limit };
        if (status) {
            whereClause += ` AND si.Status = @status`;
            inputs.status = status;
        }
        if (userId) {
            whereClause += ` AND si.UserId = @userId`;
            inputs.userId = userId;
        }
        const query = `
            WITH TotalCount AS (
                SELECT COUNT(*) as total
                FROM SubscriptionInvoices si
                ${whereClause}
            )
            SELECT 
                si.InvoiceId as invoiceId,
                si.SubscriptionId as subscriptionId,
                si.UserId as userId,
                u.FullName as userName,
                si.InvoiceNumber as invoiceNumber,
                CONVERT(VARCHAR, si.InvoiceDate, 120) as invoiceDate,
                CONVERT(VARCHAR, si.DueDate, 120) as dueDate,
                CONVERT(VARCHAR, si.PeriodStart, 120) as periodStart,
                CONVERT(VARCHAR, si.PeriodEnd, 120) as periodEnd,
                si.Subtotal as subtotal,
                si.TaxAmount as taxAmount,
                si.TotalAmount as totalAmount,
                si.Currency as currency,
                si.Status as status,
                si.PaidAmount as paidAmount,
                CONVERT(VARCHAR, si.PaidDate, 120) as paidDate,
                si.PaymentId as paymentId,
                si.LineItems as lineItems,
                si.PdfUrl as pdfUrl,
                si.HtmlUrl as htmlUrl,
                CONVERT(VARCHAR, si.CreatedAt, 120) as createdAt,
                CONVERT(VARCHAR, si.UpdatedAt, 120) as updatedAt,
                tc.total
            FROM SubscriptionInvoices si
            INNER JOIN Users u ON si.UserId = u.UserId
            CROSS JOIN TotalCount tc
            ${whereClause}
            ORDER BY si.InvoiceDate DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const request = db.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });
        const result = await request.query(query);
        const invoices = result.recordset.map(item => ({
            ...item,
            subtotal: parseFloat(item.subtotal) || 0,
            taxAmount: parseFloat(item.taxAmount) || 0,
            totalAmount: parseFloat(item.totalAmount) || 0,
            paidAmount: parseFloat(item.paidAmount) || 0,
            lineItems: item.lineItems ? JSON.parse(item.lineItems) : []
        }));
        const total = result.recordset.length > 0 ? parseInt(result.recordset[0].total) : 0;
        return { invoices, total };
    }
    catch (error) {
        console.error("Error in getSubscriptionInvoicesService:", error);
        throw error;
    }
};
// Get Subscription Events
export const getSubscriptionEventsService = async (page = 1, limit = 20, eventType, processed) => {
    const db = await getDbPool();
    try {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE 1=1";
        const inputs = { offset, limit };
        if (eventType) {
            whereClause += ` AND se.EventType = @eventType`;
            inputs.eventType = eventType;
        }
        if (processed !== undefined) {
            whereClause += ` AND se.Processed = @processed`;
            inputs.processed = processed === '1';
        }
        const query = `
            WITH TotalCount AS (
                SELECT COUNT(*) as total
                FROM SubscriptionEvents se
                ${whereClause}
            )
            SELECT 
                se.EventId as eventId,
                se.EventType as eventType,
                se.SubscriptionId as subscriptionId,
                se.UserId as userId,
                u.FullName as userName,
                se.EventData as eventData,
                se.Processed as processed,
                CONVERT(VARCHAR, se.ProcessedAt, 120) as processedAt,
                se.ErrorMessage as errorMessage,
                se.RetryCount as retryCount,
                CONVERT(VARCHAR, se.ScheduledFor, 120) as scheduledFor,
                CONVERT(VARCHAR, se.CreatedAt, 120) as createdAt,
                tc.total
            FROM SubscriptionEvents se
            INNER JOIN Users u ON se.UserId = u.UserId
            CROSS JOIN TotalCount tc
            ${whereClause}
            ORDER BY se.ScheduledFor DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const request = db.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });
        const result = await request.query(query);
        const events = result.recordset.map(item => ({
            ...item,
            processed: Boolean(item.processed),
            retryCount: parseInt(item.retryCount) || 0,
            eventData: item.eventData ? JSON.parse(item.eventData) : {}
        }));
        const total = result.recordset.length > 0 ? parseInt(result.recordset[0].total) : 0;
        return { events, total };
    }
    catch (error) {
        console.error("Error in getSubscriptionEventsService:", error);
        throw error;
    }
};
// Get Subscription Usage Logs
export const getSubscriptionUsageLogsService = async (page = 1, limit = 20, userId, feature, startDate, endDate) => {
    const db = await getDbPool();
    try {
        const offset = (page - 1) * limit;
        let whereClause = "WHERE 1=1";
        const inputs = { offset, limit };
        if (userId) {
            whereClause += ` AND sul.UserId = @userId`;
            inputs.userId = userId;
        }
        if (feature) {
            whereClause += ` AND sul.Feature = @feature`;
            inputs.feature = feature;
        }
        if (startDate) {
            whereClause += ` AND sul.UsageDate >= @startDate`;
            inputs.startDate = startDate;
        }
        if (endDate) {
            whereClause += ` AND sul.UsageDate <= @endDate`;
            inputs.endDate = endDate;
        }
        const query = `
            WITH TotalCount AS (
                SELECT COUNT(*) as total
                FROM SubscriptionUsageLogs sul
                ${whereClause}
            )
            SELECT 
                sul.LogId as logId,
                sul.SubscriptionId as subscriptionId,
                sul.UserId as userId,
                u.FullName as userName,
                sul.Feature as feature,
                sul.ResourceId as resourceId,
                sul.Action as action,
                sul.UsageCount as usageCount,
                CONVERT(VARCHAR, sul.UsageDate, 23) as usageDate,
                sul.WasGated as wasGated,
                sul.GateType as gateType,
                sul.OverrideReason as overrideReason,
                sul.IpAddress as ipAddress,
                sul.UserAgent as userAgent,
                sul.Metadata as metadata,
                CONVERT(VARCHAR, sul.UsageTimestamp, 120) as createdAt,
                tc.total
            FROM SubscriptionUsageLogs sul
            INNER JOIN Users u ON sul.UserId = u.UserId
            CROSS JOIN TotalCount tc
            ${whereClause}
            ORDER BY sul.UsageTimestamp DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const request = db.request();
        Object.keys(inputs).forEach(key => {
            request.input(key, inputs[key]);
        });
        const result = await request.query(query);
        const logs = result.recordset.map(item => ({
            ...item,
            usageCount: parseInt(item.usageCount) || 0,
            wasGated: Boolean(item.wasGated),
            metadata: item.metadata ? JSON.parse(item.metadata) : null
        }));
        const total = result.recordset.length > 0 ? parseInt(result.recordset[0].total) : 0;
        return { logs, total };
    }
    catch (error) {
        console.error("Error in getSubscriptionUsageLogsService:", error);
        throw error;
    }
};
// ==================== SUBSCRIPTION MANAGEMENT OPERATIONS ====================
// Update Subscription Plan
export const updateSubscriptionPlanService = async (subscriptionId, planId, newEndDate, priceOverride, notes) => {
    const db = await getDbPool();
    try {
        const request = db.request();
        request.input('subscriptionId', subscriptionId);
        request.input('planId', planId);
        request.input('priceOverride', priceOverride);
        request.input('notes', notes);
        if (newEndDate) {
            request.input('newEndDate', newEndDate);
        }
        await request.query(`
            BEGIN TRANSACTION;
            
            -- Get current subscription details
            DECLARE @oldPlanId UNIQUEIDENTIFIER;
            DECLARE @userId UNIQUEIDENTIFIER;
            DECLARE @oldEndDate DATETIME2;
            
            SELECT 
                @oldPlanId = PlanId,
                @userId = UserId,
                @oldEndDate = EndDate
            FROM UserSubscriptions 
            WHERE SubscriptionId = @subscriptionId;
            
            -- Update the subscription
            UPDATE UserSubscriptions
            SET 
                PlanId = @planId,
                Price = ISNULL(@priceOverride, (SELECT BasePrice FROM SubscriptionPlans WHERE PlanId = @planId)),
                EndDate = ISNULL(@newEndDate, EndDate),
                UpdatedAt = GETDATE()
            WHERE SubscriptionId = @subscriptionId;
            
            -- Create audit event
            INSERT INTO SubscriptionEvents (
                EventType,
                SubscriptionId,
                UserId,
                EventData,
                ScheduledFor
            ) VALUES (
                'SUBSCRIPTION_UPDATED',
                @subscriptionId,
                @userId,
                JSON_OBJECT(
                    'oldPlanId': @oldPlanId,
                    'newPlanId': @planId,
                    'oldEndDate': @oldEndDate,
                    'newEndDate': ISNULL(@newEndDate, @oldEndDate),
                    'priceOverride': @priceOverride,
                    'notes': @notes,
                    'changedBy': 'ADMIN'
                ),
                GETDATE()
            );
            
            COMMIT TRANSACTION;
        `);
        return { success: true, subscriptionId, planId, updatedAt: new Date() };
    }
    catch (error) {
        console.error("Error in updateSubscriptionPlanService:", error);
        throw error;
    }
};
// Cancel Subscription
export const cancelSubscriptionService = async (subscriptionId, cancelImmediately = false, refundAmount, reason) => {
    const db = await getDbPool();
    try {
        const request = db.request();
        request.input('subscriptionId', subscriptionId);
        request.input('cancelImmediately', cancelImmediately);
        request.input('refundAmount', refundAmount || 0);
        request.input('reason', reason);
        await request.query(`
            BEGIN TRANSACTION;
            
            -- Update subscription based on cancellation type
            IF @cancelImmediately = 1
            BEGIN
                UPDATE UserSubscriptions
                SET 
                    Status = 'CANCELLED',
                    CancelledDate = GETDATE(),
                    EndDate = GETDATE(), -- End immediately
                    CancelAtPeriodEnd = 0,
                    UpdatedAt = GETDATE()
                WHERE SubscriptionId = @subscriptionId;
            END
            ELSE
            BEGIN
                UPDATE UserSubscriptions
                SET 
                    CancelAtPeriodEnd = 1,
                    CancelledDate = GETDATE(),
                    UpdatedAt = GETDATE()
                WHERE SubscriptionId = @subscriptionId;
            END
            
            -- Create cancellation event
            DECLARE @userId UNIQUEIDENTIFIER;
            SELECT @userId = UserId FROM UserSubscriptions WHERE SubscriptionId = @subscriptionId;
            
            INSERT INTO SubscriptionEvents (
                EventType,
                SubscriptionId,
                UserId,
                EventData,
                ScheduledFor
            ) VALUES (
                'SUBSCRIPTION_CANCELLED',
                @subscriptionId,
                @userId,
                JSON_OBJECT(
                    'cancelImmediately': @cancelImmediately,
                    'refundAmount': @refundAmount,
                    'reason': @reason,
                    'cancelledBy': 'ADMIN'
                ),
                GETDATE()
            );
            
            -- Process refund if specified
            IF @refundAmount > 0
            BEGIN
                -- Create refund payment record
                INSERT INTO Payments (
                    UserId,
                    Amount,
                    Currency,
                    PaymentProvider,
                    ProviderReference,
                    Purpose,
                    Status
                ) VALUES (
                    @userId,
                    @refundAmount,
                    'KES',
                    'ADMIN_REFUND',
                    'REFUND_' + CAST(@subscriptionId AS NVARCHAR(50)),
                    'SUBSCRIPTION',
                    'COMPLETED'
                );
            END
            
            COMMIT TRANSACTION;
        `);
        return {
            success: true,
            subscriptionId,
            cancelledImmediately: cancelImmediately,
            refundAmount: refundAmount || 0
        };
    }
    catch (error) {
        console.error("Error in cancelSubscriptionService:", error);
        throw error;
    }
};
// Reactivate Subscription
export const reactivateSubscriptionService = async (subscriptionId, newPlanId, startDate, price, notes) => {
    const db = await getDbPool();
    try {
        const request = db.request();
        request.input('subscriptionId', subscriptionId);
        request.input('newPlanId', newPlanId);
        request.input('price', price);
        request.input('notes', notes);
        if (startDate) {
            request.input('startDate', startDate);
        }
        await request.query(`
            BEGIN TRANSACTION;
            
            -- Get current subscription
            DECLARE @userId UNIQUEIDENTIFIER;
            DECLARE @oldPlanId UNIQUEIDENTIFIER;
            DECLARE @newEndDate DATETIME2;
            
            SELECT 
                @userId = UserId,
                @oldPlanId = PlanId
            FROM UserSubscriptions 
            WHERE SubscriptionId = @subscriptionId;
            
            -- Calculate new end date (add 1 month from start date or current date)
            SET @newEndDate = DATEADD(MONTH, 1, ISNULL(@startDate, GETDATE()));
            
            -- Reactivate subscription
            UPDATE UserSubscriptions
            SET 
                PlanId = ISNULL(@newPlanId, @oldPlanId),
                Status = 'ACTIVE',
                StartDate = ISNULL(@startDate, GETDATE()),
                EndDate = @newEndDate,
                CancelAtPeriodEnd = 0,
                CancelledDate = NULL,
                Price = ISNULL(@price, Price),
                UpdatedAt = GETDATE()
            WHERE SubscriptionId = @subscriptionId;
            
            -- Create reactivation event
            INSERT INTO SubscriptionEvents (
                EventType,
                SubscriptionId,
                UserId,
                EventData,
                ScheduledFor
            ) VALUES (
                'SUBSCRIPTION_REACTIVATED',
                @subscriptionId,
                @userId,
                JSON_OBJECT(
                    'newPlanId': ISNULL(@newPlanId, @oldPlanId),
                    'startDate': ISNULL(@startDate, GETDATE()),
                    'endDate': @newEndDate,
                    'price': ISNULL(@price, (SELECT Price FROM UserSubscriptions WHERE SubscriptionId = @subscriptionId)),
                    'notes': @notes,
                    'reactivatedBy': 'ADMIN'
                ),
                GETDATE()
            );
            
            COMMIT TRANSACTION;
        `);
        return { success: true, subscriptionId, reactivatedAt: new Date() };
    }
    catch (error) {
        console.error("Error in reactivateSubscriptionService:", error);
        throw error;
    }
};
// Override Subscription Limits
export const overrideSubscriptionLimitsService = async (subscriptionId, propertiesLimit, visitsLimit, boostsLimit, mediaLimit, amenitiesLimit, expiryDate, notes) => {
    const db = await getDbPool();
    try {
        const request = db.request();
        request.input('subscriptionId', subscriptionId);
        request.input('propertiesLimit', propertiesLimit);
        request.input('visitsLimit', visitsLimit);
        request.input('boostsLimit', boostsLimit);
        request.input('mediaLimit', mediaLimit);
        request.input('amenitiesLimit', amenitiesLimit);
        request.input('notes', notes);
        if (expiryDate) {
            request.input('expiryDate', expiryDate);
        }
        await request.query(`
            BEGIN TRANSACTION;
            
            -- Get user ID
            DECLARE @userId UNIQUEIDENTIFIER;
            SELECT @userId = UserId FROM UserSubscriptions WHERE SubscriptionId = @subscriptionId;
            
            -- Create feature gate override
            IF @propertiesLimit IS NOT NULL
            BEGIN
                INSERT INTO FeatureGates (
                    UserId,
                    Feature,
                    GateType,
                    TriggerLimit,
                    TriggerCount,
                    IsActive,
                    UpsellMessage
                ) VALUES (
                    @userId,
                    'PROPERTY_CREATE',
                    'SOFT',
                    @propertiesLimit,
                    0,
                    1,
                    'Admin override applied'
                )
                ON DUPLICATE KEY UPDATE
                    TriggerLimit = @propertiesLimit,
                    UpdatedAt = GETDATE();
            END
            
            -- Create override event
            INSERT INTO SubscriptionEvents (
                EventType,
                SubscriptionId,
                UserId,
                EventData,
                ScheduledFor
            ) VALUES (
                'LIMIT_OVERRIDE',
                @subscriptionId,
                @userId,
                JSON_OBJECT(
                    'propertiesLimit': @propertiesLimit,
                    'visitsLimit': @visitsLimit,
                    'boostsLimit': @boostsLimit,
                    'mediaLimit': @mediaLimit,
                    'amenitiesLimit': @amenitiesLimit,
                    'expiryDate': @expiryDate,
                    'notes': @notes,
                    'overriddenBy': 'ADMIN'
                ),
                GETDATE()
            );
            
            COMMIT TRANSACTION;
        `);
        return {
            success: true,
            subscriptionId,
            limitsOverridden: {
                properties: propertiesLimit,
                visits: visitsLimit,
                boosts: boostsLimit,
                media: mediaLimit,
                amenities: amenitiesLimit
            }
        };
    }
    catch (error) {
        console.error("Error in overrideSubscriptionLimitsService:", error);
        throw error;
    }
};
// Generate Invoice
export const generateInvoiceService = async (subscriptionId, amount, description, dueDate, items) => {
    const db = await getDbPool();
    try {
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const request = db.request();
        request.input('subscriptionId', subscriptionId);
        request.input('amount', amount);
        request.input('description', description);
        request.input('invoiceNumber', invoiceNumber);
        if (dueDate) {
            request.input('dueDate', dueDate);
        }
        if (items) {
            request.input('items', JSON.stringify(items));
        }
        else {
            request.input('items', '[]');
        }
        const result = await request.query(`
            BEGIN TRANSACTION;
            
            -- Get subscription details
            DECLARE @userId UNIQUEIDENTIFIER;
            DECLARE @planId UNIQUEIDENTIFIER;
            DECLARE @startDate DATETIME2;
            
            SELECT 
                @userId = UserId,
                @planId = PlanId,
                @startDate = StartDate
            FROM UserSubscriptions 
            WHERE SubscriptionId = @subscriptionId;
            
            -- Create invoice
            DECLARE @invoiceId UNIQUEIDENTIFIER = NEWID();
            
            INSERT INTO SubscriptionInvoices (
                InvoiceId,
                SubscriptionId,
                UserId,
                InvoiceNumber,
                InvoiceDate,
                DueDate,
                PeriodStart,
                PeriodEnd,
                Subtotal,
                TaxAmount,
                TotalAmount,
                Currency,
                Status,
                LineItems
            ) VALUES (
                @invoiceId,
                @subscriptionId,
                @userId,
                @invoiceNumber,
                GETDATE(),
                ISNULL(@dueDate, DATEADD(DAY, 7, GETDATE())),
                @startDate,
                DATEADD(MONTH, 1, @startDate),
                @amount,
                0,
                @amount,
                'KES',
                'ISSUED',
                @items
            );
            
            -- Create invoice event
            INSERT INTO SubscriptionEvents (
                EventType,
                SubscriptionId,
                UserId,
                InvoiceId,
                EventData,
                ScheduledFor
            ) VALUES (
                'INVOICE_ISSUED',
                @subscriptionId,
                @userId,
                @invoiceId,
                JSON_OBJECT(
                    'invoiceNumber': @invoiceNumber,
                    'amount': @amount,
                    'description': @description,
                    'dueDate': ISNULL(@dueDate, DATEADD(DAY, 7, GETDATE())),
                    'items': @items
                ),
                GETDATE()
            );
            
            COMMIT TRANSACTION;
            
            SELECT @invoiceId as invoiceId, @invoiceNumber as invoiceNumber;
        `);
        return {
            success: true,
            invoiceId: result.recordset[0].invoiceId,
            invoiceNumber: result.recordset[0].invoiceNumber,
            amount,
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
    }
    catch (error) {
        console.error("Error in generateInvoiceService:", error);
        throw error;
    }
};
// Send Subscription Notification
export const sendSubscriptionNotificationService = async (subscriptionId, notificationType, subject, message, includeInvoice = false) => {
    const db = await getDbPool();
    try {
        const request = db.request();
        request.input('subscriptionId', subscriptionId);
        request.input('notificationType', notificationType);
        request.input('subject', subject);
        request.input('message', message);
        request.input('includeInvoice', includeInvoice);
        // Get subscription details
        const subscriptionResult = await request.query(`
            SELECT 
                us.SubscriptionId,
                u.UserId,
                u.FullName as userName,
                u.Email as userEmail,
                sp.DisplayName as planName,
                us.Status,
                us.EndDate,
                us.TrialEndDate
            FROM UserSubscriptions us
            INNER JOIN Users u ON us.UserId = u.UserId
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.SubscriptionId = @subscriptionId
        `);
        if (subscriptionResult.recordset.length === 0) {
            throw new Error('Subscription not found');
        }
        const subscription = subscriptionResult.recordset[0];
        request.input('userId', subscription.UserId);
        request.input('userEmail', subscription.userEmail);
        request.input('userName', subscription.userName);
        // Create notification event
        await request.query(`
            INSERT INTO SubscriptionEvents (
                EventType,
                SubscriptionId,
                UserId,
                EventData,
                ScheduledFor
            ) VALUES (
                @notificationType,
                @subscriptionId,
                @userId,
                JSON_OBJECT(
                    'subject': @subject,
                    'message': @message,
                    'includeInvoice': @includeInvoice,
                    'sentTo': @userEmail,
                    'userName': @userName
                ),
                GETDATE()
            )
        `);
        // Here you would typically integrate with your email service
        // For now, we'll just log it
        console.log(`Notification sent to ${subscription.userEmail}:`, {
            notificationType,
            subject,
            message,
            includeInvoice
        });
        return {
            success: true,
            subscriptionId,
            userEmail: subscription.userEmail,
            notificationType,
            sentAt: new Date()
        };
    }
    catch (error) {
        console.error("Error in sendSubscriptionNotificationService:", error);
        throw error;
    }
};
// Get Subscription Stats
export const getSubscriptionStatsService = async () => {
    const db = await getDbPool();
    try {
        const query = `
            SELECT 
                -- Basic counts
                COUNT(*) as totalSubscriptions,
                SUM(CASE WHEN Status IN ('ACTIVE', 'TRIAL') AND EndDate > GETDATE() THEN 1 ELSE 0 END) as activeSubscriptions,
                SUM(CASE WHEN Status = 'TRIAL' AND EndDate > GETDATE() THEN 1 ELSE 0 END) as trialSubscriptions,
                
                -- Daily stats
                SUM(CASE WHEN Status IN ('ACTIVE', 'TRIAL') AND CAST(StartDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as newSubscriptionsToday,
                SUM(CASE WHEN Status = 'CANCELLED' AND CAST(CancelledDate AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as cancellationsToday,
                
                -- Revenue
                (SELECT ISNULL(SUM(Amount), 0) FROM Payments WHERE Status = 'COMPLETED' AND Purpose = 'SUBSCRIPTION' AND MONTH(CreatedAt) = MONTH(GETDATE())) as monthlyRevenue,
                (SELECT ISNULL(SUM(Amount), 0) FROM Payments WHERE Status = 'COMPLETED' AND Purpose = 'SUBSCRIPTION') as lifetimeRevenue,
                
                -- Churn rate (last 30 days)
                CAST((
                    SELECT COUNT(*) * 100.0 / NULLIF((
                        SELECT COUNT(*) 
                        FROM UserSubscriptions 
                        WHERE Status IN ('ACTIVE', 'TRIAL') 
                        AND StartDate >= DATEADD(DAY, -60, GETDATE())
                        AND StartDate <= DATEADD(DAY, -30, GETDATE())
                    ), 0)
                    FROM UserSubscriptions 
                    WHERE Status = 'CANCELLED' 
                    AND CancelledDate >= DATEADD(DAY, -30, GETDATE())
                ) AS DECIMAL(5,2)) as churnRate,
                
                -- Trial conversion (last 90 days)
                CAST((
                    SELECT SUM(CASE WHEN Status = 'ACTIVE' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)
                    FROM UserSubscriptions 
                    WHERE TrialEndDate IS NOT NULL 
                    AND StartDate >= DATEADD(DAY, -90, GETDATE())
                ) AS DECIMAL(5,2)) as trialConversionRate,
                
                -- ARPU
                (SELECT ISNULL(AVG(Price), 0) FROM UserSubscriptions WHERE Status IN ('ACTIVE', 'TRIAL') AND EndDate > GETDATE()) as avgRevenuePerUser,
                
                -- Most popular plan
                (SELECT TOP 1 sp.DisplayName 
                 FROM UserSubscriptions us
                 INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
                 WHERE us.Status IN ('ACTIVE', 'TRIAL') 
                 AND us.EndDate > GETDATE()
                 GROUP BY sp.DisplayName
                 ORDER BY COUNT(*) DESC) as mostPopularPlan,
                
                -- Usage rate
                CAST((
                    SELECT AVG(CAST(PropertiesUsed AS FLOAT) * 100.0 / NULLIF(sp.MaxProperties, 0))
                    FROM UserSubscriptions us
                    INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
                    WHERE us.Status IN ('ACTIVE', 'TRIAL') 
                    AND us.EndDate > GETDATE()
                    AND sp.MaxProperties > 0
                ) AS DECIMAL(5,2)) as usageRate,
                
                -- Failed payments today
                (SELECT COUNT(*) 
                 FROM SubscriptionEvents 
                 WHERE EventType = 'PAYMENT_FAILED' 
                 AND CAST(ScheduledFor AS DATE) = CAST(GETDATE() AS DATE)) as failedPaymentsToday
            FROM UserSubscriptions
        `;
        const result = await db.request().query(query);
        const data = result.recordset[0];
        return {
            totalSubscriptions: parseInt(data.totalSubscriptions) || 0,
            activeSubscriptions: parseInt(data.activeSubscriptions) || 0,
            trialSubscriptions: parseInt(data.trialSubscriptions) || 0,
            newSubscriptionsToday: parseInt(data.newSubscriptionsToday) || 0,
            cancellationsToday: parseInt(data.cancellationsToday) || 0,
            monthlyRevenue: parseFloat(data.monthlyRevenue) || 0,
            lifetimeRevenue: parseFloat(data.lifetimeRevenue) || 0,
            churnRate: parseFloat(data.churnRate) || 0,
            trialConversionRate: parseFloat(data.trialConversionRate) || 0,
            avgRevenuePerUser: parseFloat(data.avgRevenuePerUser) || 0,
            mostPopularPlan: data.mostPopularPlan || 'None',
            usageRate: parseFloat(data.usageRate) || 0,
            failedPaymentsToday: parseInt(data.failedPaymentsToday) || 0
        };
    }
    catch (error) {
        console.error("Error in getSubscriptionStatsService:", error);
        throw error;
    }
};
// Get Subscription User Details
export const getSubscriptionUserDetailsService = async (userId, subscriptionId) => {
    const db = await getDbPool();
    try {
        if (!userId && !subscriptionId) {
            throw new Error('Either userId or subscriptionId is required');
        }
        let condition = '';
        if (userId) {
            condition = `WHERE u.UserId = @userId`;
        }
        else if (subscriptionId) {
            condition = `WHERE us.SubscriptionId = @subscriptionId`;
        }
        const request = db.request();
        if (userId) {
            request.input('userId', userId);
        }
        else if (subscriptionId) {
            request.input('subscriptionId', subscriptionId);
        }
        // Get user details
        const userQuery = `
            SELECT 
                u.UserId,
                u.FullName as userName,
                u.Email as userEmail,
                u.Role as userRole,
                CONVERT(VARCHAR, u.CreatedAt, 120) as joinedDate
            FROM Users u
            ${condition}
        `;
        const userResult = await request.query(userQuery);
        if (userResult.recordset.length === 0) {
            throw new Error('User not found');
        }
        const user = userResult.recordset[0];
        // Get current subscription
        const currentSubQuery = `
            SELECT TOP 1
                us.SubscriptionId,
                sp.DisplayName as planName,
                us.Status,
                CONVERT(VARCHAR, us.StartDate, 120) as startDate,
                CONVERT(VARCHAR, us.EndDate, 120) as endDate,
                CONVERT(VARCHAR, us.TrialEndDate, 120) as trialEndDate,
                us.AutoRenew,
                us.Price,
                us.PropertiesUsed,
                us.VisitsUsedThisMonth,
                us.BoostsUsedThisMonth,
                sp.MaxProperties,
                sp.MaxVisitsPerMonth,
                sp.MaxBoostsPerMonth,
                DATEDIFF(DAY, GETDATE(), us.EndDate) as daysRemaining
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.UserId = @userId
            AND us.Status IN ('ACTIVE', 'TRIAL')
            AND us.EndDate > GETDATE()
            ORDER BY us.StartDate DESC
        `;
        const currentSubRequest = db.request();
        currentSubRequest.input('userId', user.UserId);
        const currentSubResult = await currentSubRequest.query(currentSubQuery);
        const currentSubscription = currentSubResult.recordset[0] || null;
        // Get subscription history
        const historyQuery = `
            SELECT 
                us.SubscriptionId,
                sp.DisplayName as planName,
                us.Status,
                CONVERT(VARCHAR, us.StartDate, 120) as startDate,
                CONVERT(VARCHAR, us.EndDate, 120) as endDate,
                CONVERT(VARCHAR, us.CancelledDate, 120) as cancelledDate,
                us.Price,
                us.CancelAtPeriodEnd
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.UserId = @userId
            ORDER BY us.StartDate DESC
        `;
        const historyRequest = db.request();
        historyRequest.input('userId', user.UserId);
        const historyResult = await historyRequest.query(historyQuery);
        // Get payment history
        const paymentQuery = `
            SELECT 
                p.PaymentId,
                p.Amount,
                p.Currency,
                p.PaymentProvider,
                p.Purpose,
                p.Status,
                si.InvoiceId,
                si.InvoiceNumber,
                CONVERT(VARCHAR, p.CreatedAt, 120) as createdAt,
                CONVERT(VARCHAR, p.CompletedAt, 120) as completedAt
            FROM Payments p
            LEFT JOIN SubscriptionInvoices si ON p.PaymentId = si.PaymentId
            WHERE p.UserId = @userId
            AND p.Purpose = 'SUBSCRIPTION'
            ORDER BY p.CreatedAt DESC
        `;
        const paymentRequest = db.request();
        paymentRequest.input('userId', user.UserId);
        const paymentResult = await paymentRequest.query(paymentQuery);
        // Get usage summary
        const usageQuery = `
            SELECT 
                -- Lifetime totals
                (SELECT COUNT(*) FROM Properties WHERE OwnerId = @userId) as totalPropertiesCreated,
                (SELECT COUNT(*) FROM PropertyVisits WHERE TenantId = @userId) as totalVisitsScheduled,
                (SELECT COUNT(*) FROM Properties WHERE OwnerId = @userId AND IsBoosted = 1) as totalBoostsUsed,
                
                -- Current month usage
                ISNULL((SELECT PropertiesUsed FROM UserSubscriptions WHERE UserId = @userId AND Status IN ('ACTIVE', 'TRIAL')), 0) as propertiesUsed,
                ISNULL((SELECT VisitsUsedThisMonth FROM UserSubscriptions WHERE UserId = @userId AND Status IN ('ACTIVE', 'TRIAL')), 0) as visitsUsed,
                ISNULL((SELECT BoostsUsedThisMonth FROM UserSubscriptions WHERE UserId = @userId AND Status IN ('ACTIVE', 'TRIAL')), 0) as boostsUsed,
                ISNULL((SELECT MediaUsedThisMonth FROM UserSubscriptions WHERE UserId = @userId AND Status IN ('ACTIVE', 'TRIAL')), 0) as mediaUsed,
                ISNULL((SELECT AmenitiesUsedThisMonth FROM UserSubscriptions WHERE UserId = @userId AND Status IN ('ACTIVE', 'TRIAL')), 0) as amenitiesUsed
        `;
        const usageRequest = db.request();
        usageRequest.input('userId', user.UserId);
        const usageResult = await usageRequest.query(usageQuery);
        // Get feature gates
        const gatesQuery = `
            SELECT 
                Feature,
                GateType,
                TriggerLimit,
                TriggerCount,
                IsActive
            FROM FeatureGates
            WHERE UserId = @userId
            AND IsActive = 1
        `;
        const gatesRequest = db.request();
        gatesRequest.input('userId', user.UserId);
        const gatesResult = await gatesRequest.query(gatesQuery);
        // Calculate total spent
        const totalSpentQuery = `
            SELECT ISNULL(SUM(Amount), 0) as totalSpent
            FROM Payments
            WHERE UserId = @userId
            AND Status = 'COMPLETED'
            AND Purpose = 'SUBSCRIPTION'
        `;
        const totalSpentRequest = db.request();
        totalSpentRequest.input('userId', user.UserId);
        const totalSpentResult = await totalSpentRequest.query(totalSpentQuery);
        return {
            userId: user.UserId,
            userName: user.userName,
            userEmail: user.userEmail,
            userRole: user.userRole,
            currentSubscription: currentSubscription ? {
                ...currentSubscription,
                price: parseFloat(currentSubscription.price) || 0,
                propertiesUsed: parseInt(currentSubscription.propertiesUsed) || 0,
                visitsUsed: parseInt(currentSubscription.visitsUsed) || 0,
                boostsUsed: parseInt(currentSubscription.boostsUsed) || 0,
                maxProperties: parseInt(currentSubscription.maxProperties) || 0,
                maxVisits: parseInt(currentSubscription.maxVisits) || 0,
                maxBoosts: parseInt(currentSubscription.maxBoosts) || 0,
                daysRemaining: parseInt(currentSubscription.daysRemaining) || 0
            } : null,
            subscriptionHistory: historyResult.recordset.map(sub => ({
                ...sub,
                price: parseFloat(sub.price) || 0
            })),
            paymentHistory: paymentResult.recordset.map(payment => ({
                ...payment,
                amount: parseFloat(payment.amount) || 0
            })),
            usageSummary: {
                totalPropertiesCreated: parseInt(usageResult.recordset[0].totalPropertiesCreated) || 0,
                totalVisitsScheduled: parseInt(usageResult.recordset[0].totalVisitsScheduled) || 0,
                totalBoostsUsed: parseInt(usageResult.recordset[0].totalBoostsUsed) || 0,
                currentMonthUsage: {
                    properties: parseInt(usageResult.recordset[0].propertiesUsed) || 0,
                    visits: parseInt(usageResult.recordset[0].visitsUsed) || 0,
                    boosts: parseInt(usageResult.recordset[0].boostsUsed) || 0,
                    media: parseInt(usageResult.recordset[0].mediaUsed) || 0,
                    amenities: parseInt(usageResult.recordset[0].amenitiesUsed) || 0
                }
            },
            featureGates: gatesResult.recordset.map(gate => ({
                ...gate,
                triggerLimit: parseInt(gate.TriggerLimit) || 0,
                triggerCount: parseInt(gate.TriggerCount) || 0,
                isActive: Boolean(gate.IsActive)
            })),
            nextBillingDate: currentSubscription ? currentSubscription.endDate : null,
            totalSpent: parseFloat(totalSpentResult.recordset[0].totalSpent) || 0,
            joinedDate: user.joinedDate
        };
    }
    catch (error) {
        console.error("Error in getSubscriptionUserDetailsService:", error);
        throw error;
    }
};
// Get Subscription Payment History
export const getSubscriptionPaymentHistoryService = async (subscriptionId, userId) => {
    const db = await getDbPool();
    try {
        let condition = '';
        const request = db.request();
        if (subscriptionId) {
            condition = `WHERE us.SubscriptionId = @subscriptionId`;
            request.input('subscriptionId', subscriptionId);
        }
        else if (userId) {
            condition = `WHERE p.UserId = @userId`;
            request.input('userId', userId);
        }
        else {
            throw new Error('Either subscriptionId or userId is required');
        }
        const query = `
            SELECT 
                p.PaymentId,
                p.Amount,
                p.Currency,
                p.PaymentProvider,
                p.Purpose,
                p.Status,
                si.InvoiceId,
                si.InvoiceNumber,
                CONVERT(VARCHAR, p.CreatedAt, 120) as createdAt,
                CONVERT(VARCHAR, p.CompletedAt, 120) as completedAt
            FROM Payments p
            LEFT JOIN SubscriptionInvoices si ON p.PaymentId = si.PaymentId
            LEFT JOIN UserSubscriptions us ON p.PaymentId = us.PaymentId
            ${condition}
            AND p.Purpose = 'SUBSCRIPTION'
            ORDER BY p.CreatedAt DESC
        `;
        const result = await request.query(query);
        return result.recordset.map(payment => ({
            ...payment,
            amount: parseFloat(payment.amount) || 0
        }));
    }
    catch (error) {
        console.error("Error in getSubscriptionPaymentHistoryService:", error);
        throw error;
    }
};
//# sourceMappingURL=adminService.js.map