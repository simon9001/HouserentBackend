import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
import crypto from 'crypto';
export class UserSessionsService {
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
    // Create new session
    async createSession(data) {
        const db = await this.getDb();
        // Validate user exists
        const userCheck = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query('SELECT UserId FROM Users WHERE UserId = @userId AND IsActive = 1');
        if (userCheck.recordset.length === 0) {
            throw new Error('User not found or inactive');
        }
        const refreshTokenHash = crypto.createHash('sha256').update(data.refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + (data.expiresInDays || 30) * 24 * 60 * 60 * 1000);
        const query = `
            INSERT INTO UserSessions (UserId, DeviceId, RefreshTokenHash, ExpiresAt, IsActive)
            OUTPUT INSERTED.*
            VALUES (@userId, @deviceId, @refreshTokenHash, @expiresAt, 1)
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('deviceId', sql.NVarChar(200), data.deviceId || null)
            .input('refreshTokenHash', sql.NVarChar(500), refreshTokenHash)
            .input('expiresAt', sql.DateTime, expiresAt)
            .query(query);
        return result.recordset[0];
    }
    // Validate session by refresh token
    async validateSession(refreshToken) {
        const db = await this.getDb();
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const query = `
            SELECT * FROM UserSessions
            WHERE RefreshTokenHash = @refreshTokenHash
            AND IsActive = 1
        `;
        const result = await db.request()
            .input('refreshTokenHash', sql.NVarChar(500), refreshTokenHash)
            .query(query);
        if (result.recordset.length === 0) {
            return { isValid: false, message: 'Invalid session' };
        }
        const session = result.recordset[0];
        if (new Date(session.ExpiresAt) < new Date()) {
            return { isValid: false, message: 'Session expired' };
        }
        // Update last accessed timestamp
        await this.updateLastAccessed(session.SessionId);
        return { isValid: true, session };
    }
    // Get session by ID
    async getSessionById(sessionId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(sessionId)) {
            throw new Error('Invalid session ID format');
        }
        const query = `
            SELECT * FROM UserSessions
            WHERE SessionId = @sessionId
        `;
        const result = await db.request()
            .input('sessionId', sql.UniqueIdentifier, sessionId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get active sessions for user
    async getUserSessions(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT * FROM UserSessions
            WHERE UserId = @userId
            AND IsActive = 1
            AND ExpiresAt > SYSDATETIME()
            ORDER BY LastAccessedAt DESC
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.recordset;
    }
    // Update last accessed timestamp
    async updateLastAccessed(sessionId) {
        const db = await this.getDb();
        const query = `
            UPDATE UserSessions 
            SET LastAccessedAt = SYSDATETIME()
            WHERE SessionId = @sessionId
        `;
        await db.request()
            .input('sessionId', sql.UniqueIdentifier, sessionId)
            .query(query);
    }
    // Revoke session
    async revokeSession(sessionId) {
        const db = await this.getDb();
        const query = `
            UPDATE UserSessions 
            SET IsActive = 0
            WHERE SessionId = @sessionId
        `;
        const result = await db.request()
            .input('sessionId', sql.UniqueIdentifier, sessionId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Revoke all sessions for user
    async revokeAllUserSessions(userId, excludeSessionId) {
        const db = await this.getDb();
        let query = `
            UPDATE UserSessions 
            SET IsActive = 0
            WHERE UserId = @userId
            AND IsActive = 1
        `;
        if (excludeSessionId) {
            query += ' AND SessionId != @excludeSessionId';
        }
        const request = db.request()
            .input('userId', sql.UniqueIdentifier, userId);
        if (excludeSessionId) {
            request.input('excludeSessionId', sql.UniqueIdentifier, excludeSessionId);
        }
        const result = await request.query(query);
        return result.rowsAffected[0];
    }
    // Clean expired sessions
    async cleanExpiredSessions() {
        const db = await this.getDb();
        const query = `
            DELETE FROM UserSessions 
            WHERE ExpiresAt < DATEADD(DAY, -7, SYSDATETIME())
        `;
        const result = await db.request().query(query);
        return result.rowsAffected[0];
    }
    // Get session statistics
    async getSessionStatistics(userId) {
        const db = await this.getDb();
        let whereClause = '';
        if (userId) {
            whereClause = 'WHERE UserId = @userId';
        }
        const queries = [
            `SELECT COUNT(*) as totalActive FROM UserSessions ${whereClause} AND IsActive = 1 AND ExpiresAt > SYSDATETIME()`,
            `SELECT COUNT(*) as totalExpired FROM UserSessions ${whereClause} AND (IsActive = 0 OR ExpiresAt <= SYSDATETIME())`,
            `SELECT TOP 10 * FROM UserSessions ${whereClause} ORDER BY LastAccessedAt DESC`
        ];
        const request = db.request();
        if (userId) {
            request.input('userId', sql.UniqueIdentifier, userId);
        }
        const results = await Promise.all(queries.map(query => request.query(query)));
        return {
            totalActive: parseInt(results[0].recordset[0].totalActive),
            totalExpired: parseInt(results[1].recordset[0].totalExpired),
            recentSessions: results[2].recordset
        };
    }
}
export const userSessionsService = new UserSessionsService();
//# sourceMappingURL=userSessions.service.js.map