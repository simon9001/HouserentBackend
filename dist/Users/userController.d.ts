import { Context } from 'hono';
export declare const createUser: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
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
export declare const getAllUsers: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        users: {
            UserId: string;
            Username: string;
            FullName: string;
            PhoneNumber: string;
            Email: string;
            Bio?: string | undefined;
            Address?: string | undefined;
            AvatarUrl?: string | undefined;
            Role: "TENANT" | "AGENT" | "ADMIN";
            AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
            TrustScore: number;
            IsActive: boolean;
            IsEmailVerified: boolean;
            LoginAttempts: number;
            LastLogin: string | null;
            LockedUntil: string | null;
            CreatedAt: string;
            UpdatedAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getUserById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getUserByUsername: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getUserByEmail: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const updateUser: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 409, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const updateUserPassword: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateUserRole: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string | undefined;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
export declare const updateAgentStatus: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string | undefined;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        UserId: string;
        Username: string;
        FullName: string;
        PhoneNumber: string;
        Email: string;
        Bio?: string | undefined;
        Address?: string | undefined;
        AvatarUrl?: string | undefined;
        Role: "TENANT" | "AGENT" | "ADMIN";
        AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
        TrustScore: number;
        IsActive: boolean;
        IsEmailVerified: boolean;
        LoginAttempts: number;
        LastLogin: string | null;
        LockedUntil: string | null;
        CreatedAt: string;
        UpdatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
export declare const verifyUserEmail: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">)>;
export declare const deleteUser: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">)>;
export declare const getUserStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalUsers: number;
        activeUsers: number;
        tenants: number;
        agents: number;
        admins: number;
        pendingAgents: number;
        suspendedUsers: number;
        verifiedEmails: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const searchUsers: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        users: {
            UserId: string;
            Username: string;
            FullName: string;
            PhoneNumber: string;
            Email: string;
            Bio?: string | undefined;
            Address?: string | undefined;
            AvatarUrl?: string | undefined;
            Role: "TENANT" | "AGENT" | "ADMIN";
            AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
            TrustScore: number;
            IsActive: boolean;
            IsEmailVerified: boolean;
            LoginAttempts: number;
            LastLogin: string | null;
            LockedUntil: string | null;
            CreatedAt: string;
            UpdatedAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getUsersByRole: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string | undefined;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        users: {
            UserId: string;
            Username: string;
            FullName: string;
            PhoneNumber: string;
            Email: string;
            Bio?: string | undefined;
            Address?: string | undefined;
            AvatarUrl?: string | undefined;
            Role: "TENANT" | "AGENT" | "ADMIN";
            AgentStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
            TrustScore: number;
            IsActive: boolean;
            IsEmailVerified: boolean;
            LoginAttempts: number;
            LastLogin: string | null;
            LockedUntil: string | null;
            CreatedAt: string;
            UpdatedAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=userController.d.ts.map