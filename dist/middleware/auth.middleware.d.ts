import { Context, Next } from 'hono';
import { TokenPayload } from '../utils/jwt.js';
export interface AuthContext extends Context {
    user?: TokenPayload;
}
export declare const authenticate: (c: AuthContext, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | undefined>;
export declare const authorize: (...allowedRoles: ("TENANT" | "AGENT" | "ADMIN")[]) => (c: AuthContext, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 403, "json">) | undefined>;
export declare const optionalAuthenticate: (c: AuthContext, next: Next) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map