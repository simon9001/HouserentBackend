// src/middleware/auth.ts
import { Context, Next } from 'hono';
import { JWTUtils, TokenPayload } from '../utils/jwt.js';

export interface AuthContext extends Context {
    user?: TokenPayload;  // Use the same interface
}

// Authentication middleware
export const authenticate = async (c: AuthContext, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        
        console.log('🔐 Authentication attempt:', {
            hasHeader: !!authHeader,
            headerPrefix: authHeader?.substring(0, 30) + '...'
        });
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No Bearer token found');
            return c.json({
                success: false,
                error: 'Authorization header required'
            }, 401);
        }

        const token = authHeader.split(' ')[1];
        
        // Log token for debugging (first 50 chars)
        console.log('📝 Token received:', token.substring(0, 50) + '...');
        
        const payload = JWTUtils.verifyAccessToken(token);
        console.log('🔍 Decoded payload:', payload);

        if (!payload) {
            console.log('❌ Token verification failed');
            return c.json({
                success: false,
                error: 'Invalid or expired token'
            }, 401);
        }

        // Ensure we have the userId field
        if (!payload.userId) {
            console.log('❌ Missing userId in token payload');
            return c.json({
                success: false,
                error: 'Invalid token structure'
            }, 401);
        }

        // Attach user to context
        c.user = payload;
        console.log('✅ User authenticated:', {
            userId: c.user.userId,
            username: c.user.username,
            role: c.user.role
        });

        // Return the result of next()
        return await next();
    } catch (error) {
        console.error('🔥 Authentication error:', error);
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

            console.log('🔐 Authorization check:', {
                userRole: user.role,
                allowedRoles
            });

            if (!allowedRoles.includes(user.role)) {
                console.log('❌ Insufficient permissions:', {
                    userRole: user.role,
                    requiredRoles: allowedRoles
                });
                return c.json({
                    success: false,
                    error: 'Insufficient permissions'
                }, 403);
            }

            console.log('✅ Authorization granted');
            // Return the result of next()
            return await next();
        } catch (error) {
            console.error('🔥 Authorization error:', error);
            return c.json({
                success: false,
                error: 'Authorization failed'
            }, 403);
        }
    };
};

// Optional authentication
export const optionalAuthenticate = async (c: AuthContext, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = JWTUtils.verifyAccessToken(token);
            
            if (payload) {
                c.user = payload;
                console.log('🔐 Optional auth - User authenticated:', c.user.userId);
            }
        }

        // Return the result of next()
        return await next();
    } catch (error) {
        console.error('Optional auth error:', error);
        // Still return the result of next() even on error
        return await next();
    }
};