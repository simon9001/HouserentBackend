import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class AgentVerificationService {
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
    // Create new agent verification
    async createVerification(data) {
        const db = await this.getDb();
        // Validate user exists and is active
        const userCheckQuery = `
            SELECT UserId, Role, AgentStatus FROM Users 
            WHERE UserId = @userId AND IsActive = 1
        `;
        const userCheck = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query(userCheckQuery);
        if (userCheck.recordset.length === 0) {
            throw new Error('User not found or inactive');
        }
        const user = userCheck.recordset[0];
        const userRole = user.Role?.toUpperCase();
        const agentStatus = user.AgentStatus?.toUpperCase();
        // Check if user is already an approved agent
        if (userRole === 'AGENT' && agentStatus === 'APPROVED') {
            throw new Error('You are already an approved agent');
        }
        // Check if user is admin
        if (userRole === 'ADMIN') {
            throw new Error('Administrators cannot apply to become agents');
        }
        // Check if user already has a pending verification
        const existingQuery = `
            SELECT VerificationId FROM AgentVerification 
            WHERE UserId = @userId AND ReviewStatus IN ('PENDING', 'APPROVED')
        `;
        const existing = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query(existingQuery);
        if (existing.recordset.length > 0) {
            throw new Error('Agent verification already exists or is pending');
        }
        // Create verification
        const query = `
            INSERT INTO AgentVerification (
                UserId, NationalId, SelfieUrl, IdFrontUrl, IdBackUrl, PropertyProofUrl
            ) 
            OUTPUT INSERTED.*
            VALUES (
                @userId, @nationalId, @selfieUrl, @idFrontUrl, @idBackUrl, @propertyProofUrl
            )
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('nationalId', sql.NVarChar(50), data.nationalId)
            .input('selfieUrl', sql.NVarChar(500), data.selfieUrl)
            .input('idFrontUrl', sql.NVarChar(500), data.idFrontUrl)
            .input('idBackUrl', sql.NVarChar(500), data.idBackUrl || null)
            .input('propertyProofUrl', sql.NVarChar(500), data.propertyProofUrl || null)
            .query(query);
        // Update user's agent status to PENDING (keep role as TENANT for now)
        // When approved, we'll update role to AGENT
        await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('agentStatus', sql.NVarChar(20), 'PENDING')
            .query(`
                UPDATE Users 
                SET AgentStatus = @agentStatus, UpdatedAt = GETDATE() 
                WHERE UserId = @userId
            `);
        return result.recordset[0];
    }
    // Create verification by admin for a user
    async createVerificationForUser(data) {
        const db = await this.getDb();
        // Validate user exists and is active
        const userCheckQuery = `
            SELECT UserId, Role, AgentStatus FROM Users 
            WHERE UserId = @userId AND IsActive = 1
        `;
        const userCheck = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query(userCheckQuery);
        if (userCheck.recordset.length === 0) {
            throw new Error('User not found or inactive');
        }
        const user = userCheck.recordset[0];
        const userRole = user.Role?.toUpperCase();
        const agentStatus = user.AgentStatus?.toUpperCase();
        // Check if user is already an approved agent
        if (userRole === 'AGENT' && agentStatus === 'APPROVED') {
            throw new Error('User is already an approved agent');
        }
        // Check if user already has a pending verification
        const existingQuery = `
            SELECT VerificationId FROM AgentVerification 
            WHERE UserId = @userId AND ReviewStatus IN ('PENDING', 'APPROVED')
        `;
        const existing = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query(existingQuery);
        if (existing.recordset.length > 0) {
            throw new Error('Agent verification already exists or is pending');
        }
        // Create verification
        const query = `
            INSERT INTO AgentVerification (
                UserId, NationalId, SelfieUrl, IdFrontUrl, IdBackUrl, PropertyProofUrl
            ) 
            OUTPUT INSERTED.*
            VALUES (
                @userId, @nationalId, @selfieUrl, @idFrontUrl, @idBackUrl, @propertyProofUrl
            )
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('nationalId', sql.NVarChar(50), data.nationalId)
            .input('selfieUrl', sql.NVarChar(500), data.selfieUrl)
            .input('idFrontUrl', sql.NVarChar(500), data.idFrontUrl)
            .input('idBackUrl', sql.NVarChar(500), data.idBackUrl || null)
            .input('propertyProofUrl', sql.NVarChar(500), data.propertyProofUrl || null)
            .query(query);
        // Update user's agent status to PENDING
        await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('agentStatus', sql.NVarChar(20), 'PENDING')
            .query(`
                UPDATE Users 
                SET AgentStatus = @agentStatus, UpdatedAt = GETDATE() 
                WHERE UserId = @userId
            `);
        return result.recordset[0];
    }
    // Get verification by ID
    async getVerificationById(verificationId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(verificationId)) {
            throw new Error('Invalid verification ID format');
        }
        const query = `
            SELECT 
                av.*, 
                u.FullName, 
                u.Email, 
                u.PhoneNumber, 
                u.Role,
                u.AgentStatus
            FROM AgentVerification av
            INNER JOIN Users u ON av.UserId = u.UserId
            WHERE av.VerificationId = @verificationId
        `;
        const result = await db.request()
            .input('verificationId', sql.UniqueIdentifier, verificationId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get verification by user ID
    async getVerificationByUserId(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT 
                av.*,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.Role,
                u.AgentStatus
            FROM AgentVerification av
            INNER JOIN Users u ON av.UserId = u.UserId
            WHERE av.UserId = @userId
            ORDER BY av.SubmittedAt DESC
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get all verifications with pagination
    async getAllVerifications(page = 1, limit = 20, status) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        let whereClause = '';
        if (status) {
            whereClause = `WHERE av.ReviewStatus = @status`;
        }
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM AgentVerification av
            ${whereClause}
        `;
        const dataQuery = `
            SELECT 
                av.*,
                u.FullName as UserFullName,
                u.Email as UserEmail,
                u.PhoneNumber as UserPhoneNumber,
                u.Role as UserRole,
                u.AgentStatus as UserAgentStatus,
                r.FullName as ReviewerFullName
            FROM AgentVerification av
            INNER JOIN Users u ON av.UserId = u.UserId
            LEFT JOIN Users r ON av.ReviewedBy = r.UserId
            ${whereClause}
            ORDER BY av.SubmittedAt DESC
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const request = db.request();
            if (status) {
                request.input('status', sql.NVarChar(20), status);
            }
            const countResult = await request.query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, limit);
            const dataResult = await request.query(dataQuery);
            return {
                verifications: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Update verification (admin review)
    async updateVerification(verificationId, data, reviewerId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(verificationId)) {
            throw new Error('Invalid verification ID format');
        }
        if (!ValidationUtils.isValidUUID(reviewerId)) {
            throw new Error('Invalid reviewer ID format');
        }
        console.log('Service: updateVerification called with:', {
            verificationId,
            data,
            reviewerId
        });
        // Check if verification exists
        const verification = await this.getVerificationById(verificationId);
        if (!verification) {
            throw new Error('Verification not found');
        }
        // Build dynamic update query
        let updateFields = [];
        const request = db.request()
            .input('verificationId', sql.UniqueIdentifier, verificationId)
            .input('reviewerId', sql.UniqueIdentifier, reviewerId);
        if (data.reviewStatus) {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(data.reviewStatus)) {
                throw new Error('Invalid review status');
            }
            updateFields.push('ReviewStatus = @reviewStatus');
            request.input('reviewStatus', sql.NVarChar(20), data.reviewStatus);
        }
        if (data.reviewNotes !== undefined) {
            updateFields.push('ReviewNotes = @reviewNotes');
            request.input('reviewNotes', sql.NVarChar(sql.MAX), data.reviewNotes);
        }
        // Always set ReviewedBy to the reviewerId
        updateFields.push('ReviewedBy = @reviewerId');
        updateFields.push('ReviewedAt = GETDATE()');
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }
        const query = `
            UPDATE AgentVerification 
            SET ${updateFields.join(', ')} 
            OUTPUT INSERTED.*
            WHERE VerificationId = @verificationId
        `;
        console.log('Service: SQL Query:', query);
        try {
            const result = await request.query(query);
            console.log('Service: Update result:', result);
            // Update user's role and agent status based on verification review
            if (data.reviewStatus && data.reviewStatus !== 'PENDING') {
                if (data.reviewStatus === 'APPROVED') {
                    // User is approved - update to AGENT role with APPROVED status
                    await db.request()
                        .input('userId', sql.UniqueIdentifier, verification.UserId)
                        .input('userRole', sql.NVarChar(20), 'AGENT')
                        .input('agentStatus', sql.NVarChar(20), 'APPROVED')
                        .query(`
                            UPDATE Users 
                            SET Role = @userRole,
                                AgentStatus = @agentStatus, 
                                UpdatedAt = GETDATE() 
                            WHERE UserId = @userId
                        `);
                }
                else if (data.reviewStatus === 'REJECTED') {
                    // User is rejected - keep as TENANT (or current role) with REJECTED status
                    await db.request()
                        .input('userId', sql.UniqueIdentifier, verification.UserId)
                        .input('agentStatus', sql.NVarChar(20), 'REJECTED')
                        .query(`
                            UPDATE Users 
                            SET AgentStatus = @agentStatus, 
                                UpdatedAt = GETDATE() 
                            WHERE UserId = @userId
                        `);
                }
            }
            return result.recordset[0] || null;
        }
        catch (error) {
            console.error('Service: SQL Error in updateVerification:', error.message);
            console.error('Service: Error stack:', error.stack);
            // Check for specific SQL errors
            if (error.message.includes('Invalid column name')) {
                throw new Error(`Database schema error: ${error.message}`);
            }
            if (error.message.includes('Cannot insert the value NULL')) {
                throw new Error(`Missing required field: ${error.message}`);
            }
            throw error;
        }
    }
    // Approve verification (convenience method)
    async approveVerification(verificationId, reviewerId, reviewNotes) {
        return this.updateVerification(verificationId, {
            reviewStatus: 'APPROVED',
            reviewNotes
        }, reviewerId);
    }
    // Reject verification (convenience method)
    async rejectVerification(verificationId, reviewerId, reviewNotes) {
        return this.updateVerification(verificationId, {
            reviewStatus: 'REJECTED',
            reviewNotes
        }, reviewerId);
    }
    // Get verification statistics
    async getVerificationStatistics() {
        const db = await this.getDb();
        const queries = [
            'SELECT COUNT(*) as total FROM AgentVerification',
            'SELECT COUNT(*) as pending FROM AgentVerification WHERE ReviewStatus = \'PENDING\'',
            'SELECT COUNT(*) as approved FROM AgentVerification WHERE ReviewStatus = \'APPROVED\'',
            'SELECT COUNT(*) as rejected FROM AgentVerification WHERE ReviewStatus = \'REJECTED\'',
            `SELECT COUNT(*) as last30Days FROM AgentVerification 
             WHERE SubmittedAt >= DATEADD(DAY, -30, GETDATE())`
        ];
        try {
            const results = await Promise.all(queries.map(query => db.request().query(query)));
            return {
                total: parseInt(results[0].recordset[0].total),
                pending: parseInt(results[1].recordset[0].pending),
                approved: parseInt(results[2].recordset[0].approved),
                rejected: parseInt(results[3].recordset[0].rejected),
                last30Days: parseInt(results[4].recordset[0].last30Days)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Delete verification
    async deleteVerification(verificationId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(verificationId)) {
            throw new Error('Invalid verification ID format');
        }
        // Get verification first to update user status
        const verification = await this.getVerificationById(verificationId);
        if (!verification) {
            throw new Error('Verification not found');
        }
        const query = 'DELETE FROM AgentVerification WHERE VerificationId = @verificationId';
        const result = await db.request()
            .input('verificationId', sql.UniqueIdentifier, verificationId)
            .query(query);
        if (result.rowsAffected[0] > 0) {
            // Reset user's agent status to NONE
            await db.request()
                .input('userId', sql.UniqueIdentifier, verification.UserId)
                .input('agentStatus', sql.NVarChar(20), 'NONE')
                .query(`
                    UPDATE Users 
                    SET AgentStatus = @agentStatus, UpdatedAt = GETDATE() 
                    WHERE UserId = @userId
                `);
            return true;
        }
        return false;
    }
    // Bulk approve verifications
    async bulkApproveVerifications(verificationIds, reviewerId, reviewNotes) {
        const db = await this.getDb();
        if (!Array.isArray(verificationIds) || verificationIds.length === 0) {
            throw new Error('No verification IDs provided');
        }
        if (!ValidationUtils.isValidUUID(reviewerId)) {
            throw new Error('Invalid reviewer ID format');
        }
        // Validate all verification IDs are UUIDs
        for (const id of verificationIds) {
            if (!ValidationUtils.isValidUUID(id)) {
                throw new Error(`Invalid verification ID format: ${id}`);
            }
        }
        const results = [];
        // Process each verification
        for (const verificationId of verificationIds) {
            try {
                const approved = await this.approveVerification(verificationId, reviewerId, reviewNotes);
                if (approved) {
                    results.push(approved);
                }
            }
            catch (error) {
                console.error(`Failed to approve verification ${verificationId}:`, error);
                // Continue with other verifications
            }
        }
        return results;
    }
    // Bulk reject verifications
    async bulkRejectVerifications(verificationIds, reviewerId, reviewNotes) {
        const db = await this.getDb();
        if (!Array.isArray(verificationIds) || verificationIds.length === 0) {
            throw new Error('No verification IDs provided');
        }
        if (!ValidationUtils.isValidUUID(reviewerId)) {
            throw new Error('Invalid reviewer ID format');
        }
        // Validate all verification IDs are UUIDs
        for (const id of verificationIds) {
            if (!ValidationUtils.isValidUUID(id)) {
                throw new Error(`Invalid verification ID format: ${id}`);
            }
        }
        const results = [];
        // Process each verification
        for (const verificationId of verificationIds) {
            try {
                const rejected = await this.rejectVerification(verificationId, reviewerId, reviewNotes);
                if (rejected) {
                    results.push(rejected);
                }
            }
            catch (error) {
                console.error(`Failed to reject verification ${verificationId}:`, error);
                // Continue with other verifications
            }
        }
        return results;
    }
}
// Export singleton instance
export const agentVerificationService = new AgentVerificationService();
//# sourceMappingURL=agentService.js.map