import { Context } from 'hono';
export declare const followUser: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        FollowerId: string;
        FollowedId: string;
        CreatedAt: string;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const unfollowUser: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const checkFollowing: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        isFollowing: boolean;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getFollowers: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        followers: {
            FollowerId: string;
            FollowedId: string;
            CreatedAt: string;
            UserName: string;
            UserRole: string;
        }[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getFollowing: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        following: {
            FollowerId: string;
            FollowedId: string;
            CreatedAt: string;
            UserName: string;
            UserRole: string;
        }[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getFollowStats: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        followerCount: number;
        followingCount: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getMutualFollows: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        UserId: string;
        UserName: string;
        UserRole: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getSuggestedUsers: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        UserId: string;
        UserName: string;
        UserRole: string;
        TrustScore: number;
        MutualFollows: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=userFollows.controller.d.ts.map