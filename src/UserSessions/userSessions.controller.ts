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
                error: 'Session not found'
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

// Revoke all sessions
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
            message: `Revoked ${revokedCount} sessions`,
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

        const stats = await userSessionsService.getSessionStatistics(userId);

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