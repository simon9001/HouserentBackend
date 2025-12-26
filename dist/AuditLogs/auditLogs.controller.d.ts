import { Context } from 'hono';
export declare const createAuditLog: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        LogId: string;
        UserId?: string | undefined;
        Action: string;
        Entity: string;
        EntityId?: string | undefined;
        IpAddress?: string | undefined;
        UserAgent?: string | undefined;
        Metadata?: string | undefined;
        CreatedAt: string;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAuditLogById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        LogId: string;
        UserId?: string | undefined;
        Action: string;
        Entity: string;
        EntityId?: string | undefined;
        IpAddress?: string | undefined;
        UserAgent?: string | undefined;
        Metadata?: string | undefined;
        CreatedAt: string;
        UserName?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAuditLogsByUserId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        logs: {
            LogId: string;
            UserId?: string | undefined;
            Action: string;
            Entity: string;
            EntityId?: string | undefined;
            IpAddress?: string | undefined;
            UserAgent?: string | undefined;
            Metadata?: string | undefined;
            CreatedAt: string;
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
export declare const getAuditLogsByEntity: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        logs: {
            LogId: string;
            UserId?: string | undefined;
            Action: string;
            Entity: string;
            EntityId?: string | undefined;
            IpAddress?: string | undefined;
            UserAgent?: string | undefined;
            Metadata?: string | undefined;
            CreatedAt: string;
            UserName?: string | undefined;
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
export declare const searchAuditLogs: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        logs: {
            LogId: string;
            UserId?: string | undefined;
            Action: string;
            Entity: string;
            EntityId?: string | undefined;
            IpAddress?: string | undefined;
            UserAgent?: string | undefined;
            Metadata?: string | undefined;
            CreatedAt: string;
            UserName?: string | undefined;
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
export declare const getAuditStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalLogs: number;
        logsByUser: {
            userId: string;
            userName: string;
            count: number;
        }[];
        logsByEntity: {
            entity: string;
            count: number;
        }[];
        logsByAction: {
            action: string;
            count: number;
        }[];
        dailyActivity: {
            date: string;
            count: number;
        }[];
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const cleanOldAuditLogs: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        deletedCount: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=auditLogs.controller.d.ts.map