import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertiesService {
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
    // Create new property
    async createProperty(data) {
        const db = await this.getDb();
        // Validate owner exists
        const ownerCheckQuery = `
            SELECT UserId FROM Users 
            WHERE UserId = @ownerId AND IsActive = 1
        `;
        const ownerCheck = await db.request()
            .input('ownerId', sql.UniqueIdentifier, data.ownerId)
            .query(ownerCheckQuery);
        if (ownerCheck.recordset.length === 0) {
            throw new Error('Owner not found or inactive');
        }
        // Validate required fields
        if (!data.title || !data.description || !data.rentAmount || !data.county || !data.area) {
            throw new Error('Missing required fields: title, description, rentAmount, county, area');
        }
        // Validate property type
        const validPropertyTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
        const propertyType = data.propertyType || 'APARTMENT';
        if (!validPropertyTypes.includes(propertyType)) {
            throw new Error('Invalid property type');
        }
        // Validate rent amount
        if (data.rentAmount <= 0) {
            throw new Error('Rent amount must be greater than 0');
        }
        if (data.depositAmount && data.depositAmount < 0) {
            throw new Error('Deposit amount cannot be negative');
        }
        // Create property
        const query = `
            DECLARE @InsertedRows TABLE (PropertyId UNIQUEIDENTIFIER);
            INSERT INTO Properties (
                OwnerId, Title, Description, RentAmount, DepositAmount,
                County, Constituency, Area, StreetAddress, Latitude, Longitude,
                PropertyType, Bedrooms, Bathrooms, Rules
            ) 
            OUTPUT INSERTED.PropertyId INTO @InsertedRows
            VALUES (
                @ownerId, @title, @description, @rentAmount, @depositAmount,
                @county, @constituency, @area, @streetAddress, @latitude, @longitude,
                @propertyType, @bedrooms, @bathrooms, @rules
            );

            SELECT * FROM Properties WHERE PropertyId = (SELECT TOP 1 PropertyId FROM @InsertedRows);
        `;
        const result = await db.request()
            .input('ownerId', sql.UniqueIdentifier, data.ownerId)
            .input('title', sql.NVarChar(200), data.title)
            .input('description', sql.NVarChar(sql.MAX), data.description)
            .input('rentAmount', sql.Decimal(10, 2), data.rentAmount)
            .input('depositAmount', sql.Decimal(10, 2), data.depositAmount || null)
            .input('county', sql.NVarChar(100), data.county)
            .input('constituency', sql.NVarChar(100), data.constituency || null)
            .input('area', sql.NVarChar(150), data.area)
            .input('streetAddress', sql.NVarChar(500), data.streetAddress || null)
            .input('latitude', sql.Decimal(9, 6), data.latitude || null)
            .input('longitude', sql.Decimal(9, 6), data.longitude || null)
            .input('propertyType', sql.NVarChar(50), propertyType)
            .input('bedrooms', sql.Int, data.bedrooms || null)
            .input('bathrooms', sql.Int, data.bathrooms || null)
            .input('rules', sql.NVarChar(sql.MAX), data.rules || null)
            .query(query);
        return result.recordset[0];
    }
    // Get property by ID
    async getPropertyById(propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }
        const query = `
            SELECT 
                p.*,
                u.FullName as OwnerName,
                u.Email as OwnerEmail,
                u.PhoneNumber as OwnerPhoneNumber,
                u.TrustScore as OwnerTrustScore,
                u.AgentStatus as OwnerAgentStatus
            FROM Properties p
            INNER JOIN Users u ON p.OwnerId = u.UserId
            WHERE p.PropertyId = @propertyId AND u.IsActive = 1
        `;
        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);
        return result.recordset[0] || null;
    }
    // Get properties by owner
    async getPropertiesByOwner(ownerId, page = 1, limit = 20) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        if (!ValidationUtils.isValidUUID(ownerId)) {
            throw new Error('Invalid owner ID format');
        }
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Properties 
            WHERE OwnerId = @ownerId
        `;
        const dataQuery = `
            SELECT * FROM Properties 
            WHERE OwnerId = @ownerId
            ORDER BY CreatedAt DESC
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const countResult = await db.request()
                .input('ownerId', sql.UniqueIdentifier, ownerId)
                .query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            const dataResult = await db.request()
                .input('ownerId', sql.UniqueIdentifier, ownerId)
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(dataQuery);
            return {
                properties: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Get all properties with filters
    async getAllProperties(page = 1, limit = 20, filters = {}) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        // Build WHERE clause based on filters
        const whereConditions = ['p.IsAvailable = 1', 'u.IsActive = 1'];
        const inputs = {};
        if (filters.county) {
            whereConditions.push('p.County LIKE @county');
            inputs.county = `%${filters.county}%`;
        }
        if (filters.area) {
            whereConditions.push('p.Area LIKE @area');
            inputs.area = `%${filters.area}%`;
        }
        if (filters.minRent) {
            whereConditions.push('p.RentAmount >= @minRent');
            inputs.minRent = filters.minRent;
        }
        if (filters.maxRent) {
            whereConditions.push('p.RentAmount <= @maxRent');
            inputs.maxRent = filters.maxRent;
        }
        if (filters.propertyType) {
            whereConditions.push('p.PropertyType = @propertyType');
            inputs.propertyType = filters.propertyType;
        }
        if (filters.bedrooms) {
            whereConditions.push('p.Bedrooms = @bedrooms');
            inputs.bedrooms = filters.bedrooms;
        }
        if (filters.isVerified !== undefined) {
            whereConditions.push('p.IsVerified = @isVerified');
            inputs.isVerified = filters.isVerified;
        }
        if (filters.searchTerm) {
            whereConditions.push('(p.Title LIKE @searchTerm OR p.Description LIKE @searchTerm OR p.Area LIKE @searchTerm)');
            inputs.searchTerm = `%${filters.searchTerm}%`;
        }
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Properties p
            INNER JOIN Users u ON p.OwnerId = u.UserId
            ${whereClause}
        `;
        const dataQuery = `
            SELECT 
                p.*,
                u.FullName as OwnerName,
                u.TrustScore as OwnerTrustScore,
                u.AgentStatus as OwnerAgentStatus
            FROM Properties p
            INNER JOIN Users u ON p.OwnerId = u.UserId
            ${whereClause}
            ORDER BY 
                CASE WHEN p.IsBoosted = 1 AND (p.BoostExpiry IS NULL OR p.BoostExpiry > GETDATE()) THEN 0 ELSE 1 END,
                p.CreatedAt DESC
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const request = db.request();
            // Add filter inputs
            Object.keys(inputs).forEach(key => {
                const value = inputs[key];
                if (typeof value === 'string') {
                    request.input(key, sql.NVarChar, value);
                }
                else if (typeof value === 'number') {
                    request.input(key, sql.Decimal(10, 2), value);
                }
                else if (typeof value === 'boolean') {
                    request.input(key, sql.Bit, value);
                }
            });
            const countResult = await request.query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, limit);
            const dataResult = await request.query(dataQuery);
            return {
                properties: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Update property
    async updateProperty(propertyId, data) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }
        // Check if property exists
        const property = await this.getPropertyById(propertyId);
        if (!property) {
            throw new Error('Property not found');
        }
        // Build dynamic update query
        let updateFields = [];
        const inputs = { propertyId };
        if (data.title) {
            updateFields.push('Title = @title');
            inputs.title = data.title;
        }
        if (data.description) {
            updateFields.push('Description = @description');
            inputs.description = data.description;
        }
        if (data.rentAmount !== undefined) {
            if (data.rentAmount <= 0) {
                throw new Error('Rent amount must be greater than 0');
            }
            updateFields.push('RentAmount = @rentAmount');
            inputs.rentAmount = data.rentAmount;
        }
        if (data.depositAmount !== undefined) {
            if (data.depositAmount !== null && data.depositAmount < 0) {
                throw new Error('Deposit amount cannot be negative');
            }
            updateFields.push('DepositAmount = @depositAmount');
            inputs.depositAmount = data.depositAmount;
        }
        if (data.county) {
            updateFields.push('County = @county');
            inputs.county = data.county;
        }
        if (data.constituency !== undefined) {
            updateFields.push('Constituency = @constituency');
            inputs.constituency = data.constituency;
        }
        if (data.area) {
            updateFields.push('Area = @area');
            inputs.area = data.area;
        }
        if (data.streetAddress !== undefined) {
            updateFields.push('StreetAddress = @streetAddress');
            inputs.streetAddress = data.streetAddress;
        }
        if (data.latitude !== undefined) {
            updateFields.push('Latitude = @latitude');
            inputs.latitude = data.latitude;
        }
        if (data.longitude !== undefined) {
            updateFields.push('Longitude = @longitude');
            inputs.longitude = data.longitude;
        }
        if (data.propertyType) {
            const validPropertyTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
            if (!validPropertyTypes.includes(data.propertyType)) {
                throw new Error('Invalid property type');
            }
            updateFields.push('PropertyType = @propertyType');
            inputs.propertyType = data.propertyType;
        }
        if (data.bedrooms !== undefined) {
            updateFields.push('Bedrooms = @bedrooms');
            inputs.bedrooms = data.bedrooms;
        }
        if (data.bathrooms !== undefined) {
            updateFields.push('Bathrooms = @bathrooms');
            inputs.bathrooms = data.bathrooms;
        }
        if (data.rules !== undefined) {
            updateFields.push('Rules = @rules');
            inputs.rules = data.rules;
        }
        if (data.isAvailable !== undefined) {
            updateFields.push('IsAvailable = @isAvailable');
            inputs.isAvailable = data.isAvailable;
        }
        if (data.isVerified !== undefined) {
            updateFields.push('IsVerified = @isVerified');
            inputs.isVerified = data.isVerified;
        }
        if (data.isBoosted !== undefined) {
            updateFields.push('IsBoosted = @isBoosted');
            inputs.isBoosted = data.isBoosted;
        }
        if (data.boostExpiry !== undefined) {
            updateFields.push('BoostExpiry = @boostExpiry');
            inputs.boostExpiry = data.boostExpiry;
        }
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }
        updateFields.push('UpdatedAt = GETDATE()');
        const query = `
            UPDATE Properties 
            SET ${updateFields.join(', ')} 
            WHERE PropertyId = @propertyId;

            SELECT * FROM Properties WHERE PropertyId = @propertyId;
        `;
        try {
            const request = db.request()
                .input('propertyId', sql.UniqueIdentifier, propertyId);
            // Add all inputs dynamically
            Object.keys(inputs).forEach(key => {
                if (key !== 'propertyId') {
                    const value = inputs[key];
                    if (typeof value === 'string') {
                        request.input(key, sql.NVarChar, value);
                    }
                    else if (typeof value === 'number') {
                        if (key === 'rentAmount' || key === 'depositAmount') {
                            request.input(key, sql.Decimal(10, 2), value);
                        }
                        else if (key === 'latitude' || key === 'longitude') {
                            request.input(key, sql.Decimal(9, 6), value);
                        }
                        else {
                            request.input(key, sql.Int, value);
                        }
                    }
                    else if (typeof value === 'boolean') {
                        request.input(key, sql.Bit, value);
                    }
                    else if (value === null) {
                        request.input(key, sql.NVarChar, null);
                    }
                    else if (value instanceof Date) {
                        request.input(key, sql.DateTime2, value);
                    }
                }
            });
            const result = await request.query(query);
            return result.recordset[0] || null;
        }
        catch (error) {
            throw error;
        }
    }
    // Delete property
    async deleteProperty(propertyId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }
        const query = 'DELETE FROM Properties WHERE PropertyId = @propertyId';
        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Get property statistics
    async getPropertyStatistics(ownerId) {
        const db = await this.getDb();
        // Create base condition
        if (ownerId) {
        }
        // Helper function to build WHERE clause
        const buildWhereClause = (additionalCondition) => {
            let whereClause = '';
            const conditions = [];
            if (ownerId) {
                conditions.push('OwnerId = @ownerId');
            }
            if (additionalCondition) {
                conditions.push(additionalCondition);
            }
            if (conditions.length > 0) {
                whereClause = 'WHERE ' + conditions.join(' AND ');
            }
            return whereClause;
        };
        const queries = [
            `SELECT COUNT(*) as total FROM Properties ${buildWhereClause()}`,
            `SELECT COUNT(*) as available FROM Properties ${buildWhereClause('IsAvailable = 1')}`,
            `SELECT COUNT(*) as rented FROM Properties ${buildWhereClause('IsAvailable = 0')}`,
            `SELECT COUNT(*) as verified FROM Properties ${buildWhereClause('IsVerified = 1')}`,
            `SELECT COUNT(*) as boosted FROM Properties ${buildWhereClause('IsBoosted = 1 AND (BoostExpiry IS NULL OR BoostExpiry > GETDATE())')}`,
            `SELECT PropertyType, COUNT(*) as count FROM Properties ${buildWhereClause()} GROUP BY PropertyType`,
            `SELECT County, COUNT(*) as count FROM Properties ${buildWhereClause()} GROUP BY County`
        ];
        try {
            const request = db.request();
            if (ownerId) {
                request.input('ownerId', sql.UniqueIdentifier, ownerId);
            }
            const results = await Promise.all(queries.map(query => request.query(query)));
            // Convert property type results to object
            const byType = {};
            results[5].recordset.forEach((row) => {
                byType[row.PropertyType] = parseInt(row.count);
            });
            // Convert county results to object
            const byCounty = {};
            results[6].recordset.forEach((row) => {
                byCounty[row.County] = parseInt(row.count);
            });
            return {
                total: parseInt(results[0].recordset[0].total),
                available: parseInt(results[1].recordset[0].available),
                rented: parseInt(results[2].recordset[0].rented),
                verified: parseInt(results[3].recordset[0].verified),
                boosted: parseInt(results[4].recordset[0].boosted),
                byType,
                byCounty
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Search properties
    async searchProperties(searchTerm, page = 1, limit = 20) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Properties p
            INNER JOIN Users u ON p.OwnerId = u.UserId
            WHERE (p.Title LIKE @searchTerm 
                OR p.Description LIKE @searchTerm 
                OR p.Area LIKE @searchTerm 
                OR p.County LIKE @searchTerm
                OR p.StreetAddress LIKE @searchTerm)
                AND p.IsAvailable = 1
                AND u.IsActive = 1
        `;
        const dataQuery = `
            SELECT 
                p.*,
                u.FullName as OwnerName,
                u.TrustScore as OwnerTrustScore
            FROM Properties p
            INNER JOIN Users u ON p.OwnerId = u.UserId
            WHERE (p.Title LIKE @searchTerm 
                OR p.Description LIKE @searchTerm 
                OR p.Area LIKE @searchTerm 
                OR p.County LIKE @searchTerm
                OR p.StreetAddress LIKE @searchTerm)
                AND p.IsAvailable = 1
                AND u.IsActive = 1
            ORDER BY 
                CASE WHEN p.IsBoosted = 1 AND (p.BoostExpiry IS NULL OR p.BoostExpiry > GETDATE()) THEN 0 ELSE 1 END,
                p.CreatedAt DESC
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const searchParam = `%${searchTerm}%`;
            const countResult = await db.request()
                .input('searchTerm', sql.NVarChar, searchParam)
                .query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            const dataResult = await db.request()
                .input('searchTerm', sql.NVarChar, searchParam)
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(dataQuery);
            return {
                properties: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
}
// Export singleton instance
export const propertiesService = new PropertiesService();
//# sourceMappingURL=properties.service.js.map