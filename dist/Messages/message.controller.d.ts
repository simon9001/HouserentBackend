import { AuthContext } from '../middleware/auth.middleware.js';
export declare const getOrCreateConversation: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        ConversationId: string;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const getUserConversations: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        ConversationId: string;
        PropertyId: string;
        AgentId: string;
        TenantId: string;
        PropertyTitle: string;
        RentAmount: number;
        PropertyImage?: string | undefined;
        AgentName: string;
        AgentAvatar?: string | undefined;
        TenantName: string;
        TenantAvatar?: string | undefined;
        LastMessageAt?: string | undefined;
        LastMessagePreview?: string | undefined;
        UnreadCountForTenant: number;
        UnreadCountForAgent: number;
        IsArchivedByTenant: boolean;
        IsArchivedByAgent: boolean;
        IsBlocked: boolean;
        BlockedBy?: string | undefined;
        BlockReason?: string | undefined;
        UserRoleInConversation?: "AGENT" | "TENANT" | undefined;
        UnreadCountForUser?: number | undefined;
        CreatedAt: string;
    }[];
    count: number;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const getMessages: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        MessageId: string;
        ConversationId: string;
        SenderId: string;
        SenderName?: string | undefined;
        SenderAvatar?: string | undefined;
        SenderRole?: string | undefined;
        Content: string;
        MessageType: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION" | "CONTACT";
        MediaUrl?: string | undefined;
        ThumbnailUrl?: string | undefined;
        FileName?: string | undefined;
        FileSize?: number | undefined;
        MimeType?: string | undefined;
        CreatedAt: string;
        ReadAt?: string | undefined;
        DeliveredAt?: string | undefined;
        IsEdited: boolean;
        EditedAt?: string | undefined;
        IsDeleted: boolean;
        DeletedAt?: string | undefined;
        DeletedBy?: string | undefined;
        HasUserReacted?: boolean | undefined;
        Reactions?: {
            ReactionType: string;
            UserName: string;
            UserAvatar?: string | undefined;
        }[] | undefined;
    }[];
    count: number;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const sendMessage: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        MessageId: string;
        ConversationId: string;
        SenderId: string;
        SenderName?: string | undefined;
        SenderAvatar?: string | undefined;
        SenderRole?: string | undefined;
        Content: string;
        MessageType: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION" | "CONTACT";
        MediaUrl?: string | undefined;
        ThumbnailUrl?: string | undefined;
        FileName?: string | undefined;
        FileSize?: number | undefined;
        MimeType?: string | undefined;
        CreatedAt: string;
        ReadAt?: string | undefined;
        DeliveredAt?: string | undefined;
        IsEdited: boolean;
        EditedAt?: string | undefined;
        IsDeleted: boolean;
        DeletedAt?: string | undefined;
        DeletedBy?: string | undefined;
        HasUserReacted?: boolean | undefined;
        Reactions?: {
            ReactionType: string;
            UserName: string;
            UserAvatar?: string | undefined;
        }[] | undefined;
    };
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const toggleArchive: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const toggleBlock: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const deleteMessage: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
export declare const addReaction: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    action: string;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 500, "json">)>;
//# sourceMappingURL=message.controller.d.ts.map