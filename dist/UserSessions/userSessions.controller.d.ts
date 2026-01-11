import { Context } from 'hono';
export declare const getUserSessions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        session_id: string;
        user_id: string;
        device_id?: string | undefined;
        refresh_token_hash: string;
        expires_at: string;
        is_active: boolean;
        created_at: string;
        last_accessed_at: string;
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
            session_id: string;
            user_id: string;
            device_id?: string | undefined;
            refresh_token_hash: string;
            expires_at: string;
            is_active: boolean;
            created_at: string;
            last_accessed_at: string;
        }[];
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const revokeSessionsByDevice: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        revokedCount: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getSession: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        session_id: string;
        user_id: string;
        device_id?: string | undefined;
        refresh_token_hash: string;
        expires_at: string;
        is_active: boolean;
        created_at: string;
        last_accessed_at: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getSessionWithUser: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        session: {
            session_id: string;
            user_id: string;
            device_id?: string | undefined;
            refresh_token_hash: string;
            expires_at: string;
            is_active: boolean;
            created_at: string;
            last_accessed_at: string;
        };
        user: {
            user_id: string;
            username: string;
            full_name: string;
            email: string;
            role: string;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const renewSession: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        session_id: string;
        user_id: string;
        device_id?: string | undefined;
        refresh_token_hash: string;
        expires_at: string;
        is_active: boolean;
        created_at: string;
        last_accessed_at: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const checkDeviceSession: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        hasActiveSession: boolean;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getSessionByDevice: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        session_id: string;
        user_id: string;
        device_id?: string | undefined;
        refresh_token_hash: string;
        expires_at: string;
        is_active: boolean;
        created_at: string;
        last_accessed_at: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const cleanExpiredSessions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        cleanedCount: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const cleanupOldSessions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        cleanedCount: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const validateSession: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
    data: {
        isValid: false;
    };
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        isValid: true;
        session: {
            session_id: string;
            user_id: string;
            device_id?: string | undefined;
            refresh_token_hash: string;
            expires_at: string;
            is_active: boolean;
            created_at: string;
            last_accessed_at: string;
        } | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=userSessions.controller.d.ts.map