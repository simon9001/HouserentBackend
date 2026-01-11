// src/services/auth.service.ts
import crypto from 'node:crypto';
import { supabase } from '../Database/config.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailUtils } from '../utils/email.js';
import { SecurityUtils } from '../utils/security.js';
import { UserValidators } from '../utils/validators.js';
import { usersService } from '../Users/userService.js';
export class AuthService {
    // Helper method to hash tokens for storage
    hashTokenForStorage(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    // Generate consistent token payload
    generateTokenPayload(user) {
        return {
            userId: user.UserId, // Ensure consistent field name
            username: user.Username,
            email: user.Email,
            role: user.Role
        };
    }
    // Register new user
    async register(data) {
        try {
            console.log('Starting registration for:', data.username);
            // Create user first
            const user = await usersService.createUser(data);
            console.log('User created successfully:', user.UserId);
            // Generate consistent token payload
            const tokenPayload = this.generateTokenPayload(user);
            // Generate tokens
            const tokens = {
                accessToken: JWTUtils.generateAccessToken(tokenPayload),
                refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
            };
            console.log('Tokens generated');
            // Create session and get sessionId
            const sessionId = await this.createSession(user.UserId, tokens.refreshToken);
            console.log('Session created with ID:', sessionId);
            // Send verification email
            try {
                const verificationToken = JWTUtils.generateEmailVerificationToken(user.Email);
                await EmailUtils.sendVerificationEmail(user.Email, verificationToken);
                await this.saveEmailVerificationToken(user.UserId, verificationToken);
                await EmailUtils.sendWelcomeEmail(user.Email, user.Username);
                console.log('Verification email sent');
            }
            catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Don't fail registration if email fails
            }
            // Remove password hash from response
            const { PasswordHash, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                tokens: {
                    ...tokens,
                    sessionId
                }
            };
        }
        catch (error) {
            console.error('Registration error:', error.message, error.stack);
            throw error;
        }
    }
    // Login user
    async login(data) {
        // Check if account is locked
        const { data: users, error } = await supabase
            .from('Users')
            .select('UserId, LockedUntil, PasswordHash, Username, Email, Role, PhoneNumber, FullName, Bio, Address, AvatarUrl, AgentStatus, TrustScore, IsActive, IsEmailVerified, LoginAttempts, LastLogin, CreatedAt, UpdatedAt')
            .eq('IsActive', true)
            .or(`Username.eq.${data.identifier},Email.eq.${data.identifier},PhoneNumber.eq.${data.identifier}`);
        if (error || !users || users.length === 0) {
            throw new Error('Invalid credentials');
        }
        const user = users[0];
        // Check if account is locked
        if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
            throw new Error('Account is temporarily locked. Please try again later.');
        }
        // Verify password
        const isPasswordValid = await SecurityUtils.comparePassword(data.password, user.PasswordHash);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await usersService.updateLoginAttempts(user.UserId, false);
            throw new Error('Invalid credentials');
        }
        // Reset login attempts on successful login
        await usersService.updateLoginAttempts(user.UserId, true);
        // Generate consistent token payload
        const tokenPayload = this.generateTokenPayload(user);
        // Generate tokens
        const tokens = {
            accessToken: JWTUtils.generateAccessToken(tokenPayload),
            refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
        };
        // Create session and get sessionId
        const sessionId = await this.createSession(user.UserId, tokens.refreshToken);
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            tokens: {
                ...tokens,
                sessionId
            }
        };
    }
    // Refresh token
    async refreshToken(refreshToken) {
        // Verify refresh token
        const payload = JWTUtils.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid refresh token');
        }
        // Hash the token to compare with database
        const tokenHash = this.hashTokenForStorage(refreshToken);
        const { data: sessions, error } = await supabase
            .from('UserSessions')
            .select('*')
            .eq('RefreshTokenHash', tokenHash)
            .eq('IsActive', true)
            .gt('ExpiresAt', new Date().toISOString());
        if (error || !sessions || sessions.length === 0) {
            throw new Error('Invalid or expired session');
        }
        const session = sessions[0];
        // Generate new tokens
        const newTokenPayload = {
            userId: payload.userId, // Use consistent field name
            username: payload.username,
            email: payload.email,
            role: payload.role
        };
        const newTokens = {
            accessToken: JWTUtils.generateAccessToken(newTokenPayload),
            refreshToken: JWTUtils.generateRefreshToken(newTokenPayload)
        };
        // Update session with new refresh token
        await this.updateSession(session.SessionId, newTokens.refreshToken);
        return {
            ...newTokens,
            sessionId: session.SessionId
        };
    }
    // Logout
    async logout(userId, sessionId) {
        let query = supabase.from('UserSessions').update({ IsActive: false }).eq('UserId', userId);
        if (sessionId) {
            query = query.eq('SessionId', sessionId);
        }
        await query;
    }
    // Verify email
    async verifyEmail(token) {
        // Verify token
        const payload = JWTUtils.verifyEmailVerificationToken(token);
        if (!payload) {
            throw new Error('Invalid or expired verification token');
        }
        // Check if token exists in database
        const { data: tokens, error } = await supabase
            .from('EmailVerificationTokens')
            .select('*')
            .eq('VerificationToken', token)
            .eq('IsUsed', false)
            .gt('ExpiresAt', new Date().toISOString());
        if (error || !tokens || tokens.length === 0) {
            throw new Error('Invalid or expired verification token');
        }
        const verificationRecord = tokens[0];
        // Mark token as used
        await supabase
            .from('EmailVerificationTokens')
            .update({ IsUsed: true })
            .eq('TokenId', verificationRecord.TokenId);
        // Update user email verification status
        // Using email from payload is safer if the token is valid
        const { error: userError } = await supabase
            .from('Users')
            .update({ IsEmailVerified: true })
            .eq('Email', payload.email);
        return !userError;
    }
    // Request password reset
    async requestPasswordReset(email) {
        // Check if user exists
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            // Don't reveal that user doesn't exist for security
            return;
        }
        // Generate reset token with consistent userId
        const resetToken = JWTUtils.generatePasswordResetToken(user.UserId);
        // Hash the token for storage
        const tokenHash = this.hashTokenForStorage(resetToken);
        // Save token to database
        const { error } = await supabase
            .from('PasswordResetTokens')
            .insert({
            UserId: user.UserId,
            TokenHash: tokenHash,
            ExpiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        });
        if (error) {
            console.error("Error saving password reset token", error);
            return;
        }
        // Send reset email
        await EmailUtils.sendPasswordResetEmail(email, resetToken);
    }
    // Reset password
    async resetPassword(token, newPassword) {
        // Verify token
        const payload = JWTUtils.verifyPasswordResetToken(token);
        if (!payload) {
            throw new Error('Invalid or expired reset token');
        }
        // Hash the token to compare with database
        const tokenHash = this.hashTokenForStorage(token);
        const { data: tokens, error } = await supabase
            .from('PasswordResetTokens')
            .select('*')
            .eq('TokenHash', tokenHash)
            .eq('IsUsed', false)
            .gt('ExpiresAt', new Date().toISOString());
        if (error || !tokens || tokens.length === 0) {
            throw new Error('Invalid or expired reset token');
        }
        const resetRecord = tokens[0];
        // Validate new password
        const passwordValidation = UserValidators.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.error);
        }
        // Update user password
        const success = await usersService.updateUserPassword(payload.userId, newPassword);
        if (success) {
            // Mark token as used
            await supabase
                .from('PasswordResetTokens')
                .update({ IsUsed: true })
                .eq('TokenId', resetRecord.TokenId);
            // Logout all sessions for security
            await this.logout(payload.userId);
        }
        return success;
    }
    // Get user sessions
    async getUserSessions(userId) {
        const { data, error } = await supabase
            .from('UserSessions')
            .select('SessionId, UserId, DeviceId, ExpiresAt, LastAccessedAt, IsActive')
            .eq('UserId', userId)
            .gt('ExpiresAt', new Date().toISOString())
            .order('LastAccessedAt', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Revoke specific session
    async revokeSession(userId, sessionId) {
        const { error } = await supabase
            .from('UserSessions')
            .update({ IsActive: false })
            .eq('SessionId', sessionId)
            .eq('UserId', userId);
        return !error;
    }
    // Validate access token
    async validateAccessToken(token) {
        return JWTUtils.verifyAccessToken(token);
    }
    // Private helper methods
    async createSession(userId, refreshToken, deviceId) {
        try {
            // Generate session ID
            const sessionId = crypto.randomUUID();
            // Hash the token for storage
            const tokenHash = this.hashTokenForStorage(refreshToken);
            console.log('Creating session:', {
                sessionId,
                userId,
                tokenHashLength: tokenHash.length
            });
            const { error } = await supabase
                .from('UserSessions')
                .insert({
                SessionId: sessionId,
                UserId: userId,
                DeviceId: deviceId || null,
                RefreshTokenHash: tokenHash,
                ExpiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString() // 7 days
            });
            if (error)
                throw error;
            console.log('Session created successfully:', sessionId);
            return sessionId;
        }
        catch (error) {
            console.error('Error creating session:', error.message);
            console.error('Error stack:', error.stack);
            // Generate a temporary session ID if DB fails
            console.warn('Session creation failed, generating temporary session ID');
            return `temp-${crypto.randomUUID()}`;
        }
    }
    async updateSession(sessionId, newRefreshToken) {
        // Hash the new token
        const tokenHash = this.hashTokenForStorage(newRefreshToken);
        await supabase
            .from('UserSessions')
            .update({
            RefreshTokenHash: tokenHash,
            LastAccessedAt: new Date().toISOString(),
            ExpiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
        })
            .eq('SessionId', sessionId);
    }
    async saveEmailVerificationToken(userId, token) {
        await supabase
            .from('EmailVerificationTokens')
            .insert({
            UserId: userId,
            VerificationToken: token,
            ExpiresAt: new Date(Date.now() + 24 * 3600000).toISOString() // 1 day
        });
    }
    // Change password (authenticated user)
    async changePassword(userId, currentPassword, newPassword) {
        // Get user with password hash
        const user = await usersService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isCurrentPasswordValid = await SecurityUtils.comparePassword(currentPassword, user.PasswordHash);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        // Update password
        return await usersService.updateUserPassword(userId, newPassword);
    }
    // Resend verification email
    async resendVerificationEmail(email) {
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            // Don't reveal that user doesn't exist
            return;
        }
        if (user.IsEmailVerified) {
            throw new Error('Email is already verified');
        }
        // Generate new verification token
        const verificationToken = JWTUtils.generateEmailVerificationToken(user.Email);
        // Save new token
        await this.saveEmailVerificationToken(user.UserId, verificationToken);
        // Send email
        await EmailUtils.sendVerificationEmail(user.Email, verificationToken);
    }
    // Get auth user profile
    async getAuthProfile(userId) {
        const user = await usersService.getUserById(userId);
        if (!user) {
            return null;
        }
        const { PasswordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    // Get user ID from token
    async getUserIdFromToken(token) {
        const payload = JWTUtils.verifyAccessToken(token);
        return payload?.userId || null;
    }
    // Debug method to check JWT token structure
    async debugTokenStructure(token) {
        try {
            // Try to verify the token
            const verifiedPayload = JWTUtils.verifyAccessToken(token);
            // Also decode without verification to see the raw structure
            const rawDecoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            return {
                verifiedPayload,
                rawDecoded,
                fields: Object.keys(rawDecoded),
                hasUserId: 'userId' in rawDecoded,
                hasUserid: 'userid' in rawDecoded,
                hasUserID: 'userID' in rawDecoded
            };
        }
        catch (error) {
            console.error('Error debugging token:', error.message);
            return { error: error.message };
        }
    }
    // Debug method to check database schema
    async debugDatabaseSchema() {
        // Not easily doable with Supabase JS client in same way unless we use RPC or just try to select 1
        console.log('Skipping schema debug for Supabase');
    }
    // Test method to verify JWT generation
    async testJwtGeneration(userId) {
        try {
            // Get user
            const user = await usersService.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Generate token payload
            const tokenPayload = this.generateTokenPayload(user);
            // Generate token
            const token = JWTUtils.generateAccessToken(tokenPayload);
            // Decode to verify structure
            const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            return {
                token,
                decoded,
                fieldCheck: {
                    hasUserId: 'userId' in decoded,
                    hasUserid: 'userid' in decoded,
                    userIdValue: decoded.userId || decoded.userid,
                    allFields: Object.keys(decoded)
                }
            };
        }
        catch (error) {
            console.error('Error testing JWT generation:', error.message);
            throw error;
        }
    }
}
// Export singleton instance
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map