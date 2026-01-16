import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface Review {
    ReviewId: string;
    PropertyId?: string;
    ReviewerId: string;
    AgentId: string;
    ReviewType: 'PROPERTY' | 'AGENT';
    Rating: number;
    Comment: string;
    CreatedAt: string;
    UpdatedAt: string;
    // Joins
    ReviewerName?: string;
    AgentName?: string;
    PropertyTitle?: string;
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

    // Helper to map DB result to Review interface
    private mapDBToReview(data: any): Review {
        if (!data) return data;
        const mapped: any = {
            ReviewId: data.review_id,
            PropertyId: data.property_id,
            ReviewerId: data.reviewer_id,
            AgentId: data.agent_id,
            ReviewType: data.review_type,
            Rating: data.rating,
            Comment: data.comment,
            CreatedAt: data.created_at,
            UpdatedAt: data.updated_at
        };

        // Handle joined data
        if (data.Reviewer) {
            mapped.ReviewerName = data.Reviewer.FullName;
        }
        if (data.Agent) {
            mapped.AgentName = data.Agent.FullName;
        }
        if (data.Properties) {
            mapped.PropertyTitle = data.Properties.title;
        }

        return mapped as Review;
    }

    // Create new review
    async createReview(data: CreateReviewInput): Promise<Review> {
        // Validate rating
        if (data.rating < 1 || data.rating > 5) throw new Error('Rating must be between 1 and 5');

        // Validate reviewer exists
        const { data: reviewer, error: reviewerError } = await supabase
            .from('Users')
            .select('UserId')
            .eq('UserId', data.reviewerId)
            .eq('IsActive', true)
            .single();

        if (reviewerError || !reviewer) throw new Error('Reviewer not found or inactive');

        // Validate agent exists and is approved
        const { data: agent, error: agentError } = await supabase
            .from('Users')
            .select('UserId, Role, AgentStatus')
            .eq('UserId', data.agentId)
            .eq('IsActive', true)
            .single();

        if (agentError || !agent) throw new Error('Agent not found or inactive');
        if (agent.Role !== 'AGENT' || agent.AgentStatus !== 'APPROVED') {
            throw new Error('Agent is not approved');
        }

        // Validate property if review type is PROPERTY
        if (data.reviewType === 'PROPERTY') {
            if (!data.propertyId) throw new Error('Property ID is required for property reviews');

            const { data: property, error: propError } = await supabase
                .from('properties')
                .select('property_id')
                .eq('property_id', data.propertyId)
                .eq('owner_id', data.agentId)
                .single();

            if (propError || !property) {
                throw new Error('Property not found or does not belong to the agent');
            }
        }

        // Check if reviewer has already reviewed this agent/property
        let duplicateCheck = supabase
            .from('reviews')
            .select('review_id')
            .eq('reviewer_id', data.reviewerId)
            .eq('agent_id', data.agentId);

        if (data.propertyId) {
            duplicateCheck = duplicateCheck.eq('property_id', data.propertyId);
        } else {
            duplicateCheck = duplicateCheck.is('property_id', null);
        }

        const { data: existingReview } = await duplicateCheck.single();

        if (existingReview) {
            throw new Error('You have already reviewed this ' + (data.propertyId ? 'property' : 'agent'));
        }

        const { data: newReview, error } = await supabase
            .from('reviews')
            .insert({
                property_id: data.propertyId || null,
                reviewer_id: data.reviewerId,
                agent_id: data.agentId,
                review_type: data.reviewType,
                rating: data.rating,
                comment: data.comment || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Update agent's trust score
        await this.updateAgentTrustScore(data.agentId);

        return this.mapDBToReview(newReview);
    }

    // Get review by ID
    async getReviewById(reviewId: string): Promise<Review | null> {
        if (!ValidationUtils.isValidUUID(reviewId)) throw new Error('Invalid review ID format');

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                Reviewer:reviewer_id (FullName),
                Agent:agent_id (FullName),
                Properties:property_id (title)
            `)
            .eq('review_id', reviewId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return this.mapDBToReview(data);
    }

    // Get reviews by agent ID
    async getReviewsByAgentId(agentId: string, reviewType?: string): Promise<Review[]> {
        if (!ValidationUtils.isValidUUID(agentId)) throw new Error('Invalid agent ID format');

        let query = supabase
            .from('reviews')
            .select(`
                *,
                Reviewer:reviewer_id (FullName),
                Properties:property_id (title)
            `)
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false });

        if (reviewType) {
            query = query.eq('review_type', reviewType);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        return (data || []).map(r => this.mapDBToReview(r));
    }

    // Get reviews by property ID
    async getReviewsByPropertyId(propertyId: string): Promise<Review[]> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                Reviewer:reviewer_id (FullName),
                Agent:agent_id (FullName)
            `)
            .eq('property_id', propertyId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return (data || []).map(r => this.mapDBToReview(r));
    }

    // Update review
    async updateReview(reviewId: string, data: UpdateReviewInput): Promise<Review> {
        if (!ValidationUtils.isValidUUID(reviewId)) throw new Error('Invalid review ID format');

        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Get current review
        const { data: currentReview, error: fetchError } = await supabase
            .from('reviews')
            .select('agent_id')
            .eq('review_id', reviewId)
            .single();

        if (fetchError || !currentReview) throw new Error('Review not found');

        const updates: any = {};
        if (data.rating !== undefined) updates.rating = data.rating;
        if (data.comment !== undefined) updates.comment = data.comment;

        if (Object.keys(updates).length === 0) throw new Error('No fields to update');

        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('reviews')
            .update(updates)
            .eq('review_id', reviewId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Update agent's trust score
        await this.updateAgentTrustScore(currentReview.agent_id);

        return this.mapDBToReview(updated);
    }

    // Delete review
    async deleteReview(reviewId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(reviewId)) throw new Error('Invalid review ID format');

        // Get review before deleting to update trust score
        const { data: review } = await supabase
            .from('reviews')
            .select('agent_id')
            .eq('review_id', reviewId)
            .single();

        if (!review) return false;

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('review_id', reviewId);

        if (error) throw new Error(error.message);

        // Update agent's trust score
        await this.updateAgentTrustScore(review.agent_id);

        return true;
    }

    // Get agent rating summary
    async getAgentRatingSummary(agentId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: { [key: number]: number };
    }> {
        if (!ValidationUtils.isValidUUID(agentId)) throw new Error('Invalid agent ID format');

        // Client-side aggregation
        // Fetch only ratings
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('agent_id', agentId);

        if (error) throw new Error(error.message);

        const ratings = data?.map(r => r.rating) || [];
        return this.calculateRatingStats(ratings);
    }

    // Get property rating summary
    async getPropertyRatingSummary(propertyId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: { [key: number]: number };
    }> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('property_id', propertyId);

        if (error) throw new Error(error.message);

        const ratings = data?.map(r => r.rating) || [];
        return this.calculateRatingStats(ratings);
    }

    private calculateRatingStats(ratings: number[]) {
        const totalReviews = ratings.length;
        const sum = ratings.reduce((a, b) => a + b, 0);
        const averageRating = totalReviews > 0 ? sum / totalReviews : 0;

        const ratingBreakdown: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(r => {
            if (ratingBreakdown[r] !== undefined) ratingBreakdown[r]++;
        });

        return {
            averageRating,
            totalReviews,
            ratingBreakdown
        };
    }

    // Get recent reviews
    async getRecentReviews(limit: number = 10): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                Reviewer:reviewer_id (FullName),
                Agent:agent_id (FullName),
                Properties:property_id (title)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);

        return (data || []).map(r => this.mapDBToReview(r));
    }

    // Helper method to update agent's trust score
    private async updateAgentTrustScore(agentId: string): Promise<void> {
        // Calculate average
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('agent_id', agentId);

        if (error) {
            console.error('Error fetching reviews for trust score:', error);
            return;
        }

        const ratings = data?.map(r => r.rating) || [];
        const total = ratings.reduce((a, b) => a + b, 0);
        const avg = ratings.length > 0 ? total / ratings.length : 0;

        // Trust Score logic: Avg * 20 (so 5 stars = 100)
        const trustScore = Math.round(avg * 20);

        const { error: updateError } = await supabase
            .from('Users')
            .update({ TrustScore: trustScore })
            .eq('UserId', agentId);

        if (updateError) console.error('Error updating trust score:', updateError);
    }
}

export const reviewsService = new ReviewsService();
