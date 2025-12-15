import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface AuditLog {
    LogId: string;
    UserId?: string;
    Action: string;
    Entity: string;
    EntityId?: string;
    IpAddress?: string;
    UserAgent?: string;
    Metadata?: string;
    CreatedAt: Date;
}

export interface CreateAuditLogInput {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
}

export class AuditLogsService {
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

    // Create audit log
    async createLog(data: CreateAuditLogInput): Promise<AuditLog> {
        const db = await this.getDb();
        
        // Validate user exists if provided
        if (data.userId) {
            const userCheck = await db.request()
                .input('userId', sql.UniqueIdentifier, data.userId)
                .query('SELECT UserId FROM Users WHERE UserId = @userId');
            
            if (userCheck.recordset.length === 0) {
                throw new Error('User not found');
            }
        }

        const query = `
            INSERT INTO AuditLogs (UserId, Action, Entity, EntityId, IpAddress, UserAgent, Metadata)
            OUTPUT INSERTED.*
            VALUES (@userId, @action, @entity, @entityId, @ipAddress, @userAgent, @metadata)
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId || null)
            .input('action', sql.NVarChar(100), data.action)
            .input('entity', sql.NVarChar(100), data.entity)
            .input('entityId', sql.UniqueIdentifier, data.entityId || null)
            .input('ipAddress', sql.NVarChar(45), data.ipAddress || null)
            .input('userAgent', sql.NVarChar(500), data.userAgent || null)
            .input('metadata', sql.NVarChar, data.metadata ? JSON.stringify(data.metadata) : null)
            .query(query);

        return result.recordset[0];
    }

    // Get log by ID
    async getLogById(logId: string): Promise<AuditLog & { UserName?: string }> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(logId)) {
            throw new Error('Invalid log ID format');
        }

        const query = `
            SELECT 
                al.*,
                u.FullName as UserName
            FROM AuditLogs al
            LEFT JOIN Users u ON al.UserId = u.UserId
            WHERE al.LogId = @logId
        `;

        const result = await db.request()
            .input('logId', sql.UniqueIdentifier, logId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Get logs by user ID
    async getLogsByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<{
        logs: AuditLog[];
        total: number;
    }> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }

        // Get logs
        const logsQuery = `
            SELECT al.*
            FROM AuditLogs al
            WHERE al.UserId = @userId
            ORDER BY al.CreatedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM AuditLogs
            WHERE UserId = @userId
        `;

        const [logsResult, countResult] = await Promise.all([
            db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('limit', sql.Int, limit)
                .input('offset', sql.Int, offset)
                .query(logsQuery),
            db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(countQuery)
        ]);

        return {
            logs: logsResult.recordset,
            total: parseInt(countResult.recordset[0].total)
        };
    }

    // Get logs by entity
    async getLogsByEntity(entity: string, entityId?: string, limit: number = 100, offset: number = 0): Promise<{
        logs: Array<AuditLog & { UserName?: string }>;
        total: number;
    }> {
        const db = await this.getDb();

        let whereClause = 'WHERE al.Entity = @entity';
        if (entityId) {
            whereClause += ' AND al.EntityId = @entityId';
        }

        // Get logs with user info
        const logsQuery = `
            SELECT 
                al.*,
                u.FullName as UserName
            FROM AuditLogs al
            LEFT JOIN Users u ON al.UserId = u.UserId
            ${whereClause}
            ORDER BY al.CreatedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM AuditLogs
            ${whereClause}
        `;

        const request = db.request()
            .input('entity', sql.NVarChar(100), entity)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset);
        
        if (entityId) {
            request.input('entityId', sql.UniqueIdentifier, entityId);
        }

        const [logsResult, countResult] = await Promise.all([
            request.query(logsQuery),
            request.query(countQuery)
        ]);

        return {
            logs: logsResult.recordset,
            total: parseInt(countResult.recordset[0].total)
        };
    }

    // Search logs
    async searchLogs(
        searchTerm: string,
        userId?: string,
        entity?: string,
        startDate?: Date,
        endDate?: Date,
        limit: number = 100,
        offset: number = 0
    ): Promise<{
        logs: Array<AuditLog & { UserName?: string }>;
        total: number;
    }> {
        const db = await this.getDb();
        
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }

        let whereClause = 'WHERE (al.Action LIKE @searchTerm OR al.Entity LIKE @searchTerm OR u.FullName LIKE @searchTerm)';
        const inputs: any = { searchTerm: `%${searchTerm}%` };

        if (userId) {
            whereClause += ' AND al.UserId = @userId';
            inputs.userId = userId;
        }
        if (entity) {
            whereClause += ' AND al.Entity = @entity';
            inputs.entity = entity;
        }
        if (startDate) {
            whereClause += ' AND al.CreatedAt >= @startDate';
            inputs.startDate = startDate;
        }
        if (endDate) {
            whereClause += ' AND al.CreatedAt <= @endDate';
            inputs.endDate = endDate;
        }

        // Get logs with user info
        const logsQuery = `
            SELECT 
                al.*,
                u.FullName as UserName
            FROM AuditLogs al
            LEFT JOIN Users u ON al.UserId = u.UserId
            ${whereClause}
            ORDER BY al.CreatedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM AuditLogs al
            LEFT JOIN Users u ON al.UserId = u.UserId
            ${whereClause}
        `;

        const request = db.request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset);

        // Add dynamic inputs
        if (userId) request.input('userId', sql.UniqueIdentifier, userId);
        if (entity) request.input('entity', sql.NVarChar(100), entity);
        if (startDate) request.input('startDate', sql.DateTime, startDate);
        if (endDate) request.input('endDate', sql.DateTime, endDate);

        const [logsResult, countResult] = await Promise.all([
            request.query(logsQuery),
            request.query(countQuery)
        ]);

        return {
            logs: logsResult.recordset,
            total: parseInt(countResult.recordset[0].total)
        };
    }

    // Get audit statistics
    async getAuditStatistics(startDate?: Date, endDate?: Date): Promise<{
        totalLogs: number;
        logsByUser: Array<{ userId: string; userName: string; count: number }>;
        logsByEntity: Array<{ entity: string; count: number }>;
        logsByAction: Array<{ action: string; count: number }>;
        dailyActivity: Array<{ date: string; count: number }>;
    }> {
        const db = await this.getDb();

        let whereClause = '';
        if (startDate || endDate) {
            whereClause = 'WHERE 1=1';
            if (startDate) whereClause += ' AND CreatedAt >= @startDate';
            if (endDate) whereClause += ' AND CreatedAt <= @endDate';
        }

        const queries = [
            `SELECT COUNT(*) as totalLogs FROM AuditLogs ${whereClause}`,
            `
                SELECT TOP 10 
                    al.UserId,
                    u.FullName as userName,
                    COUNT(*) as count
                FROM AuditLogs al
                LEFT JOIN Users u ON al.UserId = u.UserId
                ${whereClause}
                GROUP BY al.UserId, u.FullName
                ORDER BY count DESC
            `,
            `
                SELECT TOP 10 
                    Entity as entity,
                    COUNT(*) as count
                FROM AuditLogs
                ${whereClause}
                GROUP BY Entity
                ORDER BY count DESC
            `,
            `
                SELECT TOP 10 
                    Action as action,
                    COUNT(*) as count
                FROM AuditLogs
                ${whereClause}
                GROUP BY Action
                ORDER BY count DESC
            `,
            `
                SELECT 
                    CONVERT(DATE, CreatedAt) as date,
                    COUNT(*) as count
                FROM AuditLogs
                ${whereClause ? whereClause + ' AND' : 'WHERE'} 
                CreatedAt >= DATEADD(DAY, -30, SYSDATETIME())
                GROUP BY CONVERT(DATE, CreatedAt)
                ORDER BY date DESC
            `
        ];

        const request = db.request();
        if (startDate) request.input('startDate', sql.DateTime, startDate);
        if (endDate) request.input('endDate', sql.DateTime, endDate);

        const results = await Promise.all(
            queries.map(query => request.query(query))
        );

        return {
            totalLogs: parseInt(results[0].recordset[0].totalLogs),
            logsByUser: results[1].recordset,
            logsByEntity: results[2].recordset,
            logsByAction: results[3].recordset,
            dailyActivity: results[4].recordset
        };
    }

    // Clean old logs (admin only)
    async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
        const db = await this.getDb();

        if (daysToKeep < 1 || daysToKeep > 365) {
            throw new Error('Days to keep must be between 1 and 365');
        }

        const query = `
            DELETE FROM AuditLogs 
            WHERE CreatedAt < DATEADD(DAY, -@daysToKeep, SYSDATETIME())
        `;

        const result = await db.request()
            .input('daysToKeep', sql.Int, daysToKeep)
            .query(query);

        return result.rowsAffected[0];
    }
}

export const auditLogsService = new AuditLogsService();