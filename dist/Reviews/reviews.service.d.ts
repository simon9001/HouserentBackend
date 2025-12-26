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
export declare class ReviewsService {
    private db;
    constructor();
    private getDb;
    createReview(data: CreateReviewInput): Promise<Review>;
    getReviewById(reviewId: string): Promise<Review & {
        ReviewerName?: string;
        AgentName?: string;
        PropertyTitle?: string;
    }>;
    getReviewsByAgentId(agentId: string, reviewType?: string): Promise<Review[]>;
    getReviewsByPropertyId(propertyId: string): Promise<Review[]>;
    updateReview(reviewId: string, data: UpdateReviewInput): Promise<Review>;
    deleteReview(reviewId: string): Promise<boolean>;
    getAgentRatingSummary(agentId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: {
            [key: number]: number;
        };
    }>;
    getPropertyRatingSummary(propertyId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: {
            [key: number]: number;
        };
    }>;
    getRecentReviews(limit?: number): Promise<Review[]>;
    private updateAgentTrustScore;
}
export declare const reviewsService: ReviewsService;
//# sourceMappingURL=reviews.service.d.ts.map