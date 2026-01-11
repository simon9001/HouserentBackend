import { Context } from 'hono';
import { reviewsService, CreateReviewInput, UpdateReviewInput } from './reviews.service.js';
import { ValidationUtils } from '../utils/validators.js';

// Create new review
export const createReview = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.reviewerId || !body.agentId || !body.rating) {
            return c.json({
                success: false,
                error: 'Reviewer ID, agent ID, and rating are required'
            }, 400);
        }

        // Validate UUIDs
        ['reviewerId', 'agentId', 'propertyId'].forEach(field => {
            if (body[field] && !ValidationUtils.isValidUUID(body[field])) {
                throw new Error(`Invalid ${field} format`);
            }
        });

        // Validate rating
        if (body.rating < 1 || body.rating > 5) {
            return c.json({
                success: false,
                error: 'Rating must be between 1 and 5'
            }, 400);
        }

        // Validate review type
        if (body.reviewType && !['PROPERTY', 'AGENT'].includes(body.reviewType)) {
            return c.json({
                success: false,
                error: 'Review type must be either "PROPERTY" or "AGENT"'
            }, 400);
        }

        const reviewData: CreateReviewInput = {
            propertyId: body.propertyId,
            reviewerId: body.reviewerId,
            agentId: body.agentId,
            reviewType: body.reviewType || 'AGENT',
            rating: body.rating,
            comment: body.comment
        };

        const review = await reviewsService.createReview(reviewData);

        return c.json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        }, 201);
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to submit review'
        }, 400);
    }
};

// Get review by ID
export const getReviewById = async (c: Context) => {
    try {
        const reviewId = c.req.param('reviewId');

        if (!ValidationUtils.isValidUUID(reviewId)) {
            return c.json({
                success: false,
                error: 'Invalid review ID format'
            }, 400);
        }

        const review = await reviewsService.getReviewById(reviewId);

        if (!review) {
            return c.json({
                success: false,
                error: 'Review not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: review
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch review'
        }, 400);
    }
};

// Get reviews by agent ID
export const getReviewsByAgentId = async (c: Context) => {
    try {
        const agentId = c.req.param('agentId');
        const reviewType = c.req.query('type');

        if (!ValidationUtils.isValidUUID(agentId)) {
            return c.json({
                success: false,
                error: 'Invalid agent ID format'
            }, 400);
        }

        const reviews = await reviewsService.getReviewsByAgentId(agentId, reviewType);

        return c.json({
            success: true,
            data: reviews
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch reviews'
        }, 400);
    }
};

// Get reviews by property ID
export const getReviewsByPropertyId = async (c: Context) => {
    try {
        const propertyId = c.req.param('propertyId');

        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        const reviews = await reviewsService.getReviewsByPropertyId(propertyId);

        return c.json({
            success: true,
            data: reviews
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch reviews'
        }, 400);
    }
};

// Update review
export const updateReview = async (c: Context) => {
    try {
        const reviewId = c.req.param('reviewId');
        const body = await c.req.json();

        if (!ValidationUtils.isValidUUID(reviewId)) {
            return c.json({
                success: false,
                error: 'Invalid review ID format'
            }, 400);
        }

        // Validate rating if provided
        if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
            return c.json({
                success: false,
                error: 'Rating must be between 1 and 5'
            }, 400);
        }

        const updateData: UpdateReviewInput = {};
        if (body.rating !== undefined) updateData.rating = body.rating;
        if (body.comment !== undefined) updateData.comment = body.comment;

        if (Object.keys(updateData).length === 0) {
            return c.json({
                success: false,
                error: 'No fields to update'
            }, 400);
        }

        const updatedReview = await reviewsService.updateReview(reviewId, updateData);

        return c.json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to update review'
        }, 400);
    }
};

// Delete review
export const deleteReview = async (c: Context) => {
    try {
        const reviewId = c.req.param('reviewId');

        if (!ValidationUtils.isValidUUID(reviewId)) {
            return c.json({
                success: false,
                error: 'Invalid review ID format'
            }, 400);
        }

        const deleted = await reviewsService.deleteReview(reviewId);

        if (!deleted) {
            return c.json({
                success: false,
                error: 'Review not found'
            }, 404);
        }

        return c.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to delete review'
        }, 400);
    }
};

// Get agent rating summary
export const getAgentRatingSummary = async (c: Context) => {
    try {
        const agentId = c.req.param('agentId');

        if (!ValidationUtils.isValidUUID(agentId)) {
            return c.json({
                success: false,
                error: 'Invalid agent ID format'
            }, 400);
        }

        const summary = await reviewsService.getAgentRatingSummary(agentId);

        return c.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch rating summary'
        }, 400);
    }
};

// Get property rating summary
export const getPropertyRatingSummary = async (c: Context) => {
    try {
        const propertyId = c.req.param('propertyId');

        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        const summary = await reviewsService.getPropertyRatingSummary(propertyId);

        return c.json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch rating summary'
        }, 400);
    }
};

// Get recent reviews
export const getRecentReviews = async (c: Context) => {
    try {
        const limit = parseInt(c.req.query('limit') || '10');

        if (isNaN(limit) || limit < 1 || limit > 100) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 100'
            }, 400);
        }

        const reviews = await reviewsService.getRecentReviews(limit);

        return c.json({
            success: true,
            data: reviews
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch recent reviews'
        }, 400);
    }
};