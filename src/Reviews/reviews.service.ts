import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface Review {
    ReviewId: string;
    PropertyId?: string;
    ReviewerId: string;
    AgentId: string;
    ReviewType: 'PROPERTY' | 'AGENT';
    Rating: number;
    Comment: string;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface CreateReviewInput {
    propertyId?: string;
    reviewerId: string;
    agentId: string;
    reviewType: 'PROPERTY' | 'AGENT';
    rating: number;
    comment?: string;
}

export interface UpdateReviewInput {
    rating?: number;
    comment?: string;
}

export class ReviewsService {
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

    // Create new review
    async createReview(data: CreateReviewInput): Promise<Review> {
        const db = await this.getDb();
        
        // Validate rating
        if (data.rating < 1 || data.rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Validate reviewer exists
        const reviewerCheck = await db.request()
            .input('reviewerId', sql.UniqueIdentifier, data.reviewerId)
            .query('SELECT UserId FROM Users WHERE UserId = @reviewerId AND IsActive = 1');
        
        if (reviewerCheck.recordset.length === 0) {
            throw new Error('Reviewer not found or inactive');
        }

        // Validate agent exists and is approved
        const agentCheck = await db.request()
            .input('agentId', sql.UniqueIdentifier, data.agentId)
            .query('SELECT UserId, Role, AgentStatus FROM Users WHERE UserId = @agentId AND IsActive = 1');
        
        if (agentCheck.recordset.length === 0) {
            throw new Error('Agent not found or inactive');
        }
        if (agentCheck.recordset[0].Role !== 'AGENT' || agentCheck.recordset[0].AgentStatus !== 'APPROVED') {
            throw new Error('Agent is not approved');
        }

        // Validate property if review type is PROPERTY
        if (data.reviewType === 'PROPERTY') {
            if (!data.propertyId) {
                throw new Error('Property ID is required for property reviews');
            }
            
            const propertyCheck = await db.request()
                .input('propertyId', sql.UniqueIdentifier, data.propertyId)
                .input('agentId', sql.UniqueIdentifier, data.agentId)
                .query('SELECT PropertyId FROM Properties WHERE PropertyId = @propertyId AND OwnerId = @agentId');
            
            if (propertyCheck.recordset.length === 0) {
                throw new Error('Property not found or does not belong to the agent');
            }
        }

        // Check if reviewer has already reviewed this agent/property
        const existingReview = await db.request()
            .input('reviewerId', sql.UniqueIdentifier, data.reviewerId)
            .input('agentId', sql.UniqueIdentifier, data.agentId)
            .input('propertyId', sql.UniqueIdentifier, data.propertyId || null)
            .query(`
                SELECT ReviewId FROM Reviews 
                WHERE ReviewerId = @reviewerId 
                AND AgentId = @agentId
                ${data.propertyId ? 'AND PropertyId = @propertyId' : 'AND PropertyId IS NULL'}
            `);
        
        if (existingReview.recordset.length > 0) {
            throw new Error('You have already reviewed this ' + (data.propertyId ? 'property' : 'agent'));
        }

        const query = `
            INSERT INTO Reviews (PropertyId, ReviewerId, AgentId, ReviewType, Rating, Comment)
            OUTPUT INSERTED.*
            VALUES (@propertyId, @reviewerId, @agentId, @reviewType, @rating, @comment)
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, data.propertyId || null)
            .input('reviewerId', sql.UniqueIdentifier, data.reviewerId)
            .input('agentId', sql.UniqueIdentifier, data.agentId)
            .input('reviewType', sql.NVarChar(20), data.reviewType)
            .input('rating', sql.Int, data.rating)
            .input('comment', sql.NVarChar(1000), data.comment || null)
            .query(query);

        // Update agent's trust score
        await this.updateAgentTrustScore(data.agentId);

        return result.recordset[0];
    }

    // Get review by ID
    async getReviewById(reviewId: string): Promise<Review & { ReviewerName?: string; AgentName?: string; PropertyTitle?: string }> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(reviewId)) {
            throw new Error('Invalid review ID format');
        }

        const query = `
            SELECT 
                r.*,
                ur.FullName as ReviewerName,
                ua.FullName as AgentName,
                p.Title as PropertyTitle
            FROM Reviews r
            INNER JOIN Users ur ON r.ReviewerId = ur.UserId
            INNER JOIN Users ua ON r.AgentId = ua.UserId
            LEFT JOIN Properties p ON r.PropertyId = p.PropertyId
            WHERE r.ReviewId = @reviewId
        `;

        const result = await db.request()
            .input('reviewId', sql.UniqueIdentifier, reviewId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Get reviews by agent ID
    async getReviewsByAgentId(agentId: string, reviewType?: string): Promise<Review[]> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(agentId)) {
            throw new Error('Invalid agent ID format');
        }

        let whereClause = 'WHERE r.AgentId = @agentId';
        if (reviewType) {
            whereClause += ' AND r.ReviewType = @reviewType';
        }

        const query = `
            SELECT 
                r.*,
                ur.FullName as ReviewerName,
                p.Title as PropertyTitle
            FROM Reviews r
            INNER JOIN Users ur ON r.ReviewerId = ur.UserId
            LEFT JOIN Properties p ON r.PropertyId = p.PropertyId
            ${whereClause}
            ORDER BY r.CreatedAt DESC
        `;

        const request = db.request()
            .input('agentId', sql.UniqueIdentifier, agentId);
        
        if (reviewType) {
            request.input('reviewType', sql.NVarChar(20), reviewType);
        }

        const result = await request.query(query);
        return result.recordset;
    }

    // Get reviews by property ID
    async getReviewsByPropertyId(propertyId: string): Promise<Review[]> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }

        const query = `
            SELECT 
                r.*,
                ur.FullName as ReviewerName,
                ua.FullName as AgentName
            FROM Reviews r
            INNER JOIN Users ur ON r.ReviewerId = ur.UserId
            INNER JOIN Users ua ON r.AgentId = ua.UserId
            WHERE r.PropertyId = @propertyId
            ORDER BY r.CreatedAt DESC
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);

        return result.recordset;
    }

    // Update review
    async updateReview(reviewId: string, data: UpdateReviewInput): Promise<Review> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(reviewId)) {
            throw new Error('Invalid review ID format');
        }

        // Validate rating if provided
        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Get current review
        const currentReview = await this.getReviewById(reviewId);
        if (!currentReview) {
            throw new Error('Review not found');
        }

        // Build dynamic update query
        const updates: string[] = [];
        const inputs: any = { reviewId };

        if (data.rating !== undefined) {
            updates.push('Rating = @rating');
            inputs.rating = data.rating;
        }
        if (data.comment !== undefined) {
            updates.push('Comment = @comment');
            inputs.comment = data.comment;
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE Reviews 
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE ReviewId = @reviewId
        `;

        const request = db.request()
            .input('reviewId', sql.UniqueIdentifier, inputs.reviewId);

        // Add inputs dynamically
        Object.keys(inputs).forEach(key => {
            if (key !== 'reviewId') {
                request.input(key, inputs[key] === null ? sql.NVarChar(1000) : sql.NVarChar, inputs[key]);
            }
        });

        const result = await request.query(query);

        // Update agent's trust score
        await this.updateAgentTrustScore(currentReview.AgentId);

        return result.recordset[0];
    }

    // Delete review
    async deleteReview(reviewId: string): Promise<boolean> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(reviewId)) {
            throw new Error('Invalid review ID format');
        }

        // Get review before deleting to update trust score
        const review = await this.getReviewById(reviewId);
        if (!review) {
            return false;
        }

        const query = 'DELETE FROM Reviews WHERE ReviewId = @reviewId';
        
        const result = await db.request()
            .input('reviewId', sql.UniqueIdentifier, reviewId)
            .query(query);

        // Update agent's trust score
        await this.updateAgentTrustScore(review.AgentId);

        return result.rowsAffected[0] > 0;
    }

    // Get agent rating summary
    async getAgentRatingSummary(agentId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: { [key: number]: number };
    }> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(agentId)) {
            throw new Error('Invalid agent ID format');
        }

        const query = `
            SELECT 
                AVG(CAST(Rating AS FLOAT)) as averageRating,
                COUNT(*) as totalReviews,
                SUM(CASE WHEN Rating = 1 THEN 1 ELSE 0 END) as rating1,
                SUM(CASE WHEN Rating = 2 THEN 1 ELSE 0 END) as rating2,
                SUM(CASE WHEN Rating = 3 THEN 1 ELSE 0 END) as rating3,
                SUM(CASE WHEN Rating = 4 THEN 1 ELSE 0 END) as rating4,
                SUM(CASE WHEN Rating = 5 THEN 1 ELSE 0 END) as rating5
            FROM Reviews
            WHERE AgentId = @agentId
        `;

        const result = await db.request()
            .input('agentId', sql.UniqueIdentifier, agentId)
            .query(query);

        const data = result.recordset[0];
        return {
            averageRating: parseFloat(data.averageRating || 0),
            totalReviews: parseInt(data.totalReviews || 0),
            ratingBreakdown: {
                1: parseInt(data.rating1 || 0),
                2: parseInt(data.rating2 || 0),
                3: parseInt(data.rating3 || 0),
                4: parseInt(data.rating4 || 0),
                5: parseInt(data.rating5 || 0)
            }
        };
    }

    // Get property rating summary
    async getPropertyRatingSummary(propertyId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: { [key: number]: number };
    }> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }

        const query = `
            SELECT 
                AVG(CAST(Rating AS FLOAT)) as averageRating,
                COUNT(*) as totalReviews,
                SUM(CASE WHEN Rating = 1 THEN 1 ELSE 0 END) as rating1,
                SUM(CASE WHEN Rating = 2 THEN 1 ELSE 0 END) as rating2,
                SUM(CASE WHEN Rating = 3 THEN 1 ELSE 0 END) as rating3,
                SUM(CASE WHEN Rating = 4 THEN 1 ELSE 0 END) as rating4,
                SUM(CASE WHEN Rating = 5 THEN 1 ELSE 0 END) as rating5
            FROM Reviews
            WHERE PropertyId = @propertyId
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);

        const data = result.recordset[0];
        return {
            averageRating: parseFloat(data.averageRating || 0),
            totalReviews: parseInt(data.totalReviews || 0),
            ratingBreakdown: {
                1: parseInt(data.rating1 || 0),
                2: parseInt(data.rating2 || 0),
                3: parseInt(data.rating3 || 0),
                4: parseInt(data.rating4 || 0),
                5: parseInt(data.rating5 || 0)
            }
        };
    }

    // Get recent reviews
    async getRecentReviews(limit: number = 10): Promise<Review[]> {
        const db = await this.getDb();

        const query = `
            SELECT TOP ${limit}
                r.*,
                ur.FullName as ReviewerName,
                ua.FullName as AgentName,
                p.Title as PropertyTitle
            FROM Reviews r
            INNER JOIN Users ur ON r.ReviewerId = ur.UserId
            INNER JOIN Users ua ON r.AgentId = ua.UserId
            LEFT JOIN Properties p ON r.PropertyId = p.PropertyId
            ORDER BY r.CreatedAt DESC
        `;

        const result = await db.request().query(query);
        return result.recordset;
    }

    // Helper method to update agent's trust score
    private async updateAgentTrustScore(agentId: string): Promise<void> {
        const db = await this.getDb();

        const query = `
            UPDATE Users
            SET TrustScore = (
                SELECT AVG(CAST(Rating AS FLOAT)) * 20
                FROM Reviews
                WHERE AgentId = @agentId
            )
            WHERE UserId = @agentId
        `;

        await db.request()
            .input('agentId', sql.UniqueIdentifier, agentId)
            .query(query);
    }
}

export const reviewsService = new ReviewsService();