import { Context } from 'hono';
export declare const createMediaWithUpload: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        cloudinaryInfo: {
            publicId: string;
            format: string;
            size: number;
        };
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const createBulkMediaWithUpload: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        cloudinaryInfo: {
            publicId: string;
            format: string;
            size: number;
        };
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
    }[];
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getUploadSignature: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        url: string;
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const deleteMediaWithCloudinary: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const createMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
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
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
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
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const updateMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const deleteMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const setPrimaryMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getPrimaryMedia: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
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
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
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
        totalMedia: number;
        images: number;
        videos: number;
        documents: number;
        primaryMedia: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getMediaCount: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        count: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getMediaByType: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        media_id: string;
        property_id: string;
        media_type: "IMAGE" | "VIDEO" | "DOCUMENT";
        media_url: string;
        thumbnail_url: string | null;
        is_primary: boolean;
        created_at: string;
        cloudinary_public_id?: string | null | undefined;
        file_size?: number | null | undefined;
        format?: string | null | undefined;
        dimensions?: string | null | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=propertyMedia.controller.d.ts.map