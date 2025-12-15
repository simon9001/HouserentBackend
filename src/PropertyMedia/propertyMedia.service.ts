import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface PropertyMedia {
    MediaId: string;
    PropertyId: string;
    MediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    MediaUrl: string;
    ThumbnailUrl: string | null;
    IsPrimary: boolean;
    CreatedAt: Date;
}

export interface CreateMediaInput {
    propertyId: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
}

export interface UpdateMediaInput {
    mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl?: string;
    thumbnailUrl?: string | null;
    isPrimary?: boolean;
}

export class PropertyMediaService {
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

    // Create new property media
    async createMedia(data: CreateMediaInput): Promise<PropertyMedia> {
        const db = await this.getDb();
        
        // Validate property exists
        const propertyCheck = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .query('SELECT PropertyId FROM Properties WHERE PropertyId = @propertyId');
        
        if (propertyCheck.recordset.length === 0) {
            throw new Error('Property not found');
        }

        // Validate media type
        const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
        if (!validMediaTypes.includes(data.mediaType)) {
            throw new Error('Invalid media type');
        }

        // If setting as primary, unset any existing primary
        if (data.isPrimary) {
            await db.request()
                .input('propertyId', sql.UniqueIdentifier, data.propertyId)
                .query('UPDATE PropertyMedia SET IsPrimary = 0 WHERE PropertyId = @propertyId');
        }

        // Create media
        const query = `
            INSERT INTO PropertyMedia (PropertyId, MediaType, MediaUrl, ThumbnailUrl, IsPrimary)
            OUTPUT INSERTED.*
            VALUES (@propertyId, @mediaType, @mediaUrl, @thumbnailUrl, @isPrimary)
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId)
            .input('mediaType', sql.NVarChar(20), data.mediaType)
            .input('mediaUrl', sql.NVarChar(500), data.mediaUrl)
            .input('thumbnailUrl', sql.NVarChar(500), data.thumbnailUrl || null)
            .input('isPrimary', sql.Bit, data.isPrimary || false)
            .query(query);

        return result.recordset[0];
    }

    // Get media by ID
    async getMediaById(mediaId: string): Promise<PropertyMedia | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(mediaId)) {
            throw new Error('Invalid media ID format');
        }

        const query = 'SELECT * FROM PropertyMedia WHERE MediaId = @mediaId';

        const result = await db.request()
            .input('mediaId', sql.UniqueIdentifier, mediaId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Get all media for a property
    async getMediaByPropertyId(propertyId: string): Promise<PropertyMedia[]> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }

        const query = `
            SELECT * FROM PropertyMedia 
            WHERE PropertyId = @propertyId
            ORDER BY IsPrimary DESC, CreatedAt ASC
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);

        return result.recordset;
    }

    // Update media
    async updateMedia(mediaId: string, data: UpdateMediaInput): Promise<PropertyMedia | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(mediaId)) {
            throw new Error('Invalid media ID format');
        }

        // Get existing media to check property
        const existingMedia = await this.getMediaById(mediaId);
        if (!existingMedia) {
            throw new Error('Media not found');
        }

        // Build dynamic update query
        let updateFields: string[] = [];
        const inputs: { [key: string]: any } = { mediaId };

        if (data.mediaType) {
            const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
            if (!validMediaTypes.includes(data.mediaType)) {
                throw new Error('Invalid media type');
            }
            updateFields.push('MediaType = @mediaType');
            inputs.mediaType = data.mediaType;
        }

        if (data.mediaUrl) {
            updateFields.push('MediaUrl = @mediaUrl');
            inputs.mediaUrl = data.mediaUrl;
        }

        if (data.thumbnailUrl !== undefined) {
            updateFields.push('ThumbnailUrl = @thumbnailUrl');
            inputs.thumbnailUrl = data.thumbnailUrl;
        }

        if (data.isPrimary !== undefined) {
            updateFields.push('IsPrimary = @isPrimary');
            inputs.isPrimary = data.isPrimary;
            
            // If setting as primary, unset any existing primary for this property
            if (data.isPrimary) {
                await db.request()
                    .input('propertyId', sql.UniqueIdentifier, existingMedia.PropertyId)
                    .query('UPDATE PropertyMedia SET IsPrimary = 0 WHERE PropertyId = @propertyId AND MediaId != @mediaId');
            }
        }

        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE PropertyMedia 
            SET ${updateFields.join(', ')} 
            OUTPUT INSERTED.*
            WHERE MediaId = @mediaId
        `;

        try {
            const request = db.request()
                .input('mediaId', sql.UniqueIdentifier, mediaId);

            // Add all inputs dynamically
            Object.keys(inputs).forEach(key => {
                if (key !== 'mediaId') {
                    const value = inputs[key];
                    if (typeof value === 'string') {
                        request.input(key, sql.NVarChar, value);
                    } else if (typeof value === 'boolean') {
                        request.input(key, sql.Bit, value);
                    }
                }
            });

            const result = await request.query(query);
            return result.recordset[0] || null;
        } catch (error: any) {
            throw error;
        }
    }

    // Delete media
    async deleteMedia(mediaId: string): Promise<boolean> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(mediaId)) {
            throw new Error('Invalid media ID format');
        }

        const query = 'DELETE FROM PropertyMedia WHERE MediaId = @mediaId';
        
        const result = await db.request()
            .input('mediaId', sql.UniqueIdentifier, mediaId)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    // Set media as primary
    async setPrimaryMedia(mediaId: string): Promise<PropertyMedia | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(mediaId)) {
            throw new Error('Invalid media ID format');
        }

        // Get media to get property ID
        const media = await this.getMediaById(mediaId);
        if (!media) {
            throw new Error('Media not found');
        }

        // Unset any existing primary for this property
        await db.request()
            .input('propertyId', sql.UniqueIdentifier, media.PropertyId)
            .query('UPDATE PropertyMedia SET IsPrimary = 0 WHERE PropertyId = @propertyId');

        // Set this media as primary
        const query = `
            UPDATE PropertyMedia 
            SET IsPrimary = 1 
            OUTPUT INSERTED.*
            WHERE MediaId = @mediaId
        `;

        const result = await db.request()
            .input('mediaId', sql.UniqueIdentifier, mediaId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Get primary media for property
    async getPrimaryMedia(propertyId: string): Promise<PropertyMedia | null> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }

        const query = `
            SELECT * FROM PropertyMedia 
            WHERE PropertyId = @propertyId AND IsPrimary = 1
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Bulk create media
    async createBulkMedia(mediaList: CreateMediaInput[]): Promise<PropertyMedia[]> {
        const db = await this.getDb();
        const results: PropertyMedia[] = [];

        for (const media of mediaList) {
            try {
                const createdMedia = await this.createMedia(media);
                results.push(createdMedia);
            } catch (error) {
                console.error('Error creating media:', error);
                // Continue with other media
            }
        }

        return results;
    }

    // Get media statistics
    async getMediaStatistics(propertyId?: string): Promise<{
        total: number;
        images: number;
        videos: number;
        documents: number;
        hasPrimary: number;
    }> {
        const db = await this.getDb();
        
        let whereClause = '';
        if (propertyId) {
            whereClause = 'WHERE PropertyId = @propertyId';
        }

        const queries = [
            `SELECT COUNT(*) as total FROM PropertyMedia ${whereClause}`,
            `SELECT COUNT(*) as images FROM PropertyMedia ${whereClause} AND MediaType = 'IMAGE'`,
            `SELECT COUNT(*) as videos FROM PropertyMedia ${whereClause} AND MediaType = 'VIDEO'`,
            `SELECT COUNT(*) as documents FROM PropertyMedia ${whereClause} AND MediaType = 'DOCUMENT'`,
            `SELECT COUNT(*) as hasPrimary FROM PropertyMedia ${whereClause} AND IsPrimary = 1`
        ];

        try {
            const request = db.request();
            if (propertyId) {
                request.input('propertyId', sql.UniqueIdentifier, propertyId);
            }

            const results = await Promise.all(
                queries.map(query => request.query(query))
            );

            return {
                total: parseInt(results[0].recordset[0].total),
                images: parseInt(results[1].recordset[0].images),
                videos: parseInt(results[2].recordset[0].videos),
                documents: parseInt(results[3].recordset[0].documents),
                hasPrimary: parseInt(results[4].recordset[0].hasPrimary)
            };
        } catch (error) {
            throw error;
        }
    }
}

// Export singleton instance
export const propertyMediaService = new PropertyMediaService();