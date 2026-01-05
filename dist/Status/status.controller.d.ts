import { Context } from 'hono';
import { AuthContext } from '../middleware/auth.middleware.js';
export declare const createStatus: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<any, 201, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, 500, "json">)>;
export declare const getActiveStatuses: (c: Context) => Promise<(Response & import("hono").TypedResponse<import("hono/utils/types").JSONValue[], 200, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, 500, "json">)>;
export declare const deleteStatus: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    message: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, 200, "json">) | (Response & import("hono").TypedResponse<{
    message: string;
}, 500, "json">)>;
//# sourceMappingURL=status.controller.d.ts.map