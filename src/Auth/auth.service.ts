import sql from 'mssql';
import crypto from 'crypto';
import { getConnectionPool } from '../Database/config.js';
import { JWTUtils, TokenPayload } from '../utils/jwt.js';
import { EmailUtils } from '../utils/email.js';
import { SecurityUtils } from '../utils/security.js';
import { UserValidators } from '../utils/validators.js';
// import { env } from '../Database/envConfig.js';
import { usersService, User } from '../Users/userService.js';

export interface LoginInput {
    identifier: string; // Can be username, email, or phone
    password: string;
}

export interface RegisterInput {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role?: 'TENANT' | 'AGENT' | 'ADMIN';
}

export interface AuthResponse {
    user: Omit<User, 'PasswordHash'>;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface SessionData {
    sessionId: string;
    userId: string;
    deviceId?: string;
    expiresAt: Date;
    lastAccessedAt: Date;
}

export class AuthService {
    private db: sql.ConnectionPool | null = null;

    constructor() {
        // Lazy initialization
    }

    // Lazy initialization of database connection
    private async getDb(): Promise<sql.ConnectionPool> {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }

    // Helper method to hash tokens for storage
    private hashTokenForStorage(token: string): string {
        // Use SHA-256 for token hashing (not bcrypt)
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    // Register new user
    async register(data: RegisterInput): Promise<AuthResponse> {
        try {
            console.log('Starting registration for:', data.username);
            
            // Create user first
            const user = await usersService.createUser(data);
            console.log('User created successfully:', user.UserId);

            // Generate tokens
            const tokenPayload: TokenPayload = {
                userId: user.UserId,
                username: user.Username,
                email: user.Email,
                role: user.Role as 'TENANT' | 'AGENT' | 'ADMIN'
            };

            const tokens = {
                accessToken: JWTUtils.generateAccessToken(tokenPayload),
                refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
            };
            console.log('Tokens generated');

            // Create session
            await this.createSession(user.UserId, tokens.refreshToken);
            console.log('Session created');

            // Send verification email
            try {
                const verificationToken = JWTUtils.generateEmailVerificationToken(user.Email);
                await EmailUtils.sendVerificationEmail(user.Email, verificationToken);
                await this.saveEmailVerificationToken(user.UserId, verificationToken);
                await EmailUtils.sendWelcomeEmail(user.Email, user.Username);
                console.log('Verification email sent');
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Don't fail registration if email fails
            }

            // Remove password hash from response
            const { PasswordHash, ...userWithoutPassword } = user;

            return {
                user: userWithoutPassword,
                tokens
            };

        } catch (error: any) {
            console.error('Registration error:', error.message, error.stack);
            throw error;
        }
    }

    // Login user
    async login(data: LoginInput): Promise<AuthResponse> {
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
        const isPasswordValid = await SecurityUtils.comparePassword(
            data.password,
            fullUser.PasswordHash
        );

        if (!isPasswordValid) {
            // Increment failed login attempts
            await usersService.updateLoginAttempts(fullUser.UserId, false);
            throw new Error('Invalid credentials');
        }

        // Reset login attempts on successful login
        await usersService.updateLoginAttempts(fullUser.UserId, true);

        // Generate tokens
        const tokenPayload: TokenPayload = {
            userId: fullUser.UserId,
            username: fullUser.Username,
            email: fullUser.Email,
            role: fullUser.Role as 'TENANT' | 'AGENT' | 'ADMIN'
        };

        const tokens = {
            accessToken: JWTUtils.generateAccessToken(tokenPayload),
            refreshToken: JWTUtils.generateRefreshToken(tokenPayload)
        };

        // Create or update session
        await this.createSession(fullUser.UserId, tokens.refreshToken);

        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = fullUser;

        return {
            user: userWithoutPassword,
            tokens
        };
    }

    // Refresh token
    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
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

        // Generate new tokens
        const newTokens = {
            accessToken: JWTUtils.generateAccessToken(payload),
            refreshToken: JWTUtils.generateRefreshToken(payload)
        };

        // Update session with new refresh token
        await this.updateSession(sessionResult.recordset[0].SessionId, newTokens.refreshToken);

        return newTokens;
    }

    // Logout
    async logout(userId: string, sessionId?: string): Promise<void> {
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
        } else {
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
    async verifyEmail(token: string): Promise<boolean> {
        const db = await this.getDb();
        
        // Verify token
        const payload = JWTUtils.verifyEmailVerificationToken(token);
        if (!payload) {
            throw new Error('Invalid or expired verification token');
        }

        // Check if token exists in database (store and compare plain tokens for email verification)
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
    async requestPasswordReset(email: string): Promise<void> {
        const db = await this.getDb();
        
        // Check if user exists
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            // Don't reveal that user doesn't exist for security
            return;
        }

        // Generate reset token
        const resetToken = JWTUtils.generatePasswordResetToken(user.UserId);

        // Hash the token for storage (using SHA-256, not bcrypt)
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
    async resetPassword(token: string, newPassword: string): Promise<boolean> {
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
    async getUserSessions(userId: string): Promise<SessionData[]> {
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
    async revokeSession(userId: string, sessionId: string): Promise<boolean> {
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
    async validateAccessToken(token: string): Promise<TokenPayload | null> {
        return JWTUtils.verifyAccessToken(token);
    }

    // Private helper methods
    private async createSession(userId: string, refreshToken: string, deviceId?: string): Promise<void> {
        try {
            const db = await this.getDb();
            
            // Hash the token for storage (using SHA-256, not bcrypt)
            const tokenHash = this.hashTokenForStorage(refreshToken);
            
            console.log('Creating session with token hash length:', tokenHash.length);
            console.log('Token hash sample:', tokenHash.substring(0, 20) + '...');
            
            const query = `
                INSERT INTO UserSessions (UserId, DeviceId, RefreshTokenHash, ExpiresAt)
                VALUES (@userId, @deviceId, @tokenHash, DATEADD(DAY, 7, GETDATE()))
            `;

            await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('deviceId', sql.NVarChar(200), deviceId || null)
                .input('tokenHash', sql.NVarChar(500), tokenHash)
                .query(query);
                
            console.log('Session created successfully for user:', userId);
        } catch (error: any) {
            console.error('Error creating session:', error.message);
            console.error('Error stack:', error.stack);
            
            // For debugging, log the actual error from SQL Server
            if (error.originalError) {
                console.error('SQL Server error:', error.originalError.message);
            }
            
            // Don't throw error for session creation failure - registration should still succeed
            console.warn('Session creation failed, but continuing with registration');
        }
    }

    private async updateSession(sessionId: string, newRefreshToken: string): Promise<void> {
        const db = await this.getDb();
        
        // Hash the new token (using SHA-256, not bcrypt)
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

    private async saveEmailVerificationToken(userId: string, token: string): Promise<void> {
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
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        // Get user with password hash
        const user = await usersService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await SecurityUtils.comparePassword(
            currentPassword,
            user.PasswordHash
        );

        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        return await usersService.updateUserPassword(userId, newPassword);
    }

    // Resend verification email
    async resendVerificationEmail(email: string): Promise<void> {
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
    async getAuthProfile(userId: string): Promise<Omit<User, 'PasswordHash'> | null> {
        const user = await usersService.getUserById(userId);
        if (!user) {
            return null;
        }

        const { PasswordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Debug method to check database schema
    async debugDatabaseSchema(): Promise<void> {
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
            
        } catch (error: any) {
            console.error('Error checking database schema:', error.message);
        }
    }
}

// Export singleton instance
export const authService = new AuthService();