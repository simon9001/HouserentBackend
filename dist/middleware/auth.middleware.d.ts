import { Context, Next } from 'hono';
import { TokenPayload } from '../utils/jwt.js';
export interface AuthContext extends Context {
    user?: TokenPayload;
}
export declare const authenticate: (c: AuthContext, next: Next) => Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">)>;
export declare const authorize: (...allowedRoles: ("TENANT" | "AGENT" | "ADMIN")[]) => (c: AuthContext, next: Next) => Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 403, "json">)>;
export declare const optionalAuthenticate: (c: AuthContext, next: Next) => Promise<void>;
export declare const getUserFromContext: (c: AuthContext) => TokenPayload | undefined;
export declare const authenticateEnhanced: (c: AuthContext, next: Next) => Promise<void | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">)>;
//# sourceMappingURL=auth.middleware.d.ts.map