import { Context } from 'hono';
export declare const register: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        user: {
            IsActive: boolean;
            UserId: string;
            FullName: string;
            CreatedAt: string;
            Role: "TENANT" | "AGENT" | "ADMIN";
            AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
            Email: string;
            Username: string;
            PhoneNumber: string;
            LoginAttempts: number;
            IsEmailVerified: boolean;
            Bio?: string | undefined;
            Address?: string | undefined;
            AvatarUrl?: string | undefined;
            TrustScore: number;
            LastLogin: string | null;
            LockedUntil: string | null;
            UpdatedAt: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            sessionId?: string | undefined;
        };
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 409, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const login: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        user: {
            IsActive: boolean;
            UserId: string;
            FullName: string;
            CreatedAt: string;
            Role: "TENANT" | "AGENT" | "ADMIN";
            AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
            Email: string;
            Username: string;
            PhoneNumber: string;
            LoginAttempts: number;
            IsEmailVerified: boolean;
            Bio?: string | undefined;
            Address?: string | undefined;
            AvatarUrl?: string | undefined;
            TrustScore: number;
            LastLogin: string | null;
            LockedUntil: string | null;
            UpdatedAt: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            sessionId?: string | undefined;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const refreshToken: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        sessionId: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const logout: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const verifyEmail: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const requestPasswordReset: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
export declare const resetPassword: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const changePassword: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getUserSessions: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        sessionId: string;
        userId: string;
        deviceId?: string | undefined;
        expiresAt: string;
        lastAccessedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const revokeSession: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getAuthProfile: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        IsActive: boolean;
        UserId: string;
        FullName: string;
        CreatedAt: string;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        Email: string;
        Username: string;
        PhoneNumber: string;
        LoginAttempts: number;
        IsEmailVerified: boolean;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        TrustScore: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const resendVerificationEmail: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const checkEmailHealth: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        emailService: string;
        timestamp: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const debugToken: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: any;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const testJwtGeneration: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        token: string;
        decoded: any;
        fieldCheck: any;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const validateToken: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        jwtUtilsVerification: {
            userId: string;
            username: string;
            email: string;
            role: "TENANT" | "AGENT" | "ADMIN";
        } | null;
        serviceValidation: {
            userId: string;
            username: string;
            email: string;
            role: "TENANT" | "AGENT" | "ADMIN";
        } | null;
        userIdFromToken: string | null;
        rawTokenStructure: any;
        tokenLength: number;
        isWellFormed: boolean;
        timestamp: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const echo: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        echo: any;
        timestamp: string;
        headers: {
            [x: string]: string;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const checkAuth: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    authenticated: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    authenticated: true;
    message: string;
    user: {
        userId: string;
        username: string;
        email: string;
        role: "TENANT" | "AGENT" | "ADMIN";
    };
    timestamp: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    authenticated: false;
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=auth.controller.d.ts.map