
import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';

export interface Notification {
    NotificationId: string;
    UserId: string;
    Title: string;
    Message: string;
    Type: 'BOOKING' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'ALERT';
    ReferenceId?: string;
    IsRead: boolean;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface CreateNotificationInput {
    userId: string;
    title: string;
    message: string;
    type: 'BOOKING' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'ALERT';
    referenceId?: string;
}

export class NotificationService {
    private db: sql.ConnectionPool | null = null;

    private async getDb(): Promise<sql.ConnectionPool> {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }

    async getNotificationsByUser(userId: string): Promise<Notification[]> {
        const db = await this.getDb();
        const query = `
            SELECT * FROM Notifications 
            WHERE UserId = @userId 
            ORDER BY CreatedAt DESC
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);

        return result.recordset;
    }

    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const db = await this.getDb();
        const query = `
            UPDATE Notifications 
            SET IsRead = 1, UpdatedAt = SYSDATETIME()
            WHERE NotificationId = @notificationId AND UserId = @userId
        `;

        const result = await db.request()
            .input('notificationId', sql.UniqueIdentifier, notificationId)
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const db = await this.getDb();
        const query = `
            UPDATE Notifications 
            SET IsRead = 1, UpdatedAt = SYSDATETIME()
            WHERE UserId = @userId AND IsRead = 0
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    async createNotification(input: CreateNotificationInput): Promise<Notification> {
        const db = await this.getDb();
        const query = `
            INSERT INTO Notifications (UserId, Title, Message, Type, ReferenceId)
            OUTPUT INSERTED.*
            VALUES (@userId, @title, @message, @type, @referenceId)
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, input.userId)
            .input('title', sql.NVarChar(200), input.title)
            .input('message', sql.NVarChar(1000), input.message)
            .input('type', sql.NVarChar(50), input.type)
            .input('referenceId', sql.UniqueIdentifier, input.referenceId || null)
            .query(query);

        return result.recordset[0];
    }

    // Helper to get unread count
    async getUnreadCount(userId: string): Promise<number> {
        const db = await this.getDb();
        const query = `
            SELECT COUNT(*) as count FROM Notifications 
            WHERE UserId = @userId AND IsRead = 0
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);

        return result.recordset[0].count;
    }

    // Broadcast to all users
    async createBroadcastNotification(title: string, message: string, type: 'SYSTEM' | 'ALERT' = 'SYSTEM'): Promise<number> {
        const db = await this.getDb();

        // Insert for all active users
        const query = `
            INSERT INTO Notifications (UserId, Title, Message, Type)
            SELECT UserId, @title, @message, @type
            FROM Users 
            WHERE IsActive = 1
        `;

        const result = await db.request()
            .input('title', sql.NVarChar(200), title)
            .input('message', sql.NVarChar(1000), message)
            .input('type', sql.NVarChar(50), type)
            .query(query);

        return result.rowsAffected[0];
    }

    // Send to clients (users who have visited agent's properties)
    async createClientNotification(agentId: string, title: string, message: string): Promise<number> {
        const db = await this.getDb();

        // Find distinct tenants who have visits with this agent
        const query = `
            INSERT INTO Notifications (UserId, Title, Message, Type)
            SELECT DISTINCT pv.TenantId, @title, @message, 'ALERT'
            FROM PropertyVisits pv
            WHERE pv.AgentId = @agentId
        `;

        const result = await db.request()
            .input('agentId', sql.UniqueIdentifier, agentId)
            .input('title', sql.NVarChar(200), title)
            .input('message', sql.NVarChar(1000), message)
            .query(query);

        return result.rowsAffected[0];
    }
}

export const notificationService = new NotificationService();
