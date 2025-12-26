import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { SecurityUtils } from '../utils/security.js';
import { UserValidators, ValidationUtils } from '../utils/validators.js';
import { env } from '../Database/envConfig.js';
export class UsersService {
    db = null;
    constructor() {
        // Don't initialize db in constructor - lazy initialization
    }
    // Lazy initialization of database connection
    async getDb() {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }
    // Create new user
    async createUser(data) {
        const db = await this.getDb();
        // Validate inputs
        const usernameValidation = UserValidators.validateUsername(data.username);
        if (!usernameValidation.isValid) {
            throw new Error(usernameValidation.error);
        }
        const emailValidation = UserValidators.validateEmail(data.email);
        if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
        }
        const phoneValidation = UserValidators.validatePhoneNumber(data.phoneNumber);
        if (!phoneValidation.isValid) {
            throw new Error(phoneValidation.error);
        }
        const passwordValidation = UserValidators.validatePassword(data.password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.error);
        }
        const fullNameValidation = UserValidators.validateFullName(data.fullName);
        if (!fullNameValidation.isValid) {
            throw new Error(fullNameValidation.error);
        }
        // Set default role if not provided
        const role = data.role || 'TENANT';
        const roleValidation = UserValidators.validateRole(role);
        if (!roleValidation.isValid) {
            throw new Error(roleValidation.error);
        }
        // Hash password
        const passwordHash = await SecurityUtils.hashPassword(data.password);
        // Format phone number to standard Kenyan format (254...)
        let formattedPhone = data.phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }
        else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }
        const query = `
            INSERT INTO Users (
                Username, Email, PasswordHash, FullName, PhoneNumber, Role
            ) 
            OUTPUT INSERTED.*
            VALUES (
                @username, @email, @passwordHash, @fullName, @phoneNumber, @role
            )
        `;
        try {
            const result = await db.request()
                .input('username', sql.NVarChar(50), data.username)
                .input('email', sql.NVarChar(150), data.email.toLowerCase())
                .input('passwordHash', sql.NVarChar(500), passwordHash)
                .input('fullName', sql.NVarChar(150), data.fullName)
                .input('phoneNumber', sql.NVarChar(20), formattedPhone)
                .input('role', sql.NVarChar(20), role)
                .query(query);
            return result.recordset[0];
        }
        catch (error) {
            // Handle unique constraint violations
            if (error.message?.includes('UNIQUE') || error.message?.includes('duplicate')) {
                if (error.message?.includes('Username')) {
                    throw new Error('Username already exists');
                }
                if (error.message?.includes('Email')) {
                    throw new Error('Email already exists');
                }
                if (error.message?.includes('PhoneNumber')) {
                    throw new Error('Phone number already exists');
                }
            }
            throw error;
        }
    }
    // Get all users (with pagination)
    async getAllUsers(page = 1, limit = 20) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        const countQuery = 'SELECT COUNT(*) as total FROM Users';
        const dataQuery = `
            SELECT * FROM Users 
            ORDER BY CreatedAt DESC 
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const countResult = await db.request().query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            const dataResult = await db.request()
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(dataQuery);
            return {
                users: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Get user by ID
    async getUserById(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = 'SELECT * FROM Users WHERE UserId = @userId';
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
            return result.recordset[0] || null;
        }
        catch (error) {
            throw error;
        }
    }
    // Get user by username
    async getUserByUsername(username) {
        const db = await this.getDb();
        const query = 'SELECT * FROM Users WHERE Username = @username';
        try {
            const result = await db.request()
                .input('username', sql.NVarChar(50), username)
                .query(query);
            return result.recordset[0] || null;
        }
        catch (error) {
            throw error;
        }
    }
    // Get user by email
    async getUserByEmail(email) {
        const db = await this.getDb();
        const query = 'SELECT * FROM Users WHERE Email = @email';
        try {
            const result = await db.request()
                .input('email', sql.NVarChar(150), email.toLowerCase())
                .query(query);
            return result.recordset[0] || null;
        }
        catch (error) {
            throw error;
        }
    }
    // Get user by phone number
    async getUserByPhoneNumber(phoneNumber) {
        const db = await this.getDb();
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }
        const query = 'SELECT * FROM Users WHERE PhoneNumber = @phoneNumber';
        try {
            const result = await db.request()
                .input('phoneNumber', sql.NVarChar(20), formattedPhone)
                .query(query);
            return result.recordset[0] || null;
        }
        catch (error) {
            throw error;
        }
    }
    // Update user
    // In your userService.js, update the updateUser method:
    async updateUser(userId, data) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        // Build dynamic update query WITHOUT OUTPUT clause
        let updateFields = [];
        const inputs = { userId };
        if (data.fullName) {
            const validation = UserValidators.validateFullName(data.fullName);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            updateFields.push('FullName = @fullName');
            inputs.fullName = data.fullName;
        }
        if (data.phoneNumber) {
            const validation = UserValidators.validatePhoneNumber(data.phoneNumber);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            let formattedPhone = data.phoneNumber.replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            }
            updateFields.push('PhoneNumber = @phoneNumber');
            inputs.phoneNumber = formattedPhone;
        }
        if (data.email) {
            const validation = UserValidators.validateEmail(data.email);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            updateFields.push('Email = @email');
            inputs.email = data.email.toLowerCase();
        }
        if (data.role) {
            const validation = UserValidators.validateRole(data.role);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            updateFields.push('Role = @role');
            inputs.role = data.role;
        }
        if (data.agentStatus) {
            const validation = UserValidators.validateAgentStatus(data.agentStatus);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            updateFields.push('AgentStatus = @agentStatus');
            inputs.agentStatus = data.agentStatus;
        }
        if (data.trustScore !== undefined) {
            updateFields.push('TrustScore = @trustScore');
            inputs.trustScore = data.trustScore;
        }
        if (data.isActive !== undefined) {
            updateFields.push('IsActive = @isActive');
            inputs.isActive = data.isActive;
        }
        if (updateFields.length === 0) {
            throw new Error('No fields to update');
        }
        updateFields.push('UpdatedAt = GETDATE()');
        // Method 1: Update and then select (recommended for triggers)
        const updateQuery = `
        UPDATE Users 
        SET ${updateFields.join(', ')} 
        WHERE UserId = @userId
    `;
        const selectQuery = 'SELECT * FROM Users WHERE UserId = @userId';
        try {
            const request = db.request()
                .input('userId', sql.UniqueIdentifier, userId);
            // Add all inputs dynamically
            Object.keys(inputs).forEach(key => {
                if (key !== 'userId') {
                    const value = inputs[key];
                    if (typeof value === 'string') {
                        request.input(key, sql.NVarChar, value);
                    }
                    else if (typeof value === 'number') {
                        request.input(key, sql.Int, value);
                    }
                    else if (typeof value === 'boolean') {
                        request.input(key, sql.Bit, value);
                    }
                }
            });
            // Execute update
            await request.query(updateQuery);
            // Then select the updated user
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(selectQuery);
            return result.recordset[0] || null;
        }
        catch (error) {
            if (error.message?.includes('UNIQUE') || error.message?.includes('duplicate')) {
                if (error.message?.includes('Email')) {
                    throw new Error('Email already exists');
                }
                if (error.message?.includes('PhoneNumber')) {
                    throw new Error('Phone number already exists');
                }
            }
            throw error;
        }
    }
    // Update user password
    async updateUserPassword(userId, newPassword) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const passwordValidation = UserValidators.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.error);
        }
        const passwordHash = await SecurityUtils.hashPassword(newPassword);
        const query = `
            UPDATE Users 
            SET PasswordHash = @passwordHash, 
                UpdatedAt = GETDATE(),
                LoginAttempts = 0,
                LockedUntil = NULL
            WHERE UserId = @userId
        `;
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('passwordHash', sql.NVarChar(500), passwordHash)
                .query(query);
            return result.rowsAffected[0] > 0;
        }
        catch (error) {
            throw error;
        }
    }
    // Update login attempts
    async updateLoginAttempts(userId, successful = false) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        if (successful) {
            // Reset login attempts and update last login
            const query = `
                UPDATE Users 
                SET LoginAttempts = 0, 
                    LockedUntil = NULL,
                    LastLogin = GETDATE(),
                    UpdatedAt = GETDATE()
                WHERE UserId = @userId
            `;
            await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
        }
        else {
            // Increment login attempts and check for lockout
            const checkQuery = `
                UPDATE Users 
                SET LoginAttempts = LoginAttempts + 1,
                    UpdatedAt = GETDATE()
                OUTPUT INSERTED.LoginAttempts
                WHERE UserId = @userId
            `;
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(checkQuery);
            const loginAttempts = result.recordset[0]?.LoginAttempts || 0;
            if (loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
                // Lock account
                const lockoutMinutes = env.ACCOUNT_LOCKOUT_MINUTES;
                const lockQuery = `
                    UPDATE Users 
                    SET LockedUntil = DATEADD(MINUTE, @lockoutMinutes, GETDATE()),
                        UpdatedAt = GETDATE()
                    WHERE UserId = @userId
                `;
                await db.request()
                    .input('userId', sql.UniqueIdentifier, userId)
                    .input('lockoutMinutes', sql.Int, lockoutMinutes)
                    .query(lockQuery);
            }
        }
    }
    // Verify user email
    async verifyEmail(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            UPDATE Users 
            SET IsEmailVerified = 1, 
                UpdatedAt = GETDATE()
            WHERE UserId = @userId
        `;
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
            return result.rowsAffected[0] > 0;
        }
        catch (error) {
            throw error;
        }
    }
    // Delete user
    async deleteUser(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = 'DELETE FROM Users WHERE UserId = @userId';
        try {
            const result = await db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(query);
            return result.rowsAffected[0] > 0;
        }
        catch (error) {
            throw error;
        }
    }
    // Get user statistics
    async getUserStatistics() {
        const db = await this.getDb();
        const queries = [
            'SELECT COUNT(*) as total FROM Users',
            'SELECT COUNT(*) as active FROM Users WHERE IsActive = 1',
            'SELECT COUNT(*) as tenants FROM Users WHERE Role = \'TENANT\'',
            'SELECT COUNT(*) as agents FROM Users WHERE Role = \'AGENT\'',
            'SELECT COUNT(*) as admins FROM Users WHERE Role = \'ADMIN\'',
            'SELECT COUNT(*) as pendingAgents FROM Users WHERE Role = \'AGENT\' AND AgentStatus = \'PENDING\'',
            'SELECT COUNT(*) as suspendedUsers FROM Users WHERE AgentStatus = \'SUSPENDED\' OR IsActive = 0',
            'SELECT COUNT(*) as verifiedEmails FROM Users WHERE IsEmailVerified = 1'
        ];
        try {
            const results = await Promise.all(queries.map(query => db.request().query(query)));
            return {
                totalUsers: parseInt(results[0].recordset[0].total),
                activeUsers: parseInt(results[1].recordset[0].active),
                tenants: parseInt(results[2].recordset[0].tenants),
                agents: parseInt(results[3].recordset[0].agents),
                admins: parseInt(results[4].recordset[0].admins),
                pendingAgents: parseInt(results[5].recordset[0].pendingAgents),
                suspendedUsers: parseInt(results[6].recordset[0].suspendedUsers),
                verifiedEmails: parseInt(results[7].recordset[0].verifiedEmails)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Search users
    async searchUsers(searchTerm, page = 1, limit = 20) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM Users 
            WHERE Username LIKE @searchTerm 
                OR Email LIKE @searchTerm 
                OR FullName LIKE @searchTerm 
                OR PhoneNumber LIKE @searchTerm
        `;
        const dataQuery = `
            SELECT * 
            FROM Users 
            WHERE Username LIKE @searchTerm 
                OR Email LIKE @searchTerm 
                OR FullName LIKE @searchTerm 
                OR PhoneNumber LIKE @searchTerm
            ORDER BY CreatedAt DESC 
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const searchParam = `%${searchTerm}%`;
            const countResult = await db.request()
                .input('searchTerm', sql.NVarChar, searchParam)
                .query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            const dataResult = await db.request()
                .input('searchTerm', sql.NVarChar, searchParam)
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(dataQuery);
            return {
                users: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
    // Get users by role
    async getUsersByRole(role, page = 1, limit = 20) {
        const db = await this.getDb();
        const offset = (page - 1) * limit;
        const countQuery = 'SELECT COUNT(*) as total FROM Users WHERE Role = @role';
        const dataQuery = `
            SELECT * FROM Users 
            WHERE Role = @role
            ORDER BY CreatedAt DESC 
            OFFSET @offset ROWS 
            FETCH NEXT @limit ROWS ONLY
        `;
        try {
            const countResult = await db.request()
                .input('role', sql.NVarChar(20), role)
                .query(countQuery);
            const total = parseInt(countResult.recordset[0].total);
            const dataResult = await db.request()
                .input('role', sql.NVarChar(20), role)
                .input('offset', sql.Int, offset)
                .input('limit', sql.Int, limit)
                .query(dataQuery);
            return {
                users: dataResult.recordset,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            throw error;
        }
    }
}
// Export singleton instance
export const usersService = new UsersService();
//# sourceMappingURL=userService.js.map