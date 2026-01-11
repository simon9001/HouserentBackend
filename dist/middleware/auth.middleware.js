import { JWTUtils } from '../utils/jwt.js';
// Authentication middleware - UPDATED for compatibility
export const authenticate = async (c, next) => {
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
        // CRITICAL: Set user in context using BOTH methods for full compatibility
        // 1. Direct property (for existing APIs that use c.user)
        c.user = payload;
        // 2. Using c.set() (for new APIs that use c.get('user'))
        // Check if c.set exists before using it
        if (typeof c.set === 'function') {
            c.set('user', payload);
            console.log('✅ User set via c.set() method');
        }
        // 3. Using c.set? (for newer Hono versions)
        if ('set' in c && typeof c.set === 'function') {
            c.set('user', payload);
            console.log('✅ User set via (c as any).set() method');
        }
        console.log('✅ User authenticated:', {
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
            storedViaProperty: !!c.user,
            storedViaSet: typeof c.get === 'function' ? !!c.get('user') : 'c.get not available'
        });
        // Return the result of next()
        return await next();
    }
    catch (error) {
        console.error('🔥 Authentication error:', error.message || error);
        return c.json({
            success: false,
            error: 'Authentication failed'
        }, 401);
    }
};
// Role-based authorization middleware - UPDATED for compatibility
export const authorize = (...allowedRoles) => {
    return async (c, next) => {
        try {
            // Get user using both methods for compatibility
            let user = c.user;
            // Try to get from c.get() if not found via property
            if (!user && typeof c.get === 'function') {
                user = c.get('user');
            }
            if (!user) {
                console.log('🔐 Authorization - No user found');
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
        }
        catch (error) {
            console.error('🔥 Authorization error:', error.message || error);
            return c.json({
                success: false,
                error: 'Authorization failed'
            }, 403);
        }
    };
};
// Optional authentication - UPDATED for compatibility
export const optionalAuthenticate = async (c, next) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = JWTUtils.verifyAccessToken(token);
            if (payload) {
                // Set user using both methods
                c.user = payload;
                if (typeof c.set === 'function') {
                    c.set('user', payload);
                }
                console.log('🔐 Optional auth - User authenticated:', payload.userId);
            }
        }
        // Return the result of next()
        return await next();
    }
    catch (error) {
        console.error('Optional auth error:', error.message || error);
        // Still return the result of next() even on error
        return await next();
    }
};
// NEW: Universal user getter helper for controllers
export const getUserFromContext = (c) => {
    // Try direct property first (for backward compatibility)
    if (c.user) {
        return c.user;
    }
    // Try c.get() method
    if (typeof c.get === 'function') {
        const userFromGet = c.get('user');
        if (userFromGet) {
            return userFromGet;
        }
    }
    // Try c.set? access (some Hono versions)
    if ('get' in c && typeof c.get === 'function') {
        const userFromGet = c.get('user');
        if (userFromGet) {
            return userFromGet;
        }
    }
    console.log('👤 getUserFromContext - No user found using any method');
    return undefined;
};
// NEW: Enhanced authenticate middleware that ensures full compatibility
export const authenticateEnhanced = async (c, next) => {
    // First run the standard authenticate
    const response = await authenticate(c, async () => {
        // After authentication, ensure user is accessible via all methods
        // If we have a user via property but not via get, set it
        if (c.user && typeof c.set === 'function' && !c.get('user')) {
            c.set('user', c.user);
            console.log('🔄 Enhanced auth: Ensured user is set via c.set()');
        }
        // If we have a user via get but not via property, set it
        if (typeof c.get === 'function' && c.get('user') && !c.user) {
            c.user = c.get('user');
            console.log('🔄 Enhanced auth: Ensured user is set via property');
        }
        await next();
    });
    return response;
};
//# sourceMappingURL=auth.middleware.js.map