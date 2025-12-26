import { Hono } from 'hono';
import * as authControllers from './auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const authRoutes = new Hono();

// Public routes (no authentication required)
authRoutes.post('/register', authControllers.register); // Register new user
authRoutes.post('/login', authControllers.login); // Login user
authRoutes.post('/refresh-token', authControllers.refreshToken); // Refresh token
authRoutes.post('/verify-email', authControllers.verifyEmail); // Verify email
authRoutes.post('/request-password-reset', authControllers.requestPasswordReset); // Request password reset
authRoutes.post('/reset-password', authControllers.resetPassword); // Reset password
authRoutes.post('/resend-verification', authControllers.resendVerificationEmail); // Resend verification email
authRoutes.get('/email-health', authControllers.checkEmailHealth); // Check email service health



authRoutes.post('/debug/token', authControllers.debugToken);
authRoutes.post('/debug/test-jwt', authControllers.testJwtGeneration);
authRoutes.post('/debug/validate', authControllers.validateToken);
authRoutes.post('/debug/echo', authControllers.echo);
authRoutes.get('/debug/check-auth', authControllers.checkAuth);
authRoutes.get('/debug/email-health', authControllers.checkEmailHealth);

// Protected routes (authentication required)
authRoutes.post('/logout', authenticate, authControllers.logout); // Logout
authRoutes.post('/change-password', authenticate, authControllers.changePassword); // Change password
authRoutes.get('/profile', authenticate, authControllers.getAuthProfile); // Get auth profile
authRoutes.get('/sessions', authenticate, authControllers.getUserSessions); // Get user sessions
authRoutes.delete('/sessions/:sessionId', authenticate, authControllers.revokeSession); // Revoke specific session

// Role-based protected routes
authRoutes.get('/admin/stats', authenticate, authorize('ADMIN'), async (c) => {
    // Example admin-only route
    return c.json({
        success: true,
        message: 'Admin access granted'
    });
});

authRoutes.get('/agent/dashboard', authenticate, authorize('AGENT', 'ADMIN'), async (c) => {
    // Example agent/admin route
    return c.json({
        success: true,
        message: 'Agent/Admin access granted'
    });
});

export default authRoutes;