// src/services/auth.service.ts
import sql from 'mssql';
import crypto from 'crypto';
import { getConnectionPool } from '../Database/config.js';
import { JWTUtils } from '../utils/jwt.js';
import { EmailUtils } from '../utils/email.js';
import { SecurityUtils } from '../utils/security.js';
import { UserValidators } from '../utils/validators.js';
import { usersService } from '../Users/userService.js';
export class AuthService {
    db = null;
    constructor() {
        // Lazy initialization
    }
    // Lazy initialization of database connection
    async getDb() {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }
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
        const db = await this.getDb();
        // Check if account is locked
        const lockCheckQuery = `
            SELECT UserId, LockedUntil 
            FROM Users 
            WHERE (Username = @identifier OR Email = @identifier OR PhoneNumber = @identifier)
                AND IsActive = 1
        `;
        const lockCheckResult = await db.request()
            .input('identifier', sql.NVarChar(150), data.identifier)
            .query(lockCheckQuery);
        if (lockCheckResult.recordset.length === 0) {
            throw new Error('Invalid credentials');
        }
        const user = lockCheckResult.recordset[0];
        // Check if account is locked
        if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
            throw new Error('Account is temporarily locked. Please try again later.');
        }
        // Get full user with password hash
        const userQuery = `
            SELECT * FROM Users 
            WHERE (Username = @identifier OR Email = @identifier OR PhoneNumber = @identifier)
                AND IsActive = 1
        `;
        const userResult = await db.request()
            .input('identifier', sql.NVarChar(150), data.identifier)
            .query(userQuery);
        const fullUser = userResult.recordset[0];
        if (!fullUser) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        const isPasswordValid = await SecurityUtils.comparePassword(data.password, fullUser.PasswordHash);
        if (!isPasswordValid) {
            // Increment failed login attempts
            await usersService.updateLoginAttempts(fullUser.UserId, false);
            throw new Error('Invalid credentials');
        }
        // Reset login attempts on successful login
        await usersService.updateLoginAttempts(fullUser.UserId, true);
        // Generate consistent token payload
        const tokenPayload = this.generateTokenPayload(fullUser);
        // Generate tokens
        const tokens = {
            accessToken: JWTUtils.generateAccessToken(tokenPayload),
            refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
        };
        // Create session and get sessionId
        const sessionId = await this.createSession(fullUser.UserId, tokens.refreshToken);
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = fullUser;
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
        const db = await this.getDb();
        // Verify refresh token
        const payload = JWTUtils.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid refresh token');
        }
        // Hash the token to compare with database
        const tokenHash = this.hashTokenForStorage(refreshToken);
        const sessionQuery = `
            SELECT * FROM UserSessions 
            WHERE RefreshTokenHash = @tokenHash 
                AND IsActive = 1 
                AND ExpiresAt > GETDATE()
        `;
        const sessionResult = await db.request()
            .input('tokenHash', sql.NVarChar(500), tokenHash)
            .query(sessionQuery);
        if (sessionResult.recordset.length === 0) {
            throw new Error('Invalid or expired session');
        }
        const session = sessionResult.recordset[0];
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
        const db = await this.getDb();
        if (sessionId) {
            // Logout specific session
            const query = `
                UPDATE UserSessions 
                SET IsActive = 0 
                WHERE SessionId = @sessionId AND UserId = @userId
            `;
            await db.request()
                .input('sessionId', sql.UniqueIdentifier, sessionId)
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
        }
        else {
            // Logout all sessions for user
            const query = `
                UPDATE UserSessions 
                SET IsActive = 0 
                WHERE UserId = @userId
            `;
            await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
        }
    }
    // Verify email
    async verifyEmail(token) {
        const db = await this.getDb();
        // Verify token
        const payload = JWTUtils.verifyEmailVerificationToken(token);
        if (!payload) {
            throw new Error('Invalid or expired verification token');
        }
        // Check if token exists in database
        const tokenQuery = `
            SELECT * FROM EmailVerificationTokens 
            WHERE VerificationToken = @token 
                AND IsUsed = 0 
                AND ExpiresAt > GETDATE()
        `;
        const tokenResult = await db.request()
            .input('token', sql.NVarChar(500), token)
            .query(tokenQuery);
        if (tokenResult.recordset.length === 0) {
            throw new Error('Invalid or expired verification token');
        }
        // Mark token as used
        const updateTokenQuery = `
            UPDATE EmailVerificationTokens 
            SET IsUsed = 1 
            WHERE TokenId = @tokenId
        `;
        await db.request()
            .input('tokenId', sql.UniqueIdentifier, tokenResult.recordset[0].TokenId)
            .query(updateTokenQuery);
        // Update user email verification status
        const updateUserQuery = `
            UPDATE Users 
            SET IsEmailVerified = 1 
            WHERE Email = @email
        `;
        const result = await db.request()
            .input('email', sql.NVarChar(150), payload.email)
            .query(updateUserQuery);
        return result.rowsAffected[0] > 0;
    }
    // Request password reset
    async requestPasswordReset(email) {
        const db = await this.getDb();
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
        const query = `
            INSERT INTO PasswordResetTokens (UserId, TokenHash, ExpiresAt)
            VALUES (@userId, @tokenHash, DATEADD(HOUR, 1, GETDATE()))
        `;
        await db.request()
            .input('userId', sql.UniqueIdentifier, user.UserId)
            .input('tokenHash', sql.NVarChar(500), tokenHash)
            .query(query);
        // Send reset email
        await EmailUtils.sendPasswordResetEmail(email, resetToken);
    }
    // Reset password
    async resetPassword(token, newPassword) {
        const db = await this.getDb();
        // Verify token
        const payload = JWTUtils.verifyPasswordResetToken(token);
        if (!payload) {
            throw new Error('Invalid or expired reset token');
        }
        // Hash the token to compare with database
        const tokenHash = this.hashTokenForStorage(token);
        const tokenQuery = `
            SELECT * FROM PasswordResetTokens 
            WHERE TokenHash = @tokenHash 
                AND IsUsed = 0 
                AND ExpiresAt > GETDATE()
        `;
        const tokenResult = await db.request()
            .input('tokenHash', sql.NVarChar(500), tokenHash)
            .query(tokenQuery);
        if (tokenResult.recordset.length === 0) {
            throw new Error('Invalid or expired reset token');
        }
        // Validate new password
        const passwordValidation = UserValidators.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.error);
        }
        // Update user password
        const success = await usersService.updateUserPassword(payload.userId, newPassword);
        if (success) {
            // Mark token as used
            const updateTokenQuery = `
                UPDATE PasswordResetTokens 
                SET IsUsed = 1 
                WHERE TokenId = @tokenId
            `;
            await db.request()
                .input('tokenId', sql.UniqueIdentifier, tokenResult.recordset[0].TokenId)
                .query(updateTokenQuery);
            // Logout all sessions for security
            await this.logout(payload.userId);
        }
        return success;
    }
    // Get user sessions
    async getUserSessions(userId) {
        const db = await this.getDb();
        const query = `
            SELECT 
                SessionId,
                UserId,
                DeviceId,
                ExpiresAt,
                LastAccessedAt,
                IsActive
            FROM UserSessions 
            WHERE UserId = @userId 
                AND ExpiresAt > GETDATE()
            ORDER BY LastAccessedAt DESC
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.recordset;
    }
    // Revoke specific session
    async revokeSession(userId, sessionId) {
        const db = await this.getDb();
        const query = `
            UPDATE UserSessions 
            SET IsActive = 0 
            WHERE SessionId = @sessionId AND UserId = @userId
        `;
        const result = await db.request()
            .input('sessionId', sql.UniqueIdentifier, sessionId)
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Validate access token
    async validateAccessToken(token) {
        return JWTUtils.verifyAccessToken(token);
    }
    // Private helper methods
    async createSession(userId, refreshToken, deviceId) {
        try {
            const db = await this.getDb();
            // Generate session ID
            const sessionId = crypto.randomUUID();
            // Hash the token for storage
            const tokenHash = this.hashTokenForStorage(refreshToken);
            console.log('Creating session:', {
                sessionId,
                userId,
                tokenHashLength: tokenHash.length
            });
            const query = `
                INSERT INTO UserSessions (SessionId, UserId, DeviceId, RefreshTokenHash, ExpiresAt)
                VALUES (@sessionId, @userId, @deviceId, @tokenHash, DATEADD(DAY, 7, GETDATE()))
            `;
            await db.request()
                .input('sessionId', sql.UniqueIdentifier, sessionId)
                .input('userId', sql.UniqueIdentifier, userId)
                .input('deviceId', sql.NVarChar(200), deviceId || null)
                .input('tokenHash', sql.NVarChar(500), tokenHash)
                .query(query);
            console.log('Session created successfully:', sessionId);
            return sessionId;
        }
        catch (error) {
            console.error('Error creating session:', error.message);
            console.error('Error stack:', error.stack);
            // For debugging, log the actual error from SQL Server
            if (error.originalError) {
                console.error('SQL Server error:', error.originalError.message);
            }
            // Generate a temporary session ID if DB fails
            console.warn('Session creation failed, generating temporary session ID');
            return `temp-${crypto.randomUUID()}`;
        }
    }
    async updateSession(sessionId, newRefreshToken) {
        const db = await this.getDb();
        // Hash the new token
        const tokenHash = this.hashTokenForStorage(newRefreshToken);
        const query = `
            UPDATE UserSessions 
            SET RefreshTokenHash = @tokenHash, 
                LastAccessedAt = GETDATE(),
                ExpiresAt = DATEADD(DAY, 7, GETDATE())
            WHERE SessionId = @sessionId
        `;
        await db.request()
            .input('sessionId', sql.UniqueIdentifier, sessionId)
            .input('tokenHash', sql.NVarChar(500), tokenHash)
            .query(query);
    }
    async saveEmailVerificationToken(userId, token) {
        const db = await this.getDb();
        const query = `
            INSERT INTO EmailVerificationTokens (UserId, VerificationToken, ExpiresAt)
            VALUES (@userId, @token, DATEADD(DAY, 1, GETDATE()))
        `;
        await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('token', sql.NVarChar(500), token)
            .query(query);
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
        const db = await this.getDb();
        try {
            // Check UserSessions table structure
            const sessionColumnsQuery = `
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'UserSessions'
                ORDER BY ORDINAL_POSITION
            `;
            const sessionColumns = await db.request().query(sessionColumnsQuery);
            console.log('UserSessions table columns:', sessionColumns.recordset);
            // Check PasswordResetTokens table structure
            const tokenColumnsQuery = `
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'PasswordResetTokens'
                ORDER BY ORDINAL_POSITION
            `;
            const tokenColumns = await db.request().query(tokenColumnsQuery);
            console.log('PasswordResetTokens table columns:', tokenColumns.recordset);
        }
        catch (error) {
            console.error('Error checking database schema:', error.message);
        }
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