import { Context, Next } from 'hono';
import { JWTUtils } from '../utils/jwt.js';

export interface AuthContext extends Context {
    user?: {
        userId: string;
        username: string;
        email: string;
        role: 'TENANT' | 'AGENT' | 'ADMIN';
    };
}

// Authentication middleware
export const authenticate = async (c: AuthContext, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({
                success: false,
                error: 'Authorization header required'
            }, 401);
        }

        const token = authHeader.split(' ')[1];
        const payload = JWTUtils.verifyAccessToken(token);

        if (!payload) {
            return c.json({
                success: false,
                error: 'Invalid or expired token'
            }, 401);
        }

        // Attach user to context
        c.user = payload;

        await next();
    } catch (error) {
        console.error('Authentication error:', error);
        return c.json({
            success: false,
            error: 'Authentication failed'
        }, 401);
    }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: ('TENANT' | 'AGENT' | 'ADMIN')[]) => {
    return async (c: AuthContext, next: Next) => {
        try {
            const user = c.user;
            
            if (!user) {
                return c.json({
                    success: false,
                    error: 'Authentication required'
                }, 401);
            }

            if (!allowedRoles.includes(user.role)) {
                return c.json({
                    success: false,
                    error: 'Insufficient permissions'
                }, 403);
            }

            await next();
        } catch (error) {
            console.error('Authorization error:', error);
            return c.json({
                success: false,
                error: 'Authorization failed'
            }, 403);
        }
    };
};

// Optional authentication (for routes that work with or without auth)
export const optionalAuthenticate = async (c: AuthContext, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = JWTUtils.verifyAccessToken(token);
            
            if (payload) {
                c.user = payload;
            }
        }

        await next();
    } catch (error) {
        // Don't throw error for optional auth
        await next();
    }
};