import sql from "mssql";
import { getConnectionPool } from "../Database/config.js";
export class StatusService {
    async createStatus(statusData) {
        const pool = getConnectionPool();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const result = await pool.request()
            .input("UserId", sql.UniqueIdentifier, statusData.UserId)
            .input("MediaUrl", sql.NVarChar, statusData.MediaUrl)
            .input("TextContent", sql.NVarChar, statusData.TextContent)
            .input("BackgroundColor", sql.NVarChar, statusData.BackgroundColor)
            .input("Type", sql.NVarChar, statusData.Type)
            .input("ExpiresAt", sql.DateTime2, expiresAt)
            .query(`
                INSERT INTO UserStatus (UserId, MediaUrl, TextContent, BackgroundColor, Type, ExpiresAt)
                OUTPUT INSERTED.*
                VALUES (@UserId, @MediaUrl, @TextContent, @BackgroundColor, @Type, @ExpiresAt)
            `);
        return result.recordset[0];
    }
    async getActiveStatuses() {
        const pool = getConnectionPool();
        // Fetch active statuses that haven't expired
        // Grouping by User could be done here or in frontend
        const result = await pool.request()
            .query(`
                SELECT 
                    s.*,
                    u.Username,
                    u.FullName,
                    u.Role
                    -- Add User Avatar URL if available in Users table or related table
                FROM UserStatus s
                INNER JOIN Users u ON s.UserId = u.UserId
                WHERE s.IsActive = 1 
                AND s.ExpiresAt > SYSDATETIME()
                ORDER BY s.CreatedAt DESC
            `);
        return result.recordset;
    }
    async deleteStatus(statusId, userId) {
        const pool = getConnectionPool();
        await pool.request()
            .input("StatusId", sql.UniqueIdentifier, statusId)
            .input("UserId", sql.UniqueIdentifier, userId)
            .query(`
                UPDATE UserStatus 
                SET IsActive = 0 
                WHERE StatusId = @StatusId AND UserId = @UserId
            `);
    }
}
//# sourceMappingURL=status.service.js.map