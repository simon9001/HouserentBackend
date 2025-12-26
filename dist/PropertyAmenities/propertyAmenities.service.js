import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyAmenitiesService {
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
    // Create new amenity
    async createAmenity(data) {
        const db = await this.getDb();
        // Validate property exists
        const propertyCheck = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .query('SELECT PropertyId FROM Properties WHERE PropertyId = @propertyId');
        if (propertyCheck.recordset.length === 0) {
            throw new Error('Property not found');
        }
        // Check if amenity already exists for this property
        const existingCheck = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .input('amenityName', sql.NVarChar(100), data.amenityName.trim())
            .query(`
                SELECT AmenityId FROM PropertyAmenities 
                WHERE PropertyId = @propertyId AND AmenityName = @amenityName
            `);
        if (existingCheck.recordset.length > 0) {
            throw new Error('Amenity already exists for this property');
        }
        // Create amenity
        const query = `
            INSERT INTO PropertyAmenities (PropertyId, AmenityName)
            OUTPUT INSERTED.*
            VALUES (@propertyId, @amenityName)
        `;
        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .input('amenityName', sql.NVarChar(100), data.amenityName.trim())
            .query(query);
        return result.recordset[0];
    }
    // Get amenity by ID
    async getAmenityById(amenityId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(amenityId)) {
            throw new Error('Invalid amenity ID format');
        }
        const query = `
            SELECT pa.*, p.Title as PropertyTitle 
            FROM PropertyAmenities pa
            INNER JOIN Properties p ON pa.PropertyId = p.PropertyId
            WHERE pa.AmenityId = @amenityId
        `;
        const result = await db.request()
            .input('amenityId', sql.UniqueIdentifier, amenityId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get amenities by property ID
    async getAmenitiesByPropertyId(propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }
        const query = `
            SELECT * FROM PropertyAmenities 
            WHERE PropertyId = @propertyId
            ORDER BY AmenityName ASC
        `;
        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);
        return result.recordset;
    }
    // Update amenity
    async updateAmenity(amenityId, amenityName) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(amenityId)) {
            throw new Error('Invalid amenity ID format');
        }
        if (!amenityName || amenityName.trim().length === 0) {
            throw new Error('Amenity name is required');
        }
        // Check if amenity exists
        const existingAmenity = await this.getAmenityById(amenityId);
        if (!existingAmenity) {
            throw new Error('Amenity not found');
        }
        // Check if amenity name already exists for this property
        const duplicateCheck = await db.request()
            .input('propertyId', sql.UniqueIdentifier, existingAmenity.PropertyId)
            .input('amenityName', sql.NVarChar(100), amenityName.trim())
            .input('amenityId', sql.UniqueIdentifier, amenityId)
            .query(`
                SELECT AmenityId FROM PropertyAmenities 
                WHERE PropertyId = @propertyId 
                AND AmenityName = @amenityName
                AND AmenityId != @amenityId
            `);
        if (duplicateCheck.recordset.length > 0) {
            throw new Error('Amenity name already exists for this property');
        }
        const query = `
            UPDATE PropertyAmenities 
            SET AmenityName = @amenityName
            OUTPUT INSERTED.*
            WHERE AmenityId = @amenityId
        `;
        const result = await db.request()
            .input('amenityId', sql.UniqueIdentifier, amenityId)
            .input('amenityName', sql.NVarChar(100), amenityName.trim())
            .query(query);
        return result.recordset[0] || null;
    }
    // Delete amenity
    async deleteAmenity(amenityId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(amenityId)) {
            throw new Error('Invalid amenity ID format');
        }
        const query = 'DELETE FROM PropertyAmenities WHERE AmenityId = @amenityId';
        const result = await db.request()
            .input('amenityId', sql.UniqueIdentifier, amenityId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Bulk create amenities
    async createBulkAmenities(data) {
        const db = await this.getDb();
        // Validate property exists
        const propertyCheck = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .query('SELECT PropertyId FROM Properties WHERE PropertyId = @propertyId');
        if (propertyCheck.recordset.length === 0) {
            throw new Error('Property not found');
        }
        const results = [];
        for (const amenityName of data.amenities) {
            try {
                // Check if amenity already exists
                const existingCheck = await db.request()
                    .input('propertyId', sql.UniqueIdentifier, data.propertyId)
                    .input('amenityName', sql.NVarChar(100), amenityName.trim())
                    .query(`
                        SELECT AmenityId FROM PropertyAmenities 
                        WHERE PropertyId = @propertyId AND AmenityName = @amenityName
                    `);
                if (existingCheck.recordset.length === 0) {
                    // Create amenity
                    const result = await db.request()
                        .input('propertyId', sql.UniqueIdentifier, data.propertyId)
                        .input('amenityName', sql.NVarChar(100), amenityName.trim())
                        .query(`
                            INSERT INTO PropertyAmenities (PropertyId, AmenityName)
                            OUTPUT INSERTED.*
                            VALUES (@propertyId, @amenityName)
                        `);
                    results.push(result.recordset[0]);
                }
            }
            catch (error) {
                console.error('Error creating amenity:', error);
                // Continue with other amenities
            }
        }
        return results;
    }
    // Delete all amenities for a property
    async deleteAmenitiesByPropertyId(propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }
        const query = 'DELETE FROM PropertyAmenities WHERE PropertyId = @propertyId';
        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Get common amenities (statistics)
    async getCommonAmenities(limit = 10) {
        const db = await this.getDb();
        const query = `
            SELECT TOP ${limit} AmenityName, COUNT(*) as count
            FROM PropertyAmenities
            GROUP BY AmenityName
            ORDER BY count DESC, AmenityName ASC
        `;
        const result = await db.request().query(query);
        return result.recordset;
    }
    // Search amenities
    async searchAmenities(searchTerm, propertyId) {
        const db = await this.getDb();
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }
        let whereClause = 'WHERE pa.AmenityName LIKE @searchTerm';
        if (propertyId) {
            whereClause += ' AND pa.PropertyId = @propertyId';
        }
        const query = `
            SELECT pa.*, p.Title as PropertyTitle
            FROM PropertyAmenities pa
            INNER JOIN Properties p ON pa.PropertyId = p.PropertyId
            ${whereClause}
            ORDER BY pa.AmenityName ASC
        `;
        const request = db.request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
        if (propertyId) {
            request.input('propertyId', sql.UniqueIdentifier, propertyId);
        }
        const result = await request.query(query);
        return result.recordset;
    }
    // Get amenities statistics
    async getAmenitiesStatistics(propertyId) {
        const db = await this.getDb();
        let whereClause = '';
        if (propertyId) {
            whereClause = 'WHERE PropertyId = @propertyId';
        }
        const queries = [
            `SELECT COUNT(*) as total FROM PropertyAmenities ${whereClause}`,
            `SELECT COUNT(DISTINCT AmenityName) as uniqueAmenities FROM PropertyAmenities ${whereClause}`,
            propertyId ? '' : `SELECT AVG(amenityCount) as averagePerProperty FROM (
                SELECT PropertyId, COUNT(*) as amenityCount 
                FROM PropertyAmenities 
                GROUP BY PropertyId
            ) as propertyAmenities`
        ].filter(query => query !== '');
        try {
            const request = db.request();
            if (propertyId) {
                request.input('propertyId', sql.UniqueIdentifier, propertyId);
            }
            const results = await Promise.all(queries.map(query => request.query(query)));
            // Get most common amenities
            const commonAmenities = propertyId
                ? []
                : await this.getCommonAmenities(5);
            return {
                total: parseInt(results[0].recordset[0].total),
                uniqueAmenities: parseInt(results[1].recordset[0].uniqueAmenities),
                averagePerProperty: propertyId ? 0 : parseFloat(results[2].recordset[0].averagePerProperty || 0),
                mostCommon: commonAmenities
            };
        }
        catch (error) {
            throw error;
        }
    }
}
// Export singleton instance
export const propertyAmenitiesService = new PropertyAmenitiesService();
//# sourceMappingURL=propertyAmenities.service.js.map