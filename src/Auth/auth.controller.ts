// src/controllers/auth.controller.ts
import { Context } from 'hono';
import { authService, LoginInput, RegisterInput } from './auth.service.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailUtils } from '../utils/email.js';

// Register new user
export const register = async (c: Context) => {
    try {
        console.log('📝 Registration request received');
        const body = await c.req.json();

        // Validate required fields
        const requiredFields = ['username', 'email', 'password', 'fullName', 'phoneNumber'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            console.log('❌ Missing fields:', missingFields);
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }

        // Add password length validation to prevent backend crashes
        if (body.password.length > 100) {
            return c.json({
                success: false,
                error: 'Password must be 100 characters or less'
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

        console.log('🔄 Processing registration for:', registerData.username);
        const result = await authService.register(registerData);

        // Debug: Check the token structure
        console.log('🔍 Registration successful, token structure:', {
            accessTokenLength: result.tokens.accessToken?.length,
            hasSessionId: !!result.tokens.sessionId,
            userId: result.user.UserId
        });

        return c.json({
            success: true,
            message: 'Registration successful. Please check your email for verification.',
            data: result
        }, 201);

    } catch (error: any) {
        console.error('🔥 Error during registration:', error.message, error.stack);
        
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

// Login user - UPDATED to check email verification
export const login = async (c: Context) => {
    try {
        console.log('🔐 Login attempt');
        const body = await c.req.json();

        // Validate required fields
        if (!body.identifier || !body.password) {
            return c.json({
                success: false,
                error: 'Identifier (username/email/phone) and password are required'
            }, 400);
        }

        // Add password length validation to prevent backend crashes
        if (body.password.length > 100) {
            return c.json({
                success: false,
                error: 'Invalid password format',
                needsVerification: false
            }, 400);
        }

        const loginData: LoginInput = {
            identifier: body.identifier,
            password: body.password
        };

        const result = await authService.login(loginData);

        // Check if email is verified - ADD THIS CHECK
        if (!result.user.IsEmailVerified) {
            console.log('❌ Login attempt with unverified email:', result.user.Email);
            
            // Still return some user info for frontend to display
            return c.json({
                success: false,
                error: 'Please verify your email before logging in. Check your email inbox or click the resend verification link.',
                needsVerification: true,
                email: result.user.Email,
                data: {
                    user: {
                        UserId: result.user.UserId,
                        Email: result.user.Email,
                        Username: result.user.Username,
                        IsEmailVerified: result.user.IsEmailVerified
                    },
                    // Don't return tokens if email not verified
                    tokens: null
                }
            }, 403); // 403 Forbidden - specifically for unverified emails
        }

        // Debug: Check the token structure
        console.log('🔍 Login successful, token details:', {
            accessTokenLength: result.tokens.accessToken?.length,
            hasSessionId: !!result.tokens.sessionId,
            userId: result.user.UserId,
            userRole: result.user.Role
        });

        return c.json({
            success: true,
            message: 'Login successful',
            data: result
        });

    } catch (error: any) {
        console.error('🔥 Error during login:', error.message);
        
        if (error.message.includes('Invalid credentials') || 
            error.message.includes('Account is temporarily locked')) {
            return c.json({
                success: false,
                error: error.message
            }, 401);
        }

        if (error.message.includes('Please verify your email')) {
            return c.json({
                success: false,
                error: error.message,
                needsVerification: true
            }, 403);
        }

        return c.json({
            success: false,
            error: 'Login failed'
        }, 500);
    }
};

// Refresh token - UPDATED to check email verification
export const refreshToken = async (c: Context) => {
    try {
        console.log('🔄 Refresh token request');
        const body = await c.req.json();

        if (!body.refreshToken) {
            return c.json({
                success: false,
                error: 'Refresh token is required'
            }, 400);
        }

        const tokens = await authService.refreshToken(body.refreshToken);
        
        // Check if user email is verified when refreshing token
        // This prevents bypassing email verification through token refresh
        const payload = JWTUtils.verifyAccessToken(tokens.accessToken);
        if (payload) {
            const userProfile = await authService.getAuthProfile(payload.userId);
            if (userProfile && !userProfile.IsEmailVerified) {
                console.log('❌ Token refresh attempt for unverified user:', userProfile.Email);
                return c.json({
                    success: false,
                    error: 'Please verify your email to access your account',
                    needsVerification: true,
                    email: userProfile.Email
                }, 403);
            }
        }
        
        console.log('✅ Token refreshed:', {
            newAccessTokenLength: tokens.accessToken?.length,
            sessionId: tokens.sessionId
        });

        return c.json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens
        });

    } catch (error: any) {
        console.error('🔥 Error refreshing token:', error.message);
        
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
            return c.json({
                success: false,
                error: error.message
            }, 401);
        }

        if (error.message.includes('Please verify your email')) {
            return c.json({
                success: false,
                error: error.message,
                needsVerification: true
            }, 403);
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
        console.log('🚪 Logout request');
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
            console.log('❌ Invalid token during logout');
            return c.json({
                success: false,
                error: 'Invalid token'
            }, 401);
        }

        const body = await c.req.json().catch(() => ({}));
        const sessionId = body.sessionId;

        console.log('🔍 Logging out user:', {
            userId: payload.userId,
            sessionId: sessionId || 'all sessions'
        });

        await authService.logout(payload.userId, sessionId);

        return c.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error: any) {
        console.error('🔥 Error during logout:', error.message);
        return c.json({
            success: false,
            error: 'Logout failed'
        }, 500);
    }
};

// Verify email - UPDATED to return email for frontend redirection
export const verifyEmail = async (c: Context) => {
    try {
        console.log('📧 Email verification request');
        const body = await c.req.json();

        if (!body.token) {
            return c.json({
                success: false,
                error: 'Verification token is required'
            }, 400);
        }

        const result = await authService.verifyEmail(body.token);

        if (!result.success) {
            return c.json({
                success: false,
                error: result.message || 'Email verification failed'
            }, 400);
        }

        console.log('✅ Email verified successfully for:', result.email);
        return c.json({
            success: true,
            message: 'Email verified successfully',
            email: result.email
        });

    } catch (error: any) {
        console.error('🔥 Error verifying email:', error.message);
        
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
        console.log('🔑 Password reset request');
        const body = await c.req.json();

        if (!body.email) {
            return c.json({
                success: false,
                error: 'Email is required'
            }, 400);
        }

        console.log('📧 Sending password reset for:', body.email);
        await authService.requestPasswordReset(body.email);

        // Always return success to prevent email enumeration
        return c.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });

    } catch (error: any) {
        console.error('🔥 Error requesting password reset:', error.message);
        
        // Still return success to prevent email enumeration
        return c.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });
    }
};

// Reset password - ADD email verification check
export const resetPassword = async (c: Context) => {
    try {
        console.log('🔄 Password reset attempt');
        const body = await c.req.json();

        if (!body.token || !body.newPassword) {
            return c.json({
                success: false,
                error: 'Token and new password are required'
            }, 400);
        }

        // Add password length validation
        if (body.newPassword.length > 100) {
            return c.json({
                success: false,
                error: 'Password must be 100 characters or less'
            }, 400);
        }

        const result = await authService.resetPassword(body.token, body.newPassword);

        if (!result.success) {
            return c.json({
                success: false,
                error: result.message || 'Password reset failed'
            }, 400);
        }

        console.log('✅ Password reset successfully for:', result.email);
        return c.json({
            success: true,
            message: 'Password reset successfully',
            email: result.email
        });

    } catch (error: any) {
        console.error('🔥 Error resetting password:', error.message);
        
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

// Change password (authenticated) - ADD password length validation
export const changePassword = async (c: Context) => {
    try {
        console.log('🔒 Change password request');
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
            console.log('❌ Invalid token during password change');
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

        // Add password length validation
        if (body.newPassword.length > 100) {
            return c.json({
                success: false,
                error: 'New password must be 100 characters or less'
            }, 400);
        }

        console.log('🔄 Changing password for user:', payload.userId);
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

        console.log('✅ Password changed successfully');
        return c.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error: any) {
        console.error('🔥 Error changing password:', error.message);
        
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
        console.log('📋 Get user sessions request');
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

        console.log('🔍 Getting sessions for user:', payload.userId);
        const sessions = await authService.getUserSessions(payload.userId);

        return c.json({
            success: true,
            data: sessions
        });

    } catch (error: any) {
        console.error('🔥 Error getting user sessions:', error.message);
        return c.json({
            success: false,
            error: 'Failed to get user sessions'
        }, 500);
    }
};

// Revoke session
export const revokeSession = async (c: Context) => {
    try {
        console.log('🗑️ Revoke session request');
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

        console.log('🔍 Revoking session:', { userId: payload.userId, sessionId });
        const success = await authService.revokeSession(payload.userId, sessionId);

        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to revoke session'
            }, 400);
        }

        console.log('✅ Session revoked successfully');
        return c.json({
            success: true,
            message: 'Session revoked successfully'
        });

    } catch (error: any) {
        console.error('🔥 Error revoking session:', error.message);
        return c.json({
            success: false,
            error: 'Failed to revoke session'
        }, 500);
    }
};

// Get auth profile
export const getAuthProfile = async (c: Context) => {
    try {
        console.log('👤 Get auth profile request');
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
            console.log('❌ Invalid token for profile request');
            return c.json({
                success: false,
                error: 'Invalid token'
            }, 401);
        }

        console.log('🔍 Getting profile for user:', payload.userId);
        const profile = await authService.getAuthProfile(payload.userId);

        if (!profile) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }

        // Check email verification status
        if (!profile.IsEmailVerified) {
            console.log('⚠️ Profile request for unverified user:', profile.Email);
            // Still return profile but include warning
            return c.json({
                success: true,
                message: 'Please verify your email to access all features',
                needsVerification: true,
                data: profile
            });
        }

        console.log('✅ Profile retrieved successfully');
        return c.json({
            success: true,
            data: profile
        });

    } catch (error: any) {
        console.error('🔥 Error getting auth profile:', error.message);
        return c.json({
            success: false,
            error: 'Failed to get profile'
        }, 500);
    }
};

// Resend verification email
export const resendVerificationEmail = async (c: Context) => {
    try {
        console.log('📧 Resend verification email request');
        const body = await c.req.json();

        if (!body.email) {
            return c.json({
                success: false,
                error: 'Email is required'
            }, 400);
        }

        console.log('📧 Resending verification for:', body.email);
        const result = await authService.resendVerificationEmail(body.email);

        if (!result.success) {
            return c.json({
                success: false,
                error: result.message || 'Failed to resend verification email'
            }, 400);
        }

        // Return success message
        return c.json({
            success: true,
            message: result.message || 'Verification email sent successfully'
        });

    } catch (error: any) {
        console.error('🔥 Error resending verification email:', error.message);
        
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
        console.log('🏥 Email health check');
        const isHealthy = await EmailUtils.testConnection();
        
        console.log('✅ Email service status:', isHealthy ? 'healthy' : 'unhealthy');
        return c.json({
            success: true,
            data: {
                emailService: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('🔥 Error checking email health:', error.message);
        return c.json({
            success: false,
            error: 'Email service check failed'
        }, 500);
    }
};

// =============================================
// DEBUG ENDPOINTS
// =============================================

// Debug token endpoint
export const debugToken = async (c: Context) => {
    try {
        console.log('🔧 Debug token request');
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({
                success: false,
                error: 'No token provided'
            }, 400);
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Debugging token (first 50 chars):', token.substring(0, 50) + '...');
        
        const debugInfo = await authService.debugTokenStructure(token);

        console.log('✅ Token debug info:', {
            hasUserId: debugInfo?.fieldCheck?.hasUserId,
            userIdValue: debugInfo?.fieldCheck?.userIdValue
        });

        return c.json({
            success: true,
            data: debugInfo
        });
    } catch (error: any) {
        console.error('🔥 Error debugging token:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 400);
    }
};

// Test JWT generation endpoint
export const testJwtGeneration = async (c: Context) => {
    try {
        console.log('🔧 Test JWT generation request');
        const body = await c.req.json();
        
        if (!body.userId) {
            return c.json({
                success: false,
                error: 'userId is required'
            }, 400);
        }

        console.log('🔄 Testing JWT generation for user:', body.userId);
        const testResult = await authService.testJwtGeneration(body.userId);

        console.log('✅ JWT test successful:', {
            hasUserId: testResult.fieldCheck.hasUserId,
            userIdValue: testResult.fieldCheck.userIdValue
        });

        return c.json({
            success: true,
            data: testResult
        });
    } catch (error: any) {
        console.error('🔥 Error testing JWT generation:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 400);
    }
};

// Validate token endpoint
export const validateToken = async (c: Context) => {
    try {
        console.log('✅ Validate token request');
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({
                success: false,
                error: 'No token provided'
            }, 400);
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Validating token...');
        
        // Try multiple verification approaches
        const jwtPayload = JWTUtils.verifyAccessToken(token);
        const serviceValidation = await authService.validateAccessToken(token);
        const userIdFromToken = await authService.getUserIdFromToken(token);

        // Decode without verification to see structure
        let rawDecoded = null;
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                rawDecoded = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            }
        } catch (e) {
            console.warn('Could not decode token:', e);
        }

        const validationResult = {
            jwtUtilsVerification: jwtPayload,
            serviceValidation: serviceValidation,
            userIdFromToken: userIdFromToken,
            rawTokenStructure: rawDecoded,
            tokenLength: token.length,
            isWellFormed: token.split('.').length === 3,
            timestamp: new Date().toISOString()
        };

        console.log('✅ Token validation result:', {
            isValid: !!jwtPayload,
            userId: userIdFromToken
        });

        return c.json({
            success: true,
            message: jwtPayload ? 'Token is valid' : 'Token is invalid',
            data: validationResult
        });
    } catch (error: any) {
        console.error('🔥 Error validating token:', error.message);
        return c.json({
            success: false,
            error: error.message
        }, 400);
    }
};

// Simple echo endpoint to test if API is working
export const echo = async (c: Context) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        console.log('🔊 Echo request:', body);
        
        return c.json({
            success: true,
            message: 'API is working',
            data: {
                echo: body,
                timestamp: new Date().toISOString(),
                headers: Object.fromEntries(c.req.raw.headers)
            }
        });
    } catch (error: any) {
        console.error('🔥 Error in echo endpoint:', error.message);
        return c.json({
            success: false,
            error: 'Echo failed'
        }, 500);
    }
};

// Check authentication middleware
export const checkAuth = async (c: Context) => {
    try {
        console.log('🔐 Checking authentication');
        const authHeader = c.req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No valid auth header');
            return c.json({
                success: false,
                authenticated: false,
                error: 'No authentication token provided'
            }, 401);
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Token present, length:', token.length);
        
        const payload = JWTUtils.verifyAccessToken(token);
        
        if (!payload) {
            console.log('❌ Token verification failed');
            return c.json({
                success: false,
                authenticated: false,
                error: 'Invalid or expired token'
            }, 401);
        }

        console.log('✅ Authentication successful:', {
            userId: payload.userId,
            username: payload.username,
            role: payload.role
        });

        return c.json({
            success: true,
            authenticated: true,
            message: 'Authenticated successfully',
            user: payload,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('🔥 Error checking auth:', error.message);
        return c.json({
            success: false,
            authenticated: false,
            error: 'Authentication check failed'
        }, 500);
    }
};

// NEW: Get user by email (for verification redirect)
export const getUserByEmail = async (c: Context) => {
    try {
        console.log('👤 Get user by email request');
        const body = await c.req.json();
        
        if (!body.email) {
            return c.json({
                success: false,
                error: 'Email is required'
            }, 400);
        }

        const user = await authService.getUserByEmail(body.email);
        
        if (!user) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }

        // Return limited user info for verification purposes
        return c.json({
            success: true,
            data: {
                UserId: user.UserId,
                Email: user.Email,
                Username: user.Username,
                IsEmailVerified: user.IsEmailVerified
            }
        });

    } catch (error: any) {
        console.error('🔥 Error getting user by email:', error.message);
        return c.json({
            success: false,
            error: 'Failed to get user'
        }, 500);
    }
};