import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyVisitsService {
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
    // Create new property visit
    async createVisit(data) {
        const db = await this.getDb();
        // Validate property exists
        const propertyCheck = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .query('SELECT PropertyId FROM Properties WHERE PropertyId = @propertyId');
        if (propertyCheck.recordset.length === 0) {
            throw new Error('Property not found');
        }
        // Validate tenant exists and is a tenant
        const tenantCheck = await db.request()
            .input('tenantId', sql.UniqueIdentifier, data.tenantId)
            .query('SELECT UserId, Role FROM Users WHERE UserId = @tenantId AND IsActive = 1');
        if (tenantCheck.recordset.length === 0) {
            throw new Error('Tenant not found or inactive');
        }
        if (tenantCheck.recordset[0].Role !== 'TENANT') {
            throw new Error('User is not a tenant');
        }
        // Validate agent exists and is approved
        const agentCheck = await db.request()
            .input('agentId', sql.UniqueIdentifier, data.agentId)
            .query('SELECT UserId, Role, AgentStatus FROM Users WHERE UserId = @agentId AND IsActive = 1');
        if (agentCheck.recordset.length === 0) {
            throw new Error('Agent not found or inactive');
        }
        if (agentCheck.recordset[0].Role !== 'AGENT' || agentCheck.recordset[0].AgentStatus !== 'APPROVED') {
            throw new Error('Agent is not approved');
        }
        // Check if visit date is in the future
        if (new Date(data.visitDate) <= new Date()) {
            throw new Error('Visit date must be in the future');
        }
        const query = `
            INSERT INTO PropertyVisits (PropertyId, TenantId, AgentId, VisitDate, VisitPurpose, TenantNotes, Status)
            OUTPUT INSERTED.*
            VALUES (@propertyId, @tenantId, @agentId, @visitDate, @visitPurpose, @tenantNotes, 'PENDING')
        `;
        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .input('tenantId', sql.UniqueIdentifier, data.tenantId)
            .input('agentId', sql.UniqueIdentifier, data.agentId)
            .input('visitDate', sql.DateTime, data.visitDate)
            .input('visitPurpose', sql.NVarChar(200), data.visitPurpose || null)
            .input('tenantNotes', sql.NVarChar(500), data.tenantNotes || null)
            .query(query);
        return result.recordset[0];
    }
    // Get visit by ID
    async getVisitById(visitId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(visitId)) {
            throw new Error('Invalid visit ID format');
        }
        const query = `
            SELECT 
                pv.*,
                p.Title as PropertyTitle,
                ut.FullName as TenantName,
                ua.FullName as AgentName
            FROM PropertyVisits pv
            INNER JOIN Properties p ON pv.PropertyId = p.PropertyId
            INNER JOIN Users ut ON pv.TenantId = ut.UserId
            INNER JOIN Users ua ON pv.AgentId = ua.UserId
            WHERE pv.VisitId = @visitId
        `;
        const result = await db.request()
            .input('visitId', sql.UniqueIdentifier, visitId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get visits by property ID
    async getVisitsByPropertyId(propertyId, status) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }
        let whereClause = 'WHERE pv.PropertyId = @propertyId';
        if (status) {
            whereClause += ' AND pv.Status = @status';
        }
        const query = `
            SELECT pv.*, u.FullName as TenantName
            FROM PropertyVisits pv
            INNER JOIN Users u ON pv.TenantId = u.UserId
            ${whereClause}
            ORDER BY pv.VisitDate DESC
        `;
        const request = db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId);
        if (status) {
            request.input('status', sql.NVarChar(20), status);
        }
        const result = await request.query(query);
        return result.recordset;
    }
    // Get visits by user ID (as tenant or agent)
    async getVisitsByUserId(userId, role = 'tenant') {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const column = role === 'tenant' ? 'TenantId' : 'AgentId';
        const query = `
            SELECT pv.*, p.Title as PropertyTitle, u.FullName as ${role === 'tenant' ? 'AgentName' : 'TenantName'}
            FROM PropertyVisits pv
            INNER JOIN Properties p ON pv.PropertyId = p.PropertyId
            INNER JOIN Users u ON pv.${column === 'TenantId' ? 'AgentId' : 'TenantId'} = u.UserId
            WHERE pv.${column} = @userId
            ORDER BY pv.VisitDate DESC
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.recordset;
    }
    // Update visit - FIXED VERSION
    async updateVisit(visitId, data) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(visitId)) {
            throw new Error('Invalid visit ID format');
        }
        // Get current visit
        const currentVisit = await this.getVisitById(visitId);
        if (!currentVisit) {
            throw new Error('Visit not found');
        }
        // Validate status transitions - FIXED TYPE ISSUE
        if (data.status) {
            const validTransitions = {
                'PENDING': ['CONFIRMED', 'CANCELLED'],
                'CONFIRMED': ['CHECKED_IN', 'CANCELLED'],
                'CHECKED_IN': ['CHECKED_OUT', 'NO_SHOW'],
                'CHECKED_OUT': [],
                'CANCELLED': [],
                'NO_SHOW': []
            };
            const currentStatus = currentVisit.Status;
            const allowedTransitions = validTransitions[currentStatus];
            if (!allowedTransitions.includes(data.status)) {
                throw new Error(`Invalid status transition from ${currentStatus} to ${data.status}`);
            }
        }
        // Build dynamic update query
        const updates = [];
        const inputs = { visitId };
        if (data.visitPurpose !== undefined) {
            updates.push('VisitPurpose = @visitPurpose');
            inputs.visitPurpose = data.visitPurpose;
        }
        if (data.tenantNotes !== undefined) {
            updates.push('TenantNotes = @tenantNotes');
            inputs.tenantNotes = data.tenantNotes;
        }
        if (data.agentNotes !== undefined) {
            updates.push('AgentNotes = @agentNotes');
            inputs.agentNotes = data.agentNotes;
        }
        if (data.status !== undefined) {
            updates.push('Status = @status');
            inputs.status = data.status;
        }
        if (data.checkInTime !== undefined) {
            updates.push('CheckInTime = @checkInTime');
            inputs.checkInTime = data.checkInTime;
        }
        if (data.checkOutTime !== undefined) {
            updates.push('CheckOutTime = @checkOutTime');
            inputs.checkOutTime = data.checkOutTime;
        }
        if (updates.length === 0) {
            throw new Error('No fields to update');
        }
        const query = `
            UPDATE PropertyVisits 
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE VisitId = @visitId
        `;
        const request = db.request()
            .input('visitId', sql.UniqueIdentifier, inputs.visitId);
        // Add inputs dynamically with proper SQL types
        Object.keys(inputs).forEach(key => {
            if (key !== 'visitId') {
                let sqlType = sql.NVarChar;
                if (key === 'checkInTime' || key === 'checkOutTime') {
                    sqlType = sql.DateTime;
                }
                else if (key === 'visitPurpose') {
                    sqlType = sql.NVarChar(200);
                }
                else if (key === 'tenantNotes' || key === 'agentNotes') {
                    sqlType = sql.NVarChar(500);
                }
                else if (key === 'status') {
                    sqlType = sql.NVarChar(20);
                }
                request.input(key, sqlType, inputs[key]);
            }
        });
        const result = await request.query(query);
        return result.recordset[0];
    }
    // Cancel visit
    async cancelVisit(visitId, reason) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(visitId)) {
            throw new Error('Invalid visit ID format');
        }
        const query = `
            UPDATE PropertyVisits 
            SET Status = 'CANCELLED', AgentNotes = ISNULL(AgentNotes, '') + ' Cancelled: ' + @reason
            WHERE VisitId = @visitId AND Status IN ('PENDING', 'CONFIRMED')
        `;
        const result = await db.request()
            .input('visitId', sql.UniqueIdentifier, visitId)
            .input('reason', sql.NVarChar(500), reason || 'No reason provided')
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Check in to visit
    async checkIn(visitId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(visitId)) {
            throw new Error('Invalid visit ID format');
        }
        const query = `
            UPDATE PropertyVisits 
            SET Status = 'CHECKED_IN', CheckInTime = SYSDATETIME()
            WHERE VisitId = @visitId AND Status = 'CONFIRMED'
        `;
        const result = await db.request()
            .input('visitId', sql.UniqueIdentifier, visitId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Check out from visit
    async checkOut(visitId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(visitId)) {
            throw new Error('Invalid visit ID format');
        }
        const query = `
            UPDATE PropertyVisits 
            SET Status = 'CHECKED_OUT', CheckOutTime = SYSDATETIME()
            WHERE VisitId = @visitId AND Status = 'CHECKED_IN'
        `;
        const result = await db.request()
            .input('visitId', sql.UniqueIdentifier, visitId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Get upcoming visits
    async getUpcomingVisits(days = 7) {
        const db = await this.getDb();
        const query = `
            SELECT pv.*, p.Title as PropertyTitle, u.FullName as TenantName
            FROM PropertyVisits pv
            INNER JOIN Properties p ON pv.PropertyId = p.PropertyId
            INNER JOIN Users u ON pv.TenantId = u.UserId
            WHERE pv.VisitDate BETWEEN SYSDATETIME() AND DATEADD(DAY, @days, SYSDATETIME())
            AND pv.Status IN ('PENDING', 'CONFIRMED')
            ORDER BY pv.VisitDate ASC
        `;
        const result = await db.request()
            .input('days', sql.Int, days)
            .query(query);
        return result.recordset;
    }
    // Get visit statistics
    async getVisitStatistics(agentId, startDate, endDate) {
        const db = await this.getDb();
        let whereClause = 'WHERE 1=1';
        if (agentId) {
            whereClause += ' AND AgentId = @agentId';
        }
        if (startDate) {
            whereClause += ' AND VisitDate >= @startDate';
        }
        if (endDate) {
            whereClause += ' AND VisitDate <= @endDate';
        }
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN Status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN Status = 'CHECKED_IN' THEN 1 ELSE 0 END) as checkedIn,
                SUM(CASE WHEN Status = 'CHECKED_OUT' THEN 1 ELSE 0 END) as checkedOut,
                SUM(CASE WHEN Status = 'NO_SHOW' THEN 1 ELSE 0 END) as noShow,
                SUM(CASE WHEN Status IN ('PENDING', 'CONFIRMED') AND VisitDate > SYSDATETIME() THEN 1 ELSE 0 END) as upcoming
            FROM PropertyVisits
            ${whereClause}
        `;
        const request = db.request();
        if (agentId)
            request.input('agentId', sql.UniqueIdentifier, agentId);
        if (startDate)
            request.input('startDate', sql.DateTime, startDate);
        if (endDate)
            request.input('endDate', sql.DateTime, endDate);
        const result = await request.query(query);
        return result.recordset[0];
    }
}
export const propertyVisitsService = new PropertyVisitsService();
//# sourceMappingURL=propertyVisits.service.js.map