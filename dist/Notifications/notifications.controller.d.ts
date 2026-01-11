import { Context } from 'hono';
import type { TokenPayload } from '../utils/jwt.js';
interface AuthContext extends Context {
    user?: TokenPayload;
}
export declare const getNotifications: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        NotificationId: string;
        UserId: string;
        Title: string;
        Message: string;
        Type: "BOOKING" | "PAYMENT" | "REVIEW" | "SYSTEM" | "ALERT";
        ReferenceId?: string | undefined;
        IsRead: boolean;
        CreatedAt: string;
        UpdatedAt: string;
    }[];
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const markAsRead: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const markAllAsRead: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getUnreadCount: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        count: number;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const sendBroadcast: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 403, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        count: number;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const sendToClients: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 403, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        count: number;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const createNotification: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 403, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        NotificationId: string;
        UserId: string;
        Title: string;
        Message: string;
        Type: "BOOKING" | "PAYMENT" | "REVIEW" | "SYSTEM" | "ALERT";
        ReferenceId?: string | undefined;
        IsRead: boolean;
        CreatedAt: string;
        UpdatedAt: string;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const getNotificationById: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        NotificationId: string;
        UserId: string;
        Title: string;
        Message: string;
        Type: "BOOKING" | "PAYMENT" | "REVIEW" | "SYSTEM" | "ALERT";
        ReferenceId?: string | undefined;
        IsRead: boolean;
        CreatedAt: string;
        UpdatedAt: string;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    message: string;
    error: string;
}, 500, "json">)>;
export declare const debugContext: (c: AuthContext) => Promise<Response & import("hono").TypedResponse<{
    success: true;
    data: {
        user: {
            userId: string;
            username: string;
            role: "AGENT" | "TENANT" | "ADMIN";
            email: string;
        } | null;
        headers: {
            authorization: string;
            contentType: string;
        };
        contextInfo: {
            hasGetMethod: boolean;
            hasSetMethod: boolean;
            hasUserProperty: boolean;
            contextType: string;
        };
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
export {};
//# sourceMappingURL=notifications.controller.d.ts.map