import { Hono } from 'hono';
import { Context } from 'hono';
import { TokenPayload } from '../utils/jwt.js';
export type AuthContext = Context<{
    Variables: {
        user?: TokenPayload;
    };
}>;
declare const agentVerificationRoutes: Hono<{
    Variables: {
        user?: TokenPayload;
    };
}, import("hono/types").BlankSchema, "/">;
export default agentVerificationRoutes;
//# sourceMappingURL=agentRoutes.d.ts.map