import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface AgentVerification {
    VerificationId: string;
    UserId: string;
    NationalId: string;
    SelfieUrl: string;
    IdFrontUrl: string;
    IdBackUrl: string | null;
    PropertyProofUrl: string | null;
    ReviewedBy: string | null;
    ReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    ReviewNotes: string | null;
    SubmittedAt: Date;
    ReviewedAt: Date | null;
}

export interface CreateVerificationInput {
    userId: string;
    nationalId: string;
    selfieUrl: string;
    idFrontUrl: string;
    idBackUrl?: string;
    propertyProofUrl?: string;
}

export interface UpdateVerificationInput {
    reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
    reviewedBy?: string;
}

export class AgentVerificationService {
    private db: sql.ConnectionPool | null = null;

    constructor() {
        // Lazy initialization
    }

    private async getDb(): Promise<sql.ConnectionPool> {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }

    // Create new agent verification
    async createVerification(data: CreateVerificationInput): Promise<AgentVerification> {
        const db = await this.getDb();
        
        // Validate user exists and is an agent
        const userCheckQuery = `
            SELECT UserId, Role FROM Users 
            WHERE UserId = @userId AND Role = 'AGENT' AND IsActive = 1
        `;
        
        const userCheck = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query(userCheckQuery);
        
        if (userCheck.recordset.length === 0) {
            throw new Error('User not found or is not an agent');
        }

        // Check if verification already exists
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
    async getVerificationById(verificationId: string): Promise<AgentVerification | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(verificationId)) {
            throw new Error('Invalid verification ID format');
        }

        const query = `
            SELECT av.*, u.FullName, u.Email, u.PhoneNumber, u.Role 
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
    async getVerificationByUserId(userId: string): Promise<AgentVerification | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }

        const query = `
            SELECT * FROM AgentVerification 
            WHERE UserId = @userId
            ORDER BY SubmittedAt DESC
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Get all verifications with pagination
    async getAllVerifications(
        page: number = 1, 
        limit: number = 20,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    ): Promise<{ verifications: AgentVerification[]; total: number; page: number; totalPages: number }> {
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
        } catch (error) {
            throw error;
        }
    }

    // Update verification (admin review)
    async updateVerification(
        verificationId: string, 
        data: UpdateVerificationInput, 
        reviewerId: string
    ): Promise<AgentVerification | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(verificationId)) {
            throw new Error('Invalid verification ID format');
        }

        if (!ValidationUtils.isValidUUID(reviewerId)) {
            throw new Error('Invalid reviewer ID format');
        }

        // Check if verification exists
        const verification = await this.getVerificationById(verificationId);
        if (!verification) {
            throw new Error('Verification not found');
        }

        // Build dynamic update query
        let updateFields: string[] = [];
        const inputs: { [key: string]: any } = { verificationId, reviewerId };

        if (data.reviewStatus) {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(data.reviewStatus)) {
                throw new Error('Invalid review status');
            }
            updateFields.push('ReviewStatus = @reviewStatus');
            inputs.reviewStatus = data.reviewStatus;
        }

        if (data.reviewNotes !== undefined) {
            updateFields.push('ReviewNotes = @reviewNotes');
            inputs.reviewNotes = data.reviewNotes;
        }

        if (data.reviewedBy) {
            if (!ValidationUtils.isValidUUID(data.reviewedBy)) {
                throw new Error('Invalid reviewer ID format');
            }
            updateFields.push('ReviewedBy = @reviewedBy');
            inputs.reviewedBy = data.reviewedBy;
        }

        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }

        updateFields.push('ReviewedAt = GETDATE()');

        const query = `
            UPDATE AgentVerification 
            SET ${updateFields.join(', ')} 
            OUTPUT INSERTED.*
            WHERE VerificationId = @verificationId
        `;

        try {
            const request = db.request()
                .input('verificationId', sql.UniqueIdentifier, verificationId);

            // Add all inputs dynamically
            Object.keys(inputs).forEach(key => {
                if (key !== 'verificationId') {
                    const value = inputs[key];
                    if (typeof value === 'string') {
                        request.input(key, sql.NVarChar, value);
                    }
                }
            });

            const result = await request.query(query);

            // Update user's agent status if review status changed
            if (data.reviewStatus && data.reviewStatus !== 'PENDING') {
                const userStatus = data.reviewStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED';
                
                await db.request()
                    .input('userId', sql.UniqueIdentifier, verification.UserId)
                    .input('agentStatus', sql.NVarChar(20), userStatus)
                    .query(`
                        UPDATE Users 
                        SET AgentStatus = @agentStatus, UpdatedAt = GETDATE() 
                        WHERE UserId = @userId
                    `);
            }

            return result.recordset[0] || null;
        } catch (error: any) {
            throw error;
        }
    }

    // Get verification statistics
    async getVerificationStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    }> {
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
            const results = await Promise.all(
                queries.map(query => db.request().query(query))
            );

            return {
                total: parseInt(results[0].recordset[0].total),
                pending: parseInt(results[1].recordset[0].pending),
                approved: parseInt(results[2].recordset[0].approved),
                rejected: parseInt(results[3].recordset[0].rejected),
                last30Days: parseInt(results[4].recordset[0].last30Days)
            };
        } catch (error) {
            throw error;
        }
    }

    // Delete verification
    async deleteVerification(verificationId: string): Promise<boolean> {
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
}

// Export singleton instance
export const agentVerificationService = new AgentVerificationService();