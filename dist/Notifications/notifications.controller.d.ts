import { Context } from 'hono';
export declare const getNotifications: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    NotificationId: string;
    UserId: string;
    Title: string;
    Message: string;
    Type: "BOOKING" | "PAYMENT" | "REVIEW" | "SYSTEM" | "ALERT";
    ReferenceId?: string | undefined;
    IsRead: boolean;
    CreatedAt: string;
    UpdatedAt: string;
}[], import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, 500, "json">)>;
export declare const markAsRead: (c: Context) => Promise<Response & import("hono").TypedResponse<{
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
export declare const markAllAsRead: (c: Context) => Promise<Response & import("hono").TypedResponse<{
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
export declare const getUnreadCount: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    count: number;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, 500, "json">)>;
export declare const sendBroadcast: (c: Context) => Promise<Response & import("hono").TypedResponse<{
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
export declare const sendToClients: (c: Context) => Promise<Response & import("hono").TypedResponse<{
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">>;
//# sourceMappingURL=notifications.controller.d.ts.map