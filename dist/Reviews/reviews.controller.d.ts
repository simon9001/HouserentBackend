import { Context } from 'hono';
export declare const createReview: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        ReviewId: string;
        PropertyId?: string | undefined;
        ReviewerId: string;
        AgentId: string;
        ReviewType: "PROPERTY" | "AGENT";
        Rating: number;
        Comment: string;
        CreatedAt: string;
        UpdatedAt: string;
        ReviewerName?: string | undefined;
        AgentName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getReviewById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        ReviewId: string;
        PropertyId?: string | undefined;
        ReviewerId: string;
        AgentId: string;
        ReviewType: "PROPERTY" | "AGENT";
        Rating: number;
        Comment: string;
        CreatedAt: string;
        UpdatedAt: string;
        ReviewerName?: string | undefined;
        AgentName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getReviewsByAgentId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        ReviewId: string;
        PropertyId?: string | undefined;
        ReviewerId: string;
        AgentId: string;
        ReviewType: "PROPERTY" | "AGENT";
        Rating: number;
        Comment: string;
        CreatedAt: string;
        UpdatedAt: string;
        ReviewerName?: string | undefined;
        AgentName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getReviewsByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        ReviewId: string;
        PropertyId?: string | undefined;
        ReviewerId: string;
        AgentId: string;
        ReviewType: "PROPERTY" | "AGENT";
        Rating: number;
        Comment: string;
        CreatedAt: string;
        UpdatedAt: string;
        ReviewerName?: string | undefined;
        AgentName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateReview: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        ReviewId: string;
        PropertyId?: string | undefined;
        ReviewerId: string;
        AgentId: string;
        ReviewType: "PROPERTY" | "AGENT";
        Rating: number;
        Comment: string;
        CreatedAt: string;
        UpdatedAt: string;
        ReviewerName?: string | undefined;
        AgentName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const deleteReview: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAgentRatingSummary: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: {
            [x: number]: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPropertyRatingSummary: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        averageRating: number;
        totalReviews: number;
        ratingBreakdown: {
            [x: number]: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getRecentReviews: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        ReviewId: string;
        PropertyId?: string | undefined;
        ReviewerId: string;
        AgentId: string;
        ReviewType: "PROPERTY" | "AGENT";
        Rating: number;
        Comment: string;
        CreatedAt: string;
        UpdatedAt: string;
        ReviewerName?: string | undefined;
        AgentName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=reviews.controller.d.ts.map