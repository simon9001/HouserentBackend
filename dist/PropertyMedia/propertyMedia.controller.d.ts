import { Context } from 'hono';
export declare const createMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getMediaById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getMediaByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const updateMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const deleteMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const setPrimaryMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPrimaryMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const createBulkMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        MediaId: string;
        PropertyId: string;
        MediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
        MediaUrl: string;
        ThumbnailUrl: string | null;
        IsPrimary: boolean;
        CreatedAt: string;
    }[];
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getMediaStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        total: number;
        images: number;
        videos: number;
        documents: number;
        hasPrimary: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=propertyMedia.controller.d.ts.map