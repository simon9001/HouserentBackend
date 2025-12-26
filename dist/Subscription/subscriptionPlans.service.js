import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class SubscriptionPlansService {
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
    // Create new subscription plan
    async createPlan(data) {
        const db = await this.getDb();
        // Validate required fields
        if (!data.name || !data.displayName || data.basePrice === undefined) {
            throw new Error('Name, display name, and base price are required');
        }
        // Check if plan name already exists
        const existingCheck = await db.request()
            .input('name', sql.NVarChar(100), data.name)
            .query('SELECT PlanId FROM SubscriptionPlans WHERE Name = @name');
        if (existingCheck.recordset.length > 0) {
            throw new Error('Subscription plan with this name already exists');
        }
        const query = `
            INSERT INTO SubscriptionPlans (
                Name, DisplayName, Description, BasePrice, Currency, BillingCycle, TrialDays,
                MaxProperties, MaxVisitsPerMonth, MaxMediaPerProperty, MaxAmenitiesPerProperty,
                AllowBoost, MaxBoostsPerMonth, AllowPremiumSupport, AllowAdvancedAnalytics,
                AllowBulkOperations, IsVisible, SortOrder, HighlightFeatures
            )
            OUTPUT INSERTED.*
            VALUES (
                @name, @displayName, @description, @basePrice, @currency, @billingCycle, @trialDays,
                @maxProperties, @maxVisitsPerMonth, @maxMediaPerProperty, @maxAmenitiesPerProperty,
                @allowBoost, @maxBoostsPerMonth, @allowPremiumSupport, @allowAdvancedAnalytics,
                @allowBulkOperations, @isVisible, @sortOrder, @highlightFeatures
            )
        `;
        const result = await db.request()
            .input('name', sql.NVarChar(100), data.name)
            .input('displayName', sql.NVarChar(150), data.displayName)
            .input('description', sql.NVarChar(500), data.description || null)
            .input('basePrice', sql.Decimal(10, 2), data.basePrice)
            .input('currency', sql.NVarChar(10), data.currency || 'KES')
            .input('billingCycle', sql.NVarChar(20), data.billingCycle || 'MONTHLY')
            .input('trialDays', sql.Int, data.trialDays || 0)
            .input('maxProperties', sql.Int, data.maxProperties || 5)
            .input('maxVisitsPerMonth', sql.Int, data.maxVisitsPerMonth || 10)
            .input('maxMediaPerProperty', sql.Int, data.maxMediaPerProperty || 10)
            .input('maxAmenitiesPerProperty', sql.Int, data.maxAmenitiesPerProperty || 15)
            .input('allowBoost', sql.Bit, data.allowBoost ? 1 : 0)
            .input('maxBoostsPerMonth', sql.Int, data.maxBoostsPerMonth || 0)
            .input('allowPremiumSupport', sql.Bit, data.allowPremiumSupport ? 1 : 0)
            .input('allowAdvancedAnalytics', sql.Bit, data.allowAdvancedAnalytics ? 1 : 0)
            .input('allowBulkOperations', sql.Bit, data.allowBulkOperations ? 1 : 0)
            .input('isVisible', sql.Bit, data.isVisible !== undefined ? (data.isVisible ? 1 : 0) : 1)
            .input('sortOrder', sql.Int, data.sortOrder || 0)
            .input('highlightFeatures', sql.NVarChar, data.highlightFeatures ? JSON.stringify(data.highlightFeatures) : null)
            .query(query);
        const plan = result.recordset[0];
        // Parse JSON fields
        if (plan.HighlightFeatures) {
            plan.HighlightFeatures = JSON.parse(plan.HighlightFeatures);
        }
        return plan;
    }
    // Get plan by ID - FIXED: Allow null return
    async getPlanById(planId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(planId)) {
            throw new Error('Invalid plan ID format');
        }
        const query = `
            SELECT *, 
                JSON_QUERY(HighlightFeatures) as HighlightFeatures
            FROM SubscriptionPlans 
            WHERE PlanId = @planId
        `;
        const result = await db.request()
            .input('planId', sql.UniqueIdentifier, planId)
            .query(query);
        const plan = result.recordset[0];
        if (!plan)
            return null;
        // Parse JSON fields
        if (plan.HighlightFeatures) {
            plan.HighlightFeatures = JSON.parse(plan.HighlightFeatures);
        }
        return plan;
    }
    // Get plan by name - FIXED: Allow null return
    async getPlanByName(name) {
        const db = await this.getDb();
        const query = `
            SELECT *, 
                JSON_QUERY(HighlightFeatures) as HighlightFeatures
            FROM SubscriptionPlans 
            WHERE Name = @name
        `;
        const result = await db.request()
            .input('name', sql.NVarChar(100), name)
            .query(query);
        const plan = result.recordset[0];
        if (!plan)
            return null;
        // Parse JSON fields
        if (plan.HighlightFeatures) {
            plan.HighlightFeatures = JSON.parse(plan.HighlightFeatures);
        }
        return plan;
    }
    // Get all plans (with optional filters)
    async getAllPlans(isActive, isVisible) {
        const db = await this.getDb();
        let whereClause = 'WHERE 1=1';
        if (isActive !== undefined) {
            whereClause += ` AND IsActive = ${isActive ? 1 : 0}`;
        }
        if (isVisible !== undefined) {
            whereClause += ` AND IsVisible = ${isVisible ? 1 : 0}`;
        }
        const query = `
            SELECT *, 
                JSON_QUERY(HighlightFeatures) as HighlightFeatures
            FROM SubscriptionPlans
            ${whereClause}
            ORDER BY SortOrder ASC, DisplayName ASC
        `;
        const result = await db.request().query(query);
        // Parse JSON fields
        return result.recordset.map(plan => ({
            ...plan,
            HighlightFeatures: plan.HighlightFeatures ? JSON.parse(plan.HighlightFeatures) : []
        }));
    }
    // Update plan
    async updatePlan(planId, data) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(planId)) {
            throw new Error('Invalid plan ID format');
        }
        // Build dynamic update query
        const updates = [];
        const inputs = { planId };
        if (data.displayName !== undefined) {
            updates.push('DisplayName = @displayName');
            inputs.displayName = data.displayName;
        }
        if (data.description !== undefined) {
            updates.push('Description = @description');
            inputs.description = data.description;
        }
        if (data.basePrice !== undefined) {
            updates.push('BasePrice = @basePrice');
            inputs.basePrice = data.basePrice;
        }
        if (data.isActive !== undefined) {
            updates.push('IsActive = @isActive');
            inputs.isActive = data.isActive ? 1 : 0;
        }
        if (data.isVisible !== undefined) {
            updates.push('IsVisible = @isVisible');
            inputs.isVisible = data.isVisible ? 1 : 0;
        }
        if (data.sortOrder !== undefined) {
            updates.push('SortOrder = @sortOrder');
            inputs.sortOrder = data.sortOrder;
        }
        if (data.highlightFeatures !== undefined) {
            updates.push('HighlightFeatures = @highlightFeatures');
            inputs.highlightFeatures = JSON.stringify(data.highlightFeatures);
        }
        if (updates.length === 0) {
            throw new Error('No fields to update');
        }
        const query = `
            UPDATE SubscriptionPlans 
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE PlanId = @planId
        `;
        const request = db.request()
            .input('planId', sql.UniqueIdentifier, inputs.planId);
        // Add inputs dynamically
        Object.keys(inputs).forEach(key => {
            if (key !== 'planId') {
                let sqlType = sql.NVarChar;
                if (key === 'basePrice') {
                    sqlType = sql.Decimal(10, 2);
                }
                else if (key === 'isActive' || key === 'isVisible') {
                    sqlType = sql.Bit;
                }
                else if (key === 'sortOrder') {
                    sqlType = sql.Int;
                }
                request.input(key, sqlType, inputs[key]);
            }
        });
        const result = await request.query(query);
        const plan = result.recordset[0];
        // Parse JSON fields
        if (plan.HighlightFeatures) {
            plan.HighlightFeatures = JSON.parse(plan.HighlightFeatures);
        }
        return plan;
    }
    // Delete plan (soft delete)
    async deletePlan(planId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(planId)) {
            throw new Error('Invalid plan ID format');
        }
        // Check if plan has active subscriptions
        const subscriptionCheck = await db.request()
            .input('planId', sql.UniqueIdentifier, planId)
            .query(`
                SELECT COUNT(*) as subscriptionCount
                FROM UserSubscriptions 
                WHERE PlanId = @planId 
                AND Status IN ('TRIAL', 'ACTIVE')
            `);
        if (subscriptionCheck.recordset[0].subscriptionCount > 0) {
            throw new Error('Cannot delete plan with active subscriptions');
        }
        // Soft delete by deactivating
        const query = `
            UPDATE SubscriptionPlans 
            SET IsActive = 0, IsVisible = 0
            WHERE PlanId = @planId
        `;
        const result = await db.request()
            .input('planId', sql.UniqueIdentifier, planId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Compare plans
    async comparePlans(planIds) {
        const db = await this.getDb();
        // Validate UUIDs
        planIds.forEach(planId => {
            if (!ValidationUtils.isValidUUID(planId)) {
                throw new Error(`Invalid plan ID format: ${planId}`);
            }
        });
        const query = `
            SELECT 
                PlanId,
                DisplayName,
                BasePrice,
                Currency,
                BillingCycle,
                TrialDays,
                MaxProperties,
                MaxVisitsPerMonth,
                MaxMediaPerProperty,
                MaxAmenitiesPerProperty,
                AllowBoost,
                MaxBoostsPerMonth,
                AllowPremiumSupport,
                AllowAdvancedAnalytics,
                AllowBulkOperations,
                HighlightFeatures
            FROM SubscriptionPlans
            WHERE PlanId IN (${planIds.map((_, i) => `@planId${i}`).join(',')})
            AND IsActive = 1
            ORDER BY SortOrder ASC
        `;
        const request = db.request();
        planIds.forEach((planId, index) => {
            request.input(`planId${index}`, sql.UniqueIdentifier, planId);
        });
        const result = await request.query(query);
        // Parse JSON fields
        return result.recordset.map(plan => ({
            ...plan,
            HighlightFeatures: plan.HighlightFeatures ? JSON.parse(plan.HighlightFeatures) : []
        }));
    }
    // Get default (free) plan
    async getFreePlan() {
        const db = await this.getDb();
        const query = `
            SELECT *, 
                JSON_QUERY(HighlightFeatures) as HighlightFeatures
            FROM SubscriptionPlans 
            WHERE Name = 'FREE'
            AND IsActive = 1
        `;
        const result = await db.request().query(query);
        const plan = result.recordset[0];
        if (!plan)
            return null;
        // Parse JSON fields
        if (plan.HighlightFeatures) {
            plan.HighlightFeatures = JSON.parse(plan.HighlightFeatures);
        }
        return plan;
    }
    // Get featured/premium plans (for upsell)
    async getFeaturedPlans(limit = 3) {
        const db = await this.getDb();
        const query = `
            SELECT TOP ${limit} *, 
                JSON_QUERY(HighlightFeatures) as HighlightFeatures
            FROM SubscriptionPlans 
            WHERE IsActive = 1 
            AND IsVisible = 1
            AND Name != 'FREE'
            ORDER BY SortOrder ASC, BasePrice ASC
        `;
        const result = await db.request().query(query);
        // Parse JSON fields
        return result.recordset.map(plan => ({
            ...plan,
            HighlightFeatures: plan.HighlightFeatures ? JSON.parse(plan.HighlightFeatures) : []
        }));
    }
}
export const subscriptionPlansService = new SubscriptionPlansService();
//# sourceMappingURL=subscriptionPlans.service.js.map