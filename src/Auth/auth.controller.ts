import { Context } from 'hono';
import { authService, LoginInput, RegisterInput } from './auth.service.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailUtils } from '../utils/email.js';

// Register new user
export const register = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        const requiredFields = ['username', 'email', 'password', 'fullName', 'phoneNumber'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }

        const registerData: RegisterInput = {
            username: body.username,
            email: body.email,
            password: body.password,
            fullName: body.fullName,
            phoneNumber: body.phoneNumber,
            role: body.role || 'TENANT'
        };

        const result = await authService.register(registerData);

        return c.json({
            success: true,
            message: 'Registration successful. Please check your email for verification.',
            data: result
        }, 201);

    } catch (error: any) {
        console.error('Error during registration:', error.message);
        
        if (error.message.includes('already exists')) {
            return c.json({
                success: false,
                error: error.message
            }, 409);
        }

        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Registration failed'
        }, 500);
    }
};

// Login user
export const login = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.identifier || !body.password) {
            return c.json({
                success: false,
                error: 'Identifier (username/email/phone) and password are required'
            }, 400);
        }

        const loginData: LoginInput = {
            identifier: body.identifier,
            password: body.password
        };

        const result = await authService.login(loginData);

        return c.json({
            success: true,
            message: 'Login successful',
            data: result
        });

    } catch (error: any) {
        console.error('Error during login:', error.message);
        
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('Account is temporarily locked')) {
            return c.json({
                success: false,
                error: error.message
            }, 401);
        }

        return c.json({
            success: false,
            error: 'Login failed'
        }, 500);
    }
};

// Refresh token
export const refreshToken = async (c: Context) => {
    try {
        const body = await c.req.json();

        if (!body.refreshToken) {
            return c.json({
                success: false,
                error: 'Refresh token is required'
            }, 400);
        }

        const tokens = await authService.refreshToken(body.refreshToken);

        return c.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        });

    } catch (error: any) {
        console.error('Error refreshing token:', error.message);
        
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
            return c.json({
                success: false,
                error: error.message
            }, 401);
        }

        return c.json({
            success: false,
            error: 'Failed to refresh token'
        }, 500);
    }
};

// Logout
export const logout = async (c: Context) => {
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
                error: 'Invalid token'
            }, 401);
        }

        const body = await c.req.json().catch(() => ({}));
        const sessionId = body.sessionId;

        await authService.logout(payload.userId, sessionId);

        return c.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error: any) {
        console.error('Error during logout:', error.message);
        return c.json({
            success: false,
            error: 'Logout failed'
        }, 500);
    }
};

// Verify email
export const verifyEmail = async (c: Context) => {
    try {
        const body = await c.req.json();

        if (!body.token) {
            return c.json({
                success: false,
                error: 'Verification token is required'
            }, 400);
        }

        const success = await authService.verifyEmail(body.token);

        if (!success) {
            return c.json({
                success: false,
                error: 'Email verification failed'
            }, 400);
        }

        return c.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error: any) {
        console.error('Error verifying email:', error.message);
        
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Email verification failed'
        }, 500);
    }
};

// Request password reset
export const requestPasswordReset = async (c: Context) => {
    try {
        const body = await c.req.json();

        if (!body.email) {
            return c.json({
                success: false,
                error: 'Email is required'
            }, 400);
        }

        await authService.requestPasswordReset(body.email);

        // Always return success to prevent email enumeration
        return c.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });

    } catch (error: any) {
        console.error('Error requesting password reset:', error.message);
        
        // Still return success to prevent email enumeration
        return c.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });
    }
};

// Reset password
export const resetPassword = async (c: Context) => {
    try {
        const body = await c.req.json();

        if (!body.token || !body.newPassword) {
            return c.json({
                success: false,
                error: 'Token and new password are required'
            }, 400);
        }

        const success = await authService.resetPassword(body.token, body.newPassword);

        if (!success) {
            return c.json({
                success: false,
                error: 'Password reset failed'
            }, 400);
        }

        return c.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error: any) {
        console.error('Error resetting password:', error.message);
        
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        if (error.message.includes('must be')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Password reset failed'
        }, 500);
    }
};

// Change password (authenticated)
export const changePassword = async (c: Context) => {
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
                error: 'Invalid token'
            }, 401);
        }

        const body = await c.req.json();

        if (!body.currentPassword || !body.newPassword) {
            return c.json({
                success: false,
                error: 'Current password and new password are required'
            }, 400);
        }

        const success = await authService.changePassword(
            payload.userId,
            body.currentPassword,
            body.newPassword
        );

        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to change password'
            }, 400);
        }

        return c.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error: any) {
        console.error('Error changing password:', error.message);
        
        if (error.message.includes('Current password is incorrect')) {
            return c.json({
                success: false,
                error: error.message
            }, 401);
        }

        if (error.message.includes('must be')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Failed to change password'
        }, 500);
    }
};

// Get user sessions
export const getUserSessions = async (c: Context) => {
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
                error: 'Invalid token'
            }, 401);
        }

        const sessions = await authService.getUserSessions(payload.userId);

        return c.json({
            success: true,
            data: sessions
        });

    } catch (error: any) {
        console.error('Error getting user sessions:', error.message);
        return c.json({
            success: false,
            error: 'Failed to get user sessions'
        }, 500);
    }
};

// Revoke session
export const revokeSession = async (c: Context) => {
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
                error: 'Invalid token'
            }, 401);
        }

        const sessionId = c.req.param('sessionId');
        if (!sessionId) {
            return c.json({
                success: false,
                error: 'Session ID is required'
            }, 400);
        }

        const success = await authService.revokeSession(payload.userId, sessionId);

        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to revoke session'
            }, 400);
        }

        return c.json({
            success: true,
            message: 'Session revoked successfully'
        });

    } catch (error: any) {
        console.error('Error revoking session:', error.message);
        return c.json({
            success: false,
            error: 'Failed to revoke session'
        }, 500);
    }
};

// Get auth profile
export const getAuthProfile = async (c: Context) => {
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
                error: 'Invalid token'
            }, 401);
        }

        const profile = await authService.getAuthProfile(payload.userId);

        if (!profile) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: profile
        });

    } catch (error: any) {
        console.error('Error getting auth profile:', error.message);
        return c.json({
            success: false,
            error: 'Failed to get profile'
        }, 500);
    }
};

// Resend verification email
export const resendVerificationEmail = async (c: Context) => {
    try {
        const body = await c.req.json();

        if (!body.email) {
            return c.json({
                success: false,
                error: 'Email is required'
            }, 400);
        }

        await authService.resendVerificationEmail(body.email);

        // Always return success to prevent email enumeration
        return c.json({
            success: true,
            message: 'If an account exists with this email and is not verified, a new verification email has been sent'
        });

    } catch (error: any) {
        console.error('Error resending verification email:', error.message);
        
        if (error.message.includes('Email is already verified')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        // Still return success to prevent email enumeration
        return c.json({
            success: true,
            message: 'If an account exists with this email and is not verified, a new verification email has been sent'
        });
    }
};

// Health check for email service
export const checkEmailHealth = async (c: Context) => {
    try {
        const isHealthy = await EmailUtils.testConnection();
        
        return c.json({
            success: true,
            data: {
                emailService: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('Error checking email health:', error.message);
        return c.json({
            success: false,
            error: 'Email service check failed'
        }, 500);
    }
};