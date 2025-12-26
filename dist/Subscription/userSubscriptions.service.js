import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
import { subscriptionPlansService } from './subscriptionPlans.service.js';
export class UserSubscriptionsService {
    db = null;
    constructor() {
        // Lazy initialization
    }
    async getDb() {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }
    // Create new subscription
    async createSubscription(data) {
        const db = await this.getDb();
        // Validate user exists
        const userCheck = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query('SELECT UserId FROM Users WHERE UserId = @userId AND IsActive = 1');
        if (userCheck.recordset.length === 0) {
            throw new Error('User not found or inactive');
        }
        // Validate plan exists and is active
        const planCheck = await db.request()
            .input('planId', sql.UniqueIdentifier, data.planId)
            .query('SELECT * FROM SubscriptionPlans WHERE PlanId = @planId AND IsActive = 1');
        if (planCheck.recordset.length === 0) {
            throw new Error('Subscription plan not found or inactive');
        }
        const plan = planCheck.recordset[0];
        // Check for existing active subscription
        const existingSubscription = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query(`
                SELECT SubscriptionId 
                FROM UserSubscriptions 
                WHERE UserId = @userId 
                AND Status IN ('TRIAL', 'ACTIVE')
                AND EndDate > SYSDATETIME()
            `);
        if (existingSubscription.recordset.length > 0) {
            throw new Error('User already has an active subscription');
        }
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
        let status = 'ACTIVE';
        if (trialDays > 0) {
            status = 'TRIAL';
        }
        const query = `
            INSERT INTO UserSubscriptions (
                UserId, PlanId, PaymentId, Price, Currency, BillingCycle,
                StartDate, EndDate, TrialEndDate, Status, AutoRenew,
                LastUsageReset, NextUsageReset
            )
            OUTPUT INSERTED.*
            VALUES (
                @userId, @planId, @paymentId, @price, @currency, @billingCycle,
                @startDate, @endDate, @trialEndDate, @status, @autoRenew,
                @lastUsageReset, @nextUsageReset
            )
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('planId', sql.UniqueIdentifier, data.planId)
            .input('paymentId', sql.UniqueIdentifier, data.paymentId || null)
            .input('price', sql.Decimal(10, 2), data.price !== undefined ? data.price : plan.BasePrice)
            .input('currency', sql.NVarChar(10), data.currency || plan.Currency || 'KES')
            .input('billingCycle', sql.NVarChar(20), billingCycle)
            .input('startDate', sql.DateTime, startDate)
            .input('endDate', sql.DateTime, endDate)
            .input('trialEndDate', sql.DateTime, trialEndDate)
            .input('status', sql.NVarChar(20), status)
            .input('autoRenew', sql.Bit, data.autoRenew !== undefined ? (data.autoRenew ? 1 : 0) : 1)
            .input('lastUsageReset', sql.DateTime, startDate)
            .input('nextUsageReset', sql.DateTime, new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000))
            .query(query);
        // Create subscription event
        await this.createSubscriptionEvent(result.recordset[0].SubscriptionId, data.userId, 'SUBSCRIPTION_CREATED', {
            planId: data.planId,
            status: status,
            trialDays: trialDays,
            billingCycle: billingCycle
        });
        return result.recordset[0];
    }
    // Get subscription by ID
    async getSubscriptionById(subscriptionId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            throw new Error('Invalid subscription ID format');
        }
        const query = `
            SELECT 
                us.*,
                sp.DisplayName as PlanName,
                sp.MaxProperties,
                sp.MaxVisitsPerMonth,
                sp.MaxMediaPerProperty,
                sp.MaxAmenitiesPerProperty,
                sp.AllowBoost,
                sp.MaxBoostsPerMonth,
                sp.AllowPremiumSupport,
                sp.AllowAdvancedAnalytics,
                sp.AllowBulkOperations
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.SubscriptionId = @subscriptionId
        `;
        const result = await db.request()
            .input('subscriptionId', sql.UniqueIdentifier, subscriptionId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get active subscription for user
    async getActiveSubscription(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT 
                us.*,
                sp.DisplayName as PlanName,
                sp.MaxProperties,
                sp.MaxVisitsPerMonth,
                sp.MaxMediaPerProperty,
                sp.MaxAmenitiesPerProperty,
                sp.AllowBoost,
                sp.MaxBoostsPerMonth,
                sp.AllowPremiumSupport,
                sp.AllowAdvancedAnalytics,
                sp.AllowBulkOperations
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            WHERE us.UserId = @userId
            AND us.Status IN ('TRIAL', 'ACTIVE')
            AND us.EndDate > SYSDATETIME()
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get all subscriptions for user
    async getUserSubscriptions(userId, includeExpired = false) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        let whereClause = 'WHERE UserId = @userId';
        if (!includeExpired) {
            whereClause += ' AND EndDate > SYSDATETIME()';
        }
        const query = `
            SELECT * FROM UserSubscriptions
            ${whereClause}
            ORDER BY CreatedAt DESC
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.recordset;
    }
    // Update subscription
    async updateSubscription(subscriptionId, data) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            throw new Error('Invalid subscription ID format');
        }
        // Get current subscription
        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) {
            throw new Error('Subscription not found');
        }
        // Build dynamic update query
        const updates = [];
        const inputs = { subscriptionId };
        if (data.status !== undefined) {
            updates.push('Status = @status');
            inputs.status = data.status;
            // If cancelling, set cancelled date
            if (data.status === 'CANCELLED' && currentSubscription.Status !== 'CANCELLED') {
                updates.push('CancelledDate = SYSDATETIME()');
            }
        }
        if (data.autoRenew !== undefined) {
            updates.push('AutoRenew = @autoRenew');
            inputs.autoRenew = data.autoRenew ? 1 : 0;
        }
        if (data.cancelAtPeriodEnd !== undefined) {
            updates.push('CancelAtPeriodEnd = @cancelAtPeriodEnd');
            inputs.cancelAtPeriodEnd = data.cancelAtPeriodEnd ? 1 : 0;
        }
        if (data.paymentId !== undefined) {
            updates.push('PaymentId = @paymentId');
            inputs.paymentId = data.paymentId;
        }
        if (updates.length === 0) {
            throw new Error('No fields to update');
        }
        const query = `
            UPDATE UserSubscriptions 
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE SubscriptionId = @subscriptionId
        `;
        const request = db.request()
            .input('subscriptionId', sql.UniqueIdentifier, inputs.subscriptionId);
        // Add inputs dynamically
        Object.keys(inputs).forEach(key => {
            if (key !== 'subscriptionId') {
                let sqlType = sql.NVarChar;
                if (key === 'autoRenew' || key === 'cancelAtPeriodEnd') {
                    sqlType = sql.Bit;
                }
                else if (key === 'paymentId') {
                    sqlType = sql.UniqueIdentifier;
                }
                request.input(key, sqlType, inputs[key]);
            }
        });
        const result = await request.query(query);
        // Create subscription event if status changed
        if (data.status && data.status !== currentSubscription.Status) {
            await this.createSubscriptionEvent(subscriptionId, currentSubscription.UserId, `SUBSCRIPTION_${data.status.toUpperCase()}`, {
                previousStatus: currentSubscription.Status,
                newStatus: data.status,
                subscriptionId: subscriptionId
            });
        }
        return result.recordset[0];
    }
    // Cancel subscription
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = false) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            throw new Error('Invalid subscription ID format');
        }
        // Get current subscription
        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) {
            throw new Error('Subscription not found');
        }
        if (currentSubscription.Status === 'CANCELLED') {
            throw new Error('Subscription is already cancelled');
        }
        if (currentSubscription.Status === 'EXPIRED') {
            throw new Error('Subscription is already expired');
        }
        if (cancelAtPeriodEnd) {
            // Cancel at period end
            return this.updateSubscription(subscriptionId, { cancelAtPeriodEnd: true });
        }
        else {
            // Cancel immediately
            return this.updateSubscription(subscriptionId, { status: 'CANCELLED' });
        }
    }
    // Renew subscription
    async renewSubscription(subscriptionId, paymentId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(subscriptionId)) {
            throw new Error('Invalid subscription ID format');
        }
        // Get current subscription
        const currentSubscription = await this.getSubscriptionById(subscriptionId);
        if (!currentSubscription) {
            throw new Error('Subscription not found');
        }
        // Check if subscription can be renewed
        if (currentSubscription.Status === 'CANCELLED' && !currentSubscription.CancelAtPeriodEnd) {
            throw new Error('Cancelled subscription cannot be renewed');
        }
        if (currentSubscription.Status === 'EXPIRED') {
            throw new Error('Expired subscription cannot be renewed');
        }
        // Calculate new dates
        const newStartDate = currentSubscription.EndDate > new Date() ?
            currentSubscription.EndDate : new Date();
        let newEndDate = new Date(newStartDate);
        switch (currentSubscription.BillingCycle) {
            case 'DAILY':
                newEndDate.setDate(newEndDate.getDate() + 1);
                break;
            case 'WEEKLY':
                newEndDate.setDate(newEndDate.getDate() + 7);
                break;
            case 'MONTHLY':
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                newEndDate.setMonth(newEndDate.getMonth() + 3);
                break;
            case 'ANNUALLY':
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                break;
        }
        const query = `
            UPDATE UserSubscriptions 
            SET 
                StartDate = @newStartDate,
                EndDate = @newEndDate,
                Status = 'ACTIVE',
                CancelAtPeriodEnd = 0,
                CancelledDate = NULL,
                RenewalAttempts = RenewalAttempts + 1,
                LastRenewalAttempt = SYSDATETIME(),
                PaymentId = @paymentId,
                UpdatedAt = SYSDATETIME()
            OUTPUT INSERTED.*
            WHERE SubscriptionId = @subscriptionId
        `;
        const result = await db.request()
            .input('subscriptionId', sql.UniqueIdentifier, subscriptionId)
            .input('newStartDate', sql.DateTime, newStartDate)
            .input('newEndDate', sql.DateTime, newEndDate)
            .input('paymentId', sql.UniqueIdentifier, paymentId || null)
            .query(query);
        // Create subscription event
        await this.createSubscriptionEvent(subscriptionId, currentSubscription.UserId, 'SUBSCRIPTION_RENEWED', {
            newStartDate: newStartDate,
            newEndDate: newEndDate,
            billingCycle: currentSubscription.BillingCycle
        });
        return result.recordset[0];
    }
    // Check usage limit - UPDATED to handle free plan
    async checkUsageLimit(userId, feature, requiredCount = 1) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        // Try to get active subscription first
        const subscription = await this.getActiveSubscription(userId);
        if (!subscription) {
            // No active subscription, use free plan
            return this.checkFreePlanUsage(userId, feature, requiredCount);
        }
        // Get feature-specific limits from subscription plan
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
    async checkFreePlanUsage(userId, feature, requiredCount) {
        // Get free plan
        const freePlan = await subscriptionPlansService.getFreePlan();
        if (!freePlan) {
            // Fallback to hardcoded defaults
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
        // Get current usage for free plan users
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
    async getFreePlanUsage(userId, feature) {
        const db = await this.getDb();
        let usageQuery = '';
        switch (feature) {
            case 'PROPERTY_CREATE':
                usageQuery = 'SELECT COUNT(*) as count FROM Properties WHERE OwnerId = @userId';
                break;
            case 'VISIT_SCHEDULE':
                usageQuery = `
                    SELECT COUNT(*) as count FROM PropertyVisits 
                    WHERE TenantId = @userId 
                    AND MONTH(VisitDate) = MONTH(SYSDATETIME())
                    AND YEAR(VisitDate) = YEAR(SYSDATETIME())
                `;
                break;
            case 'BOOST_PROPERTY':
                usageQuery = `
                    SELECT COUNT(*) as count FROM Properties 
                    WHERE OwnerId = @userId 
                    AND IsBoosted = 1
                    AND MONTH(CreatedAt) = MONTH(SYSDATETIME())
                    AND YEAR(CreatedAt) = YEAR(SYSDATETIME())
                `;
                break;
            default:
                return 0;
        }
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(usageQuery);
        return parseInt(result.recordset[0].count) || 0;
    }
    // Get feature limit from subscription plan
    getFeatureLimit(feature, subscription) {
        switch (feature) {
            case 'PROPERTY_CREATE':
                return subscription.MaxProperties || 0;
            case 'VISIT_SCHEDULE':
                return subscription.MaxVisitsPerMonth || 0;
            case 'BOOST_PROPERTY':
                return subscription.MaxBoostsPerMonth || 0;
            case 'MEDIA_UPLOAD':
                return subscription.MaxMediaPerProperty || 0;
            case 'AMENITY_ADD':
                return subscription.MaxAmenitiesPerProperty || 0;
            default:
                return 0;
        }
    }
    // Get feature usage from subscription
    getFeatureUsage(feature, subscription) {
        switch (feature) {
            case 'PROPERTY_CREATE':
                return subscription.PropertiesUsed || 0;
            case 'VISIT_SCHEDULE':
                return subscription.VisitsUsedThisMonth || 0;
            case 'BOOST_PROPERTY':
                return subscription.BoostsUsedThisMonth || 0;
            case 'MEDIA_UPLOAD':
                return subscription.MediaUsedThisMonth || 0;
            case 'AMENITY_ADD':
                return subscription.AmenitiesUsedThisMonth || 0;
            default:
                return 0;
        }
    }
    // Check feature access from subscription plan
    checkFeatureAccess(feature, subscription) {
        switch (feature) {
            case 'BOOST_PROPERTY':
                return subscription.AllowBoost === true;
            case 'PREMIUM_SUPPORT':
                return subscription.AllowPremiumSupport === true;
            case 'ADVANCED_ANALYTICS':
                return subscription.AllowAdvancedAnalytics === true;
            case 'BULK_OPERATIONS':
                return subscription.AllowBulkOperations === true;
            default:
                return true; // Default to allowed for basic features
        }
    }
    // Fallback for feature access when plan not found
    checkFeatureAccessFallback(feature) {
        switch (feature) {
            case 'BOOST_PROPERTY':
            case 'PREMIUM_SUPPORT':
            case 'ADVANCED_ANALYTICS':
            case 'BULK_OPERATIONS':
                return false; // Premium features not available in free plan
            default:
                return true; // Basic features allowed
        }
    }
    // Fallback for feature limits when plan not found
    getFeatureLimitFallback(feature) {
        switch (feature) {
            case 'PROPERTY_CREATE':
                return 3; // Default free property limit
            case 'VISIT_SCHEDULE':
                return 5; // Default free visits per month
            case 'BOOST_PROPERTY':
                return 0; // No boosts in free plan
            case 'MEDIA_UPLOAD':
                return 5; // Default free media per property
            case 'AMENITY_ADD':
                return 10; // Default free amenities per property
            default:
                return 0;
        }
    }
    // Record usage
    async recordUsage(userId, feature, resourceId, action = 'CREATE', count = 1, override = false, overrideReason, ipAddress, userAgent, metadata) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        // First check the limit
        const usageCheck = await this.checkUsageLimit(userId, feature, count);
        // If gated and not overridden, don't proceed
        if (usageCheck.isGated && !override) {
            throw new Error(`Usage limit reached for ${feature}. ${usageCheck.remaining} remaining.`);
        }
        // Get subscription to update counters
        const subscription = await this.getActiveSubscription(userId);
        if (subscription) {
            // Update usage counters in subscription
            await this.updateSubscriptionUsage(subscription.SubscriptionId, feature, count);
        }
        // Log the usage
        await db.request()
            .input('SubscriptionId', sql.UniqueIdentifier, subscription?.SubscriptionId || null)
            .input('UserId', sql.UniqueIdentifier, userId)
            .input('Feature', sql.NVarChar(50), feature)
            .input('ResourceId', sql.UniqueIdentifier, resourceId || null)
            .input('Action', sql.NVarChar(50), action)
            .input('UsageCount', sql.Int, count)
            .input('WasGated', sql.Bit, usageCheck.isGated ? 1 : 0)
            .input('GateType', sql.NVarChar(20), usageCheck.gateType || null)
            .input('OverrideReason', sql.NVarChar(200), overrideReason || null)
            .input('IpAddress', sql.NVarChar(45), ipAddress || null)
            .input('UserAgent', sql.NVarChar(500), userAgent || null)
            .input('Metadata', sql.NVarChar, metadata ? JSON.stringify(metadata) : null)
            .query(`
                INSERT INTO SubscriptionUsageLogs (
                    SubscriptionId, UserId, Feature, ResourceId, Action, 
                    UsageCount, WasGated, GateType, OverrideReason,
                    IpAddress, UserAgent, Metadata
                ) VALUES (
                    @SubscriptionId, @UserId, @Feature, @ResourceId, @Action,
                    @UsageCount, @WasGated, @GateType, @OverrideReason,
                    @IpAddress, @UserAgent, @Metadata
                )
            `);
    }
    // Update subscription usage counters
    async updateSubscriptionUsage(subscriptionId, feature, count) {
        const db = await this.getDb();
        let updateField = '';
        switch (feature) {
            case 'PROPERTY_CREATE':
                updateField = 'PropertiesUsed = PropertiesUsed + @count';
                break;
            case 'VISIT_SCHEDULE':
                updateField = 'VisitsUsedThisMonth = VisitsUsedThisMonth + @count';
                break;
            case 'BOOST_PROPERTY':
                updateField = 'BoostsUsedThisMonth = BoostsUsedThisMonth + @count';
                break;
            case 'MEDIA_UPLOAD':
                updateField = 'MediaUsedThisMonth = MediaUsedThisMonth + @count';
                break;
            case 'AMENITY_ADD':
                updateField = 'AmenitiesUsedThisMonth = AmenitiesUsedThisMonth + @count';
                break;
            default:
                return;
        }
        await db.request()
            .input('subscriptionId', sql.UniqueIdentifier, subscriptionId)
            .input('count', sql.Int, count)
            .query(`
                UPDATE UserSubscriptions 
                SET ${updateField}, UpdatedAt = SYSDATETIME()
                WHERE SubscriptionId = @subscriptionId
            `);
    }
    // Get usage statistics
    async getUsageStatistics(userId, startDate, endDate) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        let whereClause = 'WHERE UserId = @userId';
        if (startDate) {
            whereClause += ' AND UsageDate >= @startDate';
        }
        if (endDate) {
            whereClause += ' AND UsageDate <= @endDate';
        }
        const query = `
            SELECT 
                Feature,
                UsageDate,
                SUM(UsageCount) as DailyUsage,
                SUM(CASE WHEN WasGated = 1 THEN 1 ELSE 0 END) as GatedCount
            FROM SubscriptionUsageLogs
            ${whereClause}
            GROUP BY Feature, UsageDate
            ORDER BY UsageDate DESC, Feature ASC
        `;
        const request = db.request()
            .input('userId', sql.UniqueIdentifier, userId);
        if (startDate)
            request.input('startDate', sql.Date, startDate);
        if (endDate)
            request.input('endDate', sql.Date, endDate);
        const result = await request.query(query);
        // Aggregate results
        const statistics = {
            totalUsage: 0,
            byFeature: {},
            byDay: {},
            gatedActions: 0
        };
        result.recordset.forEach(row => {
            statistics.totalUsage += row.DailyUsage;
            statistics.byFeature[row.Feature] = (statistics.byFeature[row.Feature] || 0) + row.DailyUsage;
            statistics.byDay[row.UsageDate.toISOString().split('T')[0]] =
                (statistics.byDay[row.UsageDate.toISOString().split('T')[0]] || 0) + row.DailyUsage;
            statistics.gatedActions += row.GatedCount;
        });
        return statistics;
    }
    // Reset monthly usage (admin only)
    async resetMonthlyUsage() {
        const db = await this.getDb();
        const result = await db.request()
            .execute('sp_ResetMonthlyUsage');
        return result.rowsAffected[0];
    }
    // Get subscriptions expiring soon
    async getExpiringSubscriptions(days = 7) {
        const db = await this.getDb();
        const query = `
            SELECT 
                us.*,
                sp.DisplayName as PlanName,
                sp.MaxProperties,
                sp.MaxVisitsPerMonth,
                sp.MaxMediaPerProperty,
                sp.MaxAmenitiesPerProperty,
                sp.AllowBoost,
                sp.MaxBoostsPerMonth,
                sp.AllowPremiumSupport,
                sp.AllowAdvancedAnalytics,
                sp.AllowBulkOperations,
                u.Email as UserEmail
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            INNER JOIN Users u ON us.UserId = u.UserId
            WHERE us.Status IN ('TRIAL', 'ACTIVE')
            AND us.EndDate BETWEEN SYSDATETIME() AND DATEADD(DAY, @days, SYSDATETIME())
            ORDER BY us.EndDate ASC
        `;
        const result = await db.request()
            .input('days', sql.Int, days)
            .query(query);
        return result.recordset;
    }
    // Get trial subscriptions ending soon
    async getTrialEndingSubscriptions(days = 3) {
        const db = await this.getDb();
        const query = `
            SELECT 
                us.*,
                sp.DisplayName as PlanName,
                sp.MaxProperties,
                sp.MaxVisitsPerMonth,
                sp.MaxMediaPerProperty,
                sp.MaxAmenitiesPerProperty,
                sp.AllowBoost,
                sp.MaxBoostsPerMonth,
                sp.AllowPremiumSupport,
                sp.AllowAdvancedAnalytics,
                sp.AllowBulkOperations,
                u.Email as UserEmail
            FROM UserSubscriptions us
            INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
            INNER JOIN Users u ON us.UserId = u.UserId
            WHERE us.Status = 'TRIAL'
            AND us.TrialEndDate BETWEEN SYSDATETIME() AND DATEADD(DAY, @days, SYSDATETIME())
            ORDER BY us.TrialEndDate ASC
        `;
        const result = await db.request()
            .input('days', sql.Int, days)
            .query(query);
        return result.recordset;
    }
    // Helper method to create subscription events
    async createSubscriptionEvent(subscriptionId, userId, eventType, eventData) {
        const db = await this.getDb();
        await db.request()
            .input('EventType', sql.NVarChar(50), eventType)
            .input('SubscriptionId', sql.UniqueIdentifier, subscriptionId)
            .input('UserId', sql.UniqueIdentifier, userId)
            .input('EventData', sql.NVarChar, JSON.stringify(eventData))
            .query(`
                INSERT INTO SubscriptionEvents (EventType, SubscriptionId, UserId, EventData)
                VALUES (@EventType, @SubscriptionId, @UserId, @EventData)
            `);
    }
    // Get subscription summary for dashboard
    async getSubscriptionSummary(userId) {
        const subscription = await this.getActiveSubscription(userId);
        if (!subscription) {
            // Return free plan summary
            const freePlan = await subscriptionPlansService.getFreePlan();
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
                nextReset: new Date(new Date().setDate(new Date().getDate() + 30)) // Next month
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
//# sourceMappingURL=userSubscriptions.service.js.map