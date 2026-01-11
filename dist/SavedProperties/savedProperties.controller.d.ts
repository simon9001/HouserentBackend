import { Context } from 'hono';
export declare const saveProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const unsaveProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getSavedPropertiesByUserId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        SavedId: string;
        UserId: string;
        PropertyId: string;
        CreatedAt: string;
        Title?: string | undefined;
        Description?: string | undefined;
        RentAmount?: number | undefined;
        County?: string | undefined;
        Area?: string | undefined;
        PropertyType?: string | undefined;
        PrimaryImageUrl?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const isPropertySaved: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        isSaved: boolean;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
//# sourceMappingURL=savedProperties.controller.d.ts.map