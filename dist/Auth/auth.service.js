// // src/services/auth.service.ts
// import crypto from 'node:crypto';
// import { supabase } from '../Database/config.js';
// import { JWTUtils, TokenPayload } from '../utils/jwt.js';
// import { EmailUtils } from '../utils/email.js';
// import { SecurityUtils } from '../utils/security.js';
// import { UserValidators } from '../utils/validators.js';
// import { usersService, User } from '../Users/userService.js';
// export interface LoginInput {
//     identifier: string; // Can be username, email, or phone
//     password: string;
// }
// export interface RegisterInput {
//     username: string;
//     email: string;
//     password: string;
//     fullName: string;
//     phoneNumber: string;
//     role?: 'TENANT' | 'AGENT' | 'ADMIN';
// }
// export interface AuthResponse {
//     user: Omit<User, 'PasswordHash'>;
//     tokens: {
//         accessToken: string;
//         refreshToken: string;
//         sessionId?: string;
//     };
// }
// export interface SessionData {
//     sessionId: string;
//     userId: string;
//     deviceId?: string;
//     expiresAt: Date;
//     lastAccessedAt: Date;
// }
// export interface VerificationResult {
//     success: boolean;
//     email?: string;
//     message?: string;
// }
// export class AuthService {
//     // Helper method to hash tokens for storage
//     private hashTokenForStorage(token: string): string {
//         return crypto.createHash('sha256').update(token).digest('hex');
//     }
//     // Generate consistent token payload
//     private generateTokenPayload(user: User): TokenPayload {
//         return {
//             userId: user.UserId,  // Ensure consistent field name
//             username: user.Username,
//             email: user.Email,
//             role: user.Role as 'TENANT' | 'AGENT' | 'ADMIN'
//         };
//     }
//     // Register new user
//     async register(data: RegisterInput): Promise<AuthResponse> {
//         try {
//             console.log('Starting registration for:', data.username);
//             // Create user first
//             const user = await usersService.createUser(data);
//             console.log('User created successfully:', user.UserId);
//             // Generate consistent token payload
//             const tokenPayload = this.generateTokenPayload(user);
//             // Generate tokens
//             const tokens = {
//                 accessToken: JWTUtils.generateAccessToken(tokenPayload),
//                 refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
//             };
//             console.log('Tokens generated');
//             // Create session and get sessionId
//             const sessionId = await this.createSession(user.UserId, tokens.refreshToken);
//             console.log('Session created with ID:', sessionId);
//             // Send verification email
//             try {
//                 const verificationToken = JWTUtils.generateEmailVerificationToken(user.Email);
//                 await EmailUtils.sendVerificationEmail(user.Email, verificationToken);
//                 await this.saveEmailVerificationToken(user.UserId, verificationToken);
//                 await EmailUtils.sendWelcomeEmail(user.Email, user.Username);
//                 console.log('Verification email sent');
//             } catch (emailError) {
//                 console.error('Failed to send verification email:', emailError);
//                 // Don't fail registration if email fails
//             }
//             // Remove password hash from response
//             const { PasswordHash, ...userWithoutPassword } = user;
//             return {
//                 user: userWithoutPassword,
//                 tokens: {
//                     ...tokens,
//                     sessionId
//                 }
//             };
//         } catch (error: any) {
//             console.error('Registration error:', error.message, error.stack);
//             throw error;
//         }
//     }
//     // Login user - UPDATED with email verification check
//     async login(data: LoginInput): Promise<AuthResponse> {
//         // Check if account is locked
//         const { data: users, error } = await supabase
//             .from('Users')
//             .select('UserId, LockedUntil, PasswordHash, Username, Email, Role, PhoneNumber, FullName, Bio, Address, AvatarUrl, AgentStatus, TrustScore, IsActive, IsEmailVerified, LoginAttempts, LastLogin, CreatedAt, UpdatedAt')
//             .eq('IsActive', true)
//             .or(`Username.eq.${data.identifier},Email.eq.${data.identifier},PhoneNumber.eq.${data.identifier}`);
//         if (error || !users || users.length === 0) {
//             throw new Error('Invalid credentials');
//         }
//         const user = users[0] as User;
//         // Check if account is locked
//         if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
//             throw new Error('Account is temporarily locked. Please try again later.');
//         }
//         // Check if email is verified - IMPORTANT SECURITY CHECK
//         if (!user.IsEmailVerified) {
//             // Log the attempt
//             console.log('❌ Login attempt with unverified email:', user.Email);
//             throw new Error('Please verify your email before logging in. Check your email inbox or click the resend verification link.');
//         }
//         // Verify password
//         const isPasswordValid = await SecurityUtils.comparePassword(
//             data.password,
//             user.PasswordHash
//         );
//         if (!isPasswordValid) {
//             // Increment failed login attempts
//             await usersService.updateLoginAttempts(user.UserId, false);
//             throw new Error('Invalid credentials');
//         }
//         // Reset login attempts on successful login
//         await usersService.updateLoginAttempts(user.UserId, true);
//         // Generate consistent token payload
//         const tokenPayload = this.generateTokenPayload(user);
//         // Generate tokens
//         const tokens = {
//             accessToken: JWTUtils.generateAccessToken(tokenPayload),
//             refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
//         };
//         // Create session and get sessionId
//         const sessionId = await this.createSession(user.UserId, tokens.refreshToken);
//         // Remove password hash from response
//         const { PasswordHash, ...userWithoutPassword } = user;
//         return {
//             user: userWithoutPassword,
//             tokens: {
//                 ...tokens,
//                 sessionId
//             }
//         };
//     }
//     // Refresh token - UPDATED with email verification check
//     async refreshToken(refreshToken: string): Promise<{
//         accessToken: string;
//         refreshToken: string;
//         sessionId: string;
//     }> {
//         // Verify refresh token
//         const payload = JWTUtils.verifyRefreshToken(refreshToken);
//         if (!payload) {
//             throw new Error('Invalid refresh token');
//         }
//         // Check if user email is verified when refreshing token
//         // This prevents bypassing email verification through token refresh
//         const user = await usersService.getUserById(payload.userId);
//         if (user && !user.IsEmailVerified) {
//             console.log('❌ Token refresh attempt for unverified user:', user.Email);
//             throw new Error('Please verify your email to access your account');
//         }
//         // Hash the token to compare with database
//         const tokenHash = this.hashTokenForStorage(refreshToken);
//         const { data: sessions, error } = await supabase
//             .from('user_sessions') // snake_case table
//             .select('*')
//             .eq('refresh_token_hash', tokenHash) // snake_case column
//             .eq('is_active', true) // snake_case column
//             .gt('expires_at', new Date().toISOString()); // snake_case column
//         if (error || !sessions || sessions.length === 0) {
//             throw new Error('Invalid or expired session');
//         }
//         const session = sessions[0];
//         // Generate new tokens
//         const newTokenPayload: TokenPayload = {
//             userId: payload.userId,  // Use consistent field name
//             username: payload.username,
//             email: payload.email,
//             role: payload.role
//         };
//         const newTokens = {
//             accessToken: JWTUtils.generateAccessToken(newTokenPayload),
//             refreshToken: JWTUtils.generateRefreshToken(newTokenPayload)
//         };
//         // Update session with new refresh token
//         await this.updateSession(session.session_id, newTokens.refreshToken);
//         return {
//             ...newTokens,
//             sessionId: session.session_id
//         };
//     }
//     // Logout
//     async logout(userId: string, sessionId?: string): Promise<void> {
//         let query = supabase.from('user_sessions').update({ is_active: false }).eq('user_id', userId);
//         if (sessionId) {
//             query = query.eq('session_id', sessionId);
//         }
//         await query;
//     }
//     // Verify email - UPDATED to return VerificationResult
//     async verifyEmail(token: string): Promise<VerificationResult> {
//         try {
//             // Verify token
//             const payload = JWTUtils.verifyEmailVerificationToken(token);
//             if (!payload) {
//                 throw new Error('Invalid or expired verification token');
//             }
//             // Check if token exists in database
//             const { data: tokens, error } = await supabase
//                 .from('email_verification_tokens') // snake_case
//                 .select('*')
//                 .eq('verification_token', token) // snake_case
//                 .eq('is_used', false) // snake_case
//                 .gt('expires_at', new Date().toISOString());
//             if (error || !tokens || tokens.length === 0) {
//                 throw new Error('Invalid or expired verification token');
//             }
//             const verificationRecord = tokens[0];
//             // Mark token as used
//             await supabase
//                 .from('email_verification_tokens')
//                 .update({ is_used: true })
//                 .eq('token_id', verificationRecord.token_id);
//             // Update user email verification status
//             const { error: userError } = await supabase
//                 .from('Users') // PascalCase Users
//                 .update({ IsEmailVerified: true }) // PascalCase
//                 .eq('Email', payload.email); // PascalCase
//             if (userError) {
//                 throw new Error('Failed to update user verification status');
//             }
//             console.log('✅ Email verified successfully for:', payload.email);
//             return {
//                 success: true,
//                 email: payload.email,
//                 message: 'Email verified successfully'
//             };
//         } catch (error: any) {
//             console.error('🔥 Error verifying email:', error.message);
//             return {
//                 success: false,
//                 message: error.message || 'Email verification failed'
//             };
//         }
//     }
//     // Request password reset
//     async requestPasswordReset(email: string): Promise<void> {
//         // Check if user exists
//         const user = await usersService.getUserByEmail(email);
//         if (!user) {
//             // Don't reveal that user doesn't exist for security
//             return;
//         }
//         // Generate reset token with consistent userId
//         const resetToken = JWTUtils.generatePasswordResetToken(user.UserId);
//         // Hash the token for storage
//         const tokenHash = this.hashTokenForStorage(resetToken);
//         // Save token to database
//         const { error } = await supabase
//             .from('password_reset_tokens') // snake_case
//             .insert({
//                 user_id: user.UserId, // snake_case
//                 token_hash: tokenHash, // snake_case
//                 expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
//             });
//         if (error) {
//             console.error("Error saving password reset token", error);
//             return;
//         }
//         // Send reset email
//         await EmailUtils.sendPasswordResetEmail(email, resetToken);
//     }
//     // Reset password - UPDATED to return VerificationResult
//     async resetPassword(token: string, newPassword: string): Promise<VerificationResult> {
//         try {
//             // Verify token
//             const payload = JWTUtils.verifyPasswordResetToken(token);
//             if (!payload) {
//                 throw new Error('Invalid or expired reset token');
//             }
//             // Hash the token to compare with database
//             const tokenHash = this.hashTokenForStorage(token);
//             const { data: tokens, error } = await supabase
//                 .from('password_reset_tokens') // snake_case
//                 .select('*')
//                 .eq('token_hash', tokenHash)
//                 .eq('is_used', false)
//                 .gt('expires_at', new Date().toISOString());
//             if (error || !tokens || tokens.length === 0) {
//                 throw new Error('Invalid or expired reset token');
//             }
//             const resetRecord = tokens[0];
//             // Validate new password
//             const passwordValidation = UserValidators.validatePassword(newPassword);
//             if (!passwordValidation.isValid) {
//                 throw new Error(passwordValidation.error);
//             }
//             // Add password length validation
//             if (newPassword.length > 100) {
//                 throw new Error('Password must be 100 characters or less');
//             }
//             // Update user password
//             const success = await usersService.updateUserPassword(payload.userId, newPassword);
//             if (!success) {
//                 throw new Error('Failed to update password');
//             }
//             // Mark token as used
//             await supabase
//                 .from('password_reset_tokens')
//                 .update({ is_used: true })
//                 .eq('token_id', resetRecord.token_id);
//             // Logout all sessions for security
//             await this.logout(payload.userId);
//             // Get user email for response
//             const user = await usersService.getUserById(payload.userId);
//             const userEmail = user?.Email || '';
//             console.log('✅ Password reset successfully for:', userEmail);
//             return {
//                 success: true,
//                 email: userEmail,
//                 message: 'Password reset successfully'
//             };
//         } catch (error: any) {
//             console.error('🔥 Error resetting password:', error.message);
//             return {
//                 success: false,
//                 message: error.message || 'Password reset failed'
//             };
//         }
//     }
//     // Get user sessions
//     async getUserSessions(userId: string): Promise<SessionData[]> {
//         const { data, error } = await supabase
//             .from('user_sessions') // snake_case
//             .select('session_id, user_id, device_id, expires_at, last_accessed_at')
//             .eq('user_id', userId)
//             .gt('expires_at', new Date().toISOString())
//             .order('last_accessed_at', { ascending: false });
//         if (error) throw new Error(error.message);
//         return (data || []).map((s: any) => ({
//             sessionId: s.session_id,
//             userId: s.user_id,
//             deviceId: s.device_id,
//             expiresAt: s.expires_at,
//             lastAccessedAt: s.last_accessed_at
//         }));
//     }
//     // Revoke specific session
//     async revokeSession(userId: string, sessionId: string): Promise<boolean> {
//         const { error } = await supabase
//             .from('user_sessions')
//             .update({ is_active: false })
//             .eq('session_id', sessionId)
//             .eq('user_id', userId);
//         return !error;
//     }
//     // Validate access token
//     async validateAccessToken(token: string): Promise<TokenPayload | null> {
//         return JWTUtils.verifyAccessToken(token);
//     }
//     // Private helper methods
//     private async createSession(userId: string, refreshToken: string, deviceId?: string): Promise<string> {
//         try {
//             // Generate session ID
//             const sessionId = crypto.randomUUID();
//             // Hash the token for storage
//             const tokenHash = this.hashTokenForStorage(refreshToken);
//             console.log('Creating session:', {
//                 sessionId,
//                 userId,
//                 tokenHashLength: tokenHash.length
//             });
//             const { error } = await supabase
//                 .from('user_sessions') // snake_case
//                 .insert({
//                     session_id: sessionId,
//                     user_id: userId,
//                     device_id: deviceId || null,
//                     refresh_token_hash: tokenHash,
//                     expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString() // 7 days
//                 });
//             if (error) throw error;
//             console.log('Session created successfully:', sessionId);
//             return sessionId;
//         } catch (error: any) {
//             console.error('Error creating session:', error.message);
//             console.error('Error stack:', error.stack);
//             // Generate a temporary session ID if DB fails
//             console.warn('Session creation failed, generating temporary session ID');
//             return `temp-${crypto.randomUUID()}`;
//         }
//     }
//     private async updateSession(sessionId: string, newRefreshToken: string): Promise<void> {
//         // Hash the new token
//         const tokenHash = this.hashTokenForStorage(newRefreshToken);
//         await supabase
//             .from('user_sessions')
//             .update({
//                 refresh_token_hash: tokenHash,
//                 last_accessed_at: new Date().toISOString(),
//                 expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
//             })
//             .eq('session_id', sessionId);
//     }
//     private async saveEmailVerificationToken(userId: string, token: string): Promise<void> {
//         await supabase
//             .from('email_verification_tokens') // snake_case
//             .insert({
//                 user_id: userId,
//                 verification_token: token,
//                 expires_at: new Date(Date.now() + 24 * 3600000).toISOString() // 1 day
//             });
//     }
//     // Change password (authenticated user) - UPDATED with password length validation
//     async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
//         // Get user with password hash
//         const user = await usersService.getUserById(userId);
//         if (!user) {
//             throw new Error('User not found');
//         }
//         // Verify current password
//         const isCurrentPasswordValid = await SecurityUtils.comparePassword(
//             currentPassword,
//             user.PasswordHash
//         );
//         if (!isCurrentPasswordValid) {
//             throw new Error('Current password is incorrect');
//         }
//         // Add password length validation
//         if (newPassword.length > 100) {
//             throw new Error('New password must be 100 characters or less');
//         }
//         // Update password
//         return await usersService.updateUserPassword(userId, newPassword);
//     }
//     // Resend verification email - UPDATED to return VerificationResult
//     async resendVerificationEmail(email: string): Promise<VerificationResult> {
//         try {
//             const user = await usersService.getUserByEmail(email);
//             if (!user) {
//                 // Don't reveal that user doesn't exist
//                 return {
//                     success: true,
//                     message: 'If an account exists with this email and is not verified, a new verification email has been sent'
//                 };
//             }
//             if (user.IsEmailVerified) {
//                 return {
//                     success: false,
//                     message: 'Email is already verified'
//                 };
//             }
//             // Generate new verification token
//             const verificationToken = JWTUtils.generateEmailVerificationToken(user.Email);
//             // Save new token
//             await this.saveEmailVerificationToken(user.UserId, verificationToken);
//             // Send email
//             await EmailUtils.sendVerificationEmail(user.Email, verificationToken);
//             console.log('✅ Verification email resent to:', user.Email);
//             return {
//                 success: true,
//                 email: user.Email,
//                 message: 'Verification email sent successfully'
//             };
//         } catch (error: any) {
//             console.error('🔥 Error resending verification email:', error.message);
//             return {
//                 success: true,
//                 message: 'If an account exists with this email and is not verified, a new verification email has been sent'
//             };
//         }
//     }
//     // Get auth user profile
//     async getAuthProfile(userId: string): Promise<Omit<User, 'PasswordHash'> | null> {
//         const user = await usersService.getUserById(userId);
//         if (!user) {
//             return null;
//         }
//         const { PasswordHash, ...userWithoutPassword } = user;
//         return userWithoutPassword;
//     }
//     // Get user ID from token
//     async getUserIdFromToken(token: string): Promise<string | null> {
//         const payload = JWTUtils.verifyAccessToken(token);
//         return payload?.userId || null;
//     }
//     // Debug method to check JWT token structure
//     async debugTokenStructure(token: string): Promise<any> {
//         try {
//             // Try to verify the token
//             const verifiedPayload = JWTUtils.verifyAccessToken(token);
//             // Also decode without verification to see the raw structure
//             const rawDecoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
//             return {
//                 verifiedPayload,
//                 rawDecoded,
//                 fields: Object.keys(rawDecoded),
//                 hasUserId: 'userId' in rawDecoded,
//                 hasUserid: 'userid' in rawDecoded,
//                 hasUserID: 'userID' in rawDecoded
//             };
//         } catch (error: any) {
//             console.error('Error debugging token:', error.message);
//             return { error: error.message };
//         }
//     }
//     // Debug method to check database schema
//     async debugDatabaseSchema(): Promise<void> {
//         // Not easily doable with Supabase JS client in same way unless we use RPC or just try to select 1
//         console.log('Skipping schema debug for Supabase');
//     }
//     // Test method to verify JWT generation
//     async testJwtGeneration(userId: string): Promise<{
//         token: string;
//         decoded: any;
//         fieldCheck: any;
//     }> {
//         try {
//             // Get user
//             const user = await usersService.getUserById(userId);
//             if (!user) {
//                 throw new Error('User not found');
//             }
//             // Generate token payload
//             const tokenPayload = this.generateTokenPayload(user);
//             // Generate token
//             const token = JWTUtils.generateAccessToken(tokenPayload);
//             // Decode to verify structure
//             const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
//             return {
//                 token,
//                 decoded,
//                 fieldCheck: {
//                     hasUserId: 'userId' in decoded,
//                     hasUserid: 'userid' in decoded,
//                     userIdValue: decoded.userId || decoded.userid,
//                     allFields: Object.keys(decoded)
//                 }
//             };
//         } catch (error: any) {
//             console.error('Error testing JWT generation:', error.message);
//             throw error;
//         }
//     }
//     // NEW: Get user by email for verification flows
//     async getUserByEmail(email: string): Promise<Pick<User, 'UserId' | 'Email' | 'Username' | 'IsEmailVerified'> | null> {
//         try {
//             const { data, error } = await supabase
//                 .from('Users')
//                 .select('UserId, Email, Username, IsEmailVerified')
//                 .eq('Email', email)
//                 .eq('IsActive', true)
//                 .single();
//             if (error || !data) {
//                 return null;
//             }
//             return {
//                 UserId: data.UserId,
//                 Email: data.Email,
//                 Username: data.Username,
//                 IsEmailVerified: data.IsEmailVerified
//             };
//         } catch (error) {
//             console.error('Error getting user by email:', error);
//             return null;
//         }
//     }
// }
// // Export singleton instance
// export const authService = new AuthService();
// src/services/auth.service.ts
import crypto from 'node:crypto';
import { supabase } from '../Database/config.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailService } from '../utils/EmailService.js';
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
                await EmailService.sendVerificationEmail(user.Email, verificationToken, user.Username);
                await this.saveEmailVerificationToken(user.UserId, verificationToken);
                await EmailService.sendWelcomeEmail(user.Email, user.Username);
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
    // Login user - UPDATED with email verification check
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
        // Check if email is verified - IMPORTANT SECURITY CHECK
        if (!user.IsEmailVerified) {
            // Log the attempt
            console.log('❌ Login attempt with unverified email:', user.Email);
            throw new Error('Please verify your email before logging in. Check your email inbox or click the resend verification link.');
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
    // Refresh token - UPDATED with email verification check
    async refreshToken(refreshToken) {
        // Verify refresh token
        const payload = JWTUtils.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid refresh token');
        }
        // Check if user email is verified when refreshing token
        // This prevents bypassing email verification through token refresh
        const user = await usersService.getUserById(payload.userId);
        if (user && !user.IsEmailVerified) {
            console.log('❌ Token refresh attempt for unverified user:', user.Email);
            throw new Error('Please verify your email to access your account');
        }
        // Hash the token to compare with database
        const tokenHash = this.hashTokenForStorage(refreshToken);
        const { data: sessions, error } = await supabase
            .from('user_sessions') // snake_case table
            .select('*')
            .eq('refresh_token_hash', tokenHash) // snake_case column
            .eq('is_active', true) // snake_case column
            .gt('expires_at', new Date().toISOString()); // snake_case column
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
        await this.updateSession(session.session_id, newTokens.refreshToken);
        return {
            ...newTokens,
            sessionId: session.session_id
        };
    }
    // Logout
    async logout(userId, sessionId) {
        let query = supabase.from('user_sessions').update({ is_active: false }).eq('user_id', userId);
        if (sessionId) {
            query = query.eq('session_id', sessionId);
        }
        await query;
    }
    // Verify email - UPDATED to return VerificationResult
    async verifyEmail(token) {
        try {
            // Verify token
            const payload = JWTUtils.verifyEmailVerificationToken(token);
            if (!payload) {
                throw new Error('Invalid or expired verification token');
            }
            // Check if token exists in database
            const { data: tokens, error } = await supabase
                .from('email_verification_tokens') // snake_case
                .select('*')
                .eq('verification_token', token) // snake_case
                .eq('is_used', false) // snake_case
                .gt('expires_at', new Date().toISOString());
            if (error || !tokens || tokens.length === 0) {
                throw new Error('Invalid or expired verification token');
            }
            const verificationRecord = tokens[0];
            // Mark token as used
            await supabase
                .from('email_verification_tokens')
                .update({ is_used: true })
                .eq('token_id', verificationRecord.token_id);
            // Update user email verification status
            const { error: userError } = await supabase
                .from('Users') // PascalCase Users
                .update({ IsEmailVerified: true }) // PascalCase
                .eq('Email', payload.email); // PascalCase
            if (userError) {
                throw new Error('Failed to update user verification status');
            }
            console.log('✅ Email verified successfully for:', payload.email);
            return {
                success: true,
                email: payload.email,
                message: 'Email verified successfully'
            };
        }
        catch (error) {
            console.error('🔥 Error verifying email:', error.message);
            return {
                success: false,
                message: error.message || 'Email verification failed'
            };
        }
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
            .from('password_reset_tokens') // snake_case
            .insert({
            user_id: user.UserId, // snake_case
            token_hash: tokenHash, // snake_case
            expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
        });
        if (error) {
            console.error("Error saving password reset token", error);
            return;
        }
        // Send reset email
        await EmailService.sendPasswordResetEmail(email, resetToken);
    }
    // Reset password - UPDATED to return VerificationResult
    async resetPassword(token, newPassword) {
        try {
            // Verify token
            const payload = JWTUtils.verifyPasswordResetToken(token);
            if (!payload) {
                throw new Error('Invalid or expired reset token');
            }
            // Hash the token to compare with database
            const tokenHash = this.hashTokenForStorage(token);
            const { data: tokens, error } = await supabase
                .from('password_reset_tokens') // snake_case
                .select('*')
                .eq('token_hash', tokenHash)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString());
            if (error || !tokens || tokens.length === 0) {
                throw new Error('Invalid or expired reset token');
            }
            const resetRecord = tokens[0];
            // Validate new password
            const passwordValidation = UserValidators.validatePassword(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.error);
            }
            // Add password length validation
            if (newPassword.length > 100) {
                throw new Error('Password must be 100 characters or less');
            }
            // Update user password
            const success = await usersService.updateUserPassword(payload.userId, newPassword);
            if (!success) {
                throw new Error('Failed to update password');
            }
            // Mark token as used
            await supabase
                .from('password_reset_tokens')
                .update({ is_used: true })
                .eq('token_id', resetRecord.token_id);
            // Logout all sessions for security
            await this.logout(payload.userId);
            // Get user email for response
            const user = await usersService.getUserById(payload.userId);
            const userEmail = user?.Email || '';
            console.log('✅ Password reset successfully for:', userEmail);
            return {
                success: true,
                email: userEmail,
                message: 'Password reset successfully'
            };
        }
        catch (error) {
            console.error('🔥 Error resetting password:', error.message);
            return {
                success: false,
                message: error.message || 'Password reset failed'
            };
        }
    }
    // Get user sessions
    async getUserSessions(userId) {
        const { data, error } = await supabase
            .from('user_sessions') // snake_case
            .select('session_id, user_id, device_id, expires_at, last_accessed_at')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('last_accessed_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data || []).map((s) => ({
            sessionId: s.session_id,
            userId: s.user_id,
            deviceId: s.device_id,
            expiresAt: s.expires_at,
            lastAccessedAt: s.last_accessed_at
        }));
    }
    // Revoke specific session
    async revokeSession(userId, sessionId) {
        const { error } = await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .eq('session_id', sessionId)
            .eq('user_id', userId);
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
                .from('user_sessions') // snake_case
                .insert({
                session_id: sessionId,
                user_id: userId,
                device_id: deviceId || null,
                refresh_token_hash: tokenHash,
                expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString() // 7 days
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
            .from('user_sessions')
            .update({
            refresh_token_hash: tokenHash,
            last_accessed_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
        })
            .eq('session_id', sessionId);
    }
    async saveEmailVerificationToken(userId, token) {
        await supabase
            .from('email_verification_tokens') // snake_case
            .insert({
            user_id: userId,
            verification_token: token,
            expires_at: new Date(Date.now() + 24 * 3600000).toISOString() // 1 day
        });
    }
    // Change password (authenticated user) - UPDATED with password length validation
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
        // Add password length validation
        if (newPassword.length > 100) {
            throw new Error('New password must be 100 characters or less');
        }
        // Update password
        return await usersService.updateUserPassword(userId, newPassword);
    }
    // Resend verification email - UPDATED to return VerificationResult
    async resendVerificationEmail(email) {
        try {
            const user = await usersService.getUserByEmail(email);
            if (!user) {
                // Don't reveal that user doesn't exist
                return {
                    success: true,
                    message: 'If an account exists with this email and is not verified, a new verification email has been sent'
                };
            }
            if (user.IsEmailVerified) {
                return {
                    success: false,
                    message: 'Email is already verified'
                };
            }
            // Generate new verification token
            const verificationToken = JWTUtils.generateEmailVerificationToken(user.Email);
            // Save new token
            await this.saveEmailVerificationToken(user.UserId, verificationToken);
            // Send email
            await EmailService.sendVerificationEmail(user.Email, verificationToken, user.Username);
            console.log('✅ Verification email resent to:', user.Email);
            return {
                success: true,
                email: user.Email,
                message: 'Verification email sent successfully'
            };
        }
        catch (error) {
            console.error('🔥 Error resending verification email:', error.message);
            return {
                success: true,
                message: 'If an account exists with this email and is not verified, a new verification email has been sent'
            };
        }
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
    // NEW: Get user by email for verification flows
    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('Users')
                .select('UserId, Email, Username, IsEmailVerified')
                .eq('Email', email)
                .eq('IsActive', true)
                .single();
            if (error || !data) {
                return null;
            }
            return {
                UserId: data.UserId,
                Email: data.Email,
                Username: data.Username,
                IsEmailVerified: data.IsEmailVerified
            };
        }
        catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    }
}
// Export singleton instance
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map