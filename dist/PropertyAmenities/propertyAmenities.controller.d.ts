import { Context } from 'hono';
export declare const createAmenity: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        AmenityId: string;
        PropertyId: string;
        AmenityName: string;
        CreatedAt: string;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAmenityById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        AmenityId: string;
        PropertyId: string;
        AmenityName: string;
        CreatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAmenitiesByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        AmenityId: string;
        PropertyId: string;
        AmenityName: string;
        CreatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateAmenity: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        AmenityId: string;
        PropertyId: string;
        AmenityName: string;
        CreatedAt: string;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const deleteAmenity: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const createBulkAmenities: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        AmenityId: string;
        PropertyId: string;
        AmenityName: string;
        CreatedAt: string;
    }[];
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const deleteAmenitiesByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getCommonAmenities: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        name: string;
        count: number;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const searchAmenities: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        AmenityId: string;
        PropertyId: string;
        AmenityName: string;
        CreatedAt: string;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getAmenitiesStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: any;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=propertyAmenities.controller.d.ts.map