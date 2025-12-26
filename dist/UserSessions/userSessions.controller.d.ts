import { Context } from 'hono';
export declare const getUserSessions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        SessionId: string;
        UserId: string;
        DeviceId?: string | undefined;
        RefreshTokenHash: string;
        ExpiresAt: string;
        IsActive: boolean;
        CreatedAt: string;
        LastAccessedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const revokeSession: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const revokeAllSessions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        revokedCount: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getSessionStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalActive: number;
        totalExpired: number;
        recentSessions: {
            SessionId: string;
            UserId: string;
            DeviceId?: string | undefined;
            RefreshTokenHash: string;
            ExpiresAt: string;
            IsActive: boolean;
            CreatedAt: string;
            LastAccessedAt: string;
        }[];
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=userSessions.controller.d.ts.map