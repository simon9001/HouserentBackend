import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class SavedPropertiesService {
    async getDb() {
        return getConnectionPool();
    }
    async saveProperty(userId, propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }
        const query = `
            IF NOT EXISTS (SELECT 1 FROM SavedProperties WHERE UserId = @userId AND PropertyId = @propertyId)
            BEGIN
                INSERT INTO SavedProperties (UserId, PropertyId)
                VALUES (@userId, @propertyId)
            END
        `;
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('propertyId', sql.UniqueIdentifier, propertyId)
                .query(query);
            return result.rowsAffected[0] > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async unsaveProperty(userId, propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }
        const query = `
            DELETE FROM SavedProperties 
            WHERE UserId = @userId AND PropertyId = @propertyId
        `;
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('propertyId', sql.UniqueIdentifier, propertyId)
                .query(query);
            return result.rowsAffected[0] > 0;
        }
        catch (error) {
            throw error;
        }
    }
    async getSavedPropertiesByUserId(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT s.*, p.Title, p.Description, p.RentAmount, p.County, p.Area, p.PropertyType,
                   (SELECT TOP 1 MediaUrl FROM PropertyMedia WHERE PropertyId = p.PropertyId AND IsPrimary = 1) as PrimaryImageUrl
            FROM SavedProperties s
            INNER JOIN Properties p ON s.PropertyId = p.PropertyId
            WHERE s.UserId = @userId
            ORDER BY s.CreatedAt DESC
        `;
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
            return result.recordset;
        }
        catch (error) {
            throw error;
        }
    }
    async isPropertySaved(userId, propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            return false;
        }
        const query = `
            SELECT 1 FROM SavedProperties 
            WHERE UserId = @userId AND PropertyId = @propertyId
        `;
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('propertyId', sql.UniqueIdentifier, propertyId)
                .query(query);
            return result.recordset.length > 0;
        }
        catch (error) {
            return false;
        }
    }
}
export const savedPropertiesService = new SavedPropertiesService();
//# sourceMappingURL=savedProperties.service.js.map