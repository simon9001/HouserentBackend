import { rateLimiter } from "hono-rate-limiter";
export const limiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 500, // Limit each IP to 500 requests per minute
    standardHeaders: "draft-6",
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "default",
});
//# sourceMappingURL=ratelimmiter.js.map