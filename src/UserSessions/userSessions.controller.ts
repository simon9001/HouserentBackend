import { Context } from 'hono';
import { userSessionsService } from './userSessions.service.js';
import { ValidationUtils } from '../utils/validators.js';

// Get user sessions
export const getUserSessions = async (c: Context) => {
    try {
        const userId = c.req.param('userId');

        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        const sessions = await userSessionsService.getUserSessions(userId);

        return c.json({
            success: true,
            data: sessions
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch user sessions'
        }, 400);
    }
};

// Revoke session
export const revokeSession = async (c: Context) => {
    try {
        const sessionId = c.req.param('sessionId');

        if (!ValidationUtils.isValidUUID(sessionId)) {
            return c.json({
                success: false,
                error: 'Invalid session ID format'
            }, 400);
        }

        const revoked = await userSessionsService.revokeSession(sessionId);

        if (!revoked) {
            return c.json({
                success: false,
                error: 'Session not found or already inactive'
            }, 404);
        }

        return c.json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to revoke session'
        }, 400);
    }
};

// Revoke all sessions for a user
export const revokeAllSessions = async (c: Context) => {
    try {
        const userId = c.req.param('userId');
        const excludeSessionId = c.req.query('excludeSessionId');

        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        if (excludeSessionId && !ValidationUtils.isValidUUID(excludeSessionId)) {
            return c.json({
                success: false,
                error: 'Invalid exclude session ID format'
            }, 400);
        }

        const revokedCount = await userSessionsService.revokeAllUserSessions(userId, excludeSessionId);

        return c.json({
            success: true,
            message: `Revoked ${revokedCount} session(s)`,
            data: { revokedCount }
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to revoke sessions'
        }, 400);
    }
};

// Get session statistics
export const getSessionStatistics = async (c: Context) => {
    try {
        const userId = c.req.query('userId');

        if (userId && !ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        // Handle both cases: with and without userId
        const stats = userId 
            ? await userSessionsService.getSessionStatistics(userId)
            : await userSessionsService.getSessionStatistics();

        return c.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch session statistics'
        }, 400);
    }
};

// Revoke sessions by device
export const revokeSessionsByDevice = async (c: Context) => {
    try {
        const userId = c.req.param('userId');
        const deviceId = c.req.query('deviceId');

        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        if (!deviceId || deviceId.trim() === '') {
            return c.json({
                success: false,
                error: 'Device ID is required'
            }, 400);
        }

        const revokedCount = await userSessionsService.revokeSessionsByDevice(userId, deviceId);

        return c.json({
            success: true,
            message: `Revoked ${revokedCount} session(s) for device ${deviceId}`,
            data: { revokedCount }
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to revoke sessions by device'
        }, 400);
    }
};

// Get session by ID
export const getSession = async (c: Context) => {
    try {
        const sessionId = c.req.param('sessionId');

        if (!ValidationUtils.isValidUUID(sessionId)) {
            return c.json({
                success: false,
                error: 'Invalid session ID format'
            }, 400);
        }

        const session = await userSessionsService.getSessionById(sessionId);

        if (!session) {
            return c.json({
                success: false,
                error: 'Session not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch session'
        }, 400);
    }
};

// Get session with user details
export const getSessionWithUser = async (c: Context) => {
    try {
        const sessionId = c.req.param('sessionId');

        if (!ValidationUtils.isValidUUID(sessionId)) {
            return c.json({
                success: false,
                error: 'Invalid session ID format'
            }, 400);
        }

        const sessionWithUser = await userSessionsService.getSessionWithUser(sessionId);

        if (!sessionWithUser) {
            return c.json({
                success: false,
                error: 'Session not found or inactive'
            }, 404);
        }

        return c.json({
            success: true,
            data: sessionWithUser
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch session with user details'
        }, 400);
    }
};

// Renew session (extend expiry)
export const renewSession = async (c: Context) => {
    try {
        const sessionId = c.req.param('sessionId');
        const { additionalDays } = await c.req.json().catch(() => ({}));
        
        if (!ValidationUtils.isValidUUID(sessionId)) {
            return c.json({
                success: false,
                error: 'Invalid session ID format'
            }, 400);
        }

        const renewedSession = await userSessionsService.renewSession(
            sessionId, 
            additionalDays || 30
        );

        if (!renewedSession) {
            return c.json({
                success: false,
                error: 'Session not found or inactive'
            }, 404);
        }

        return c.json({
            success: true,
            message: 'Session renewed successfully',
            data: renewedSession
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to renew session'
        }, 400);
    }
};

// Check if user has active session on device
export const checkDeviceSession = async (c: Context) => {
    try {
        const userId = c.req.param('userId');
        const deviceId = c.req.query('deviceId');

        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        if (!deviceId || deviceId.trim() === '') {
            return c.json({
                success: false,
                error: 'Device ID is required'
            }, 400);
        }

        const hasSession = await userSessionsService.hasActiveSessionOnDevice(userId, deviceId);

        return c.json({
            success: true,
            data: { hasActiveSession: hasSession }
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to check device session'
        }, 400);
    }
};

// Get session by device ID
export const getSessionByDevice = async (c: Context) => {
    try {
        const userId = c.req.param('userId');
        const deviceId = c.req.query('deviceId');

        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        if (!deviceId || deviceId.trim() === '') {
            return c.json({
                success: false,
                error: 'Device ID is required'
            }, 400);
        }

        const session = await userSessionsService.getSessionByDevice(userId, deviceId);

        if (!session) {
            return c.json({
                success: false,
                error: 'No active session found for this device'
            }, 404);
        }

        return c.json({
            success: true,
            data: session
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch session by device'
        }, 400);
    }
};

// Maintenance endpoints (admin only)

// Clean expired sessions
export const cleanExpiredSessions = async (c: Context) => {
    try {
        const cleanedCount = await userSessionsService.cleanExpiredSessions();

        return c.json({
            success: true,
            message: `Cleaned ${cleanedCount} expired session(s)`,
            data: { cleanedCount }
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to clean expired sessions'
        }, 400);
    }
};

// Clean up old inactive sessions
export const cleanupOldSessions = async (c: Context) => {
    try {
        const { daysOld } = await c.req.json().catch(() => ({}));
        const cleanedCount = await userSessionsService.cleanupOldSessions(daysOld || 30);

        return c.json({
            success: true,
            message: `Cleaned ${cleanedCount} old inactive session(s)`,
            data: { cleanedCount }
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to clean up old sessions'
        }, 400);
    }
};

// Validate session by refresh token
export const validateSession = async (c: Context) => {
    try {
        const { refreshToken } = await c.req.json();

        if (!refreshToken) {
            return c.json({
                success: false,
                error: 'Refresh token is required'
            }, 400);
        }

        const validationResult = await userSessionsService.validateSession(refreshToken);

        if (!validationResult.isValid) {
            return c.json({
                success: false,
                error: validationResult.message || 'Invalid session',
                data: { isValid: false }
            }, 401);
        }

        return c.json({
            success: true,
            message: 'Session is valid',
            data: {
                isValid: true,
                session: validationResult.session
            }
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to validate session'
        }, 400);
    }
};