import { supabase } from '../Database/config.js';
import { SecurityUtils } from '../utils/security.js';
import { UserValidators, ValidationUtils } from '../utils/validators.js';
import { env } from '../Database/envConfig.js';

// User interface
export interface User {
    UserId: string;
    Username: string;
    PasswordHash: string;
    FullName: string;
    PhoneNumber: string;
    Email: string;
    Bio?: string;
    Address?: string;
    AvatarUrl?: string;
    Role: 'TENANT' | 'AGENT' | 'ADMIN';
    AgentStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    TrustScore: number;
    IsActive: boolean;
    IsEmailVerified: boolean;
    LoginAttempts: number;
    LastLogin: Date | null;
    LockedUntil: Date | null;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role?: 'TENANT' | 'AGENT' | 'ADMIN';
}

export interface UpdateUserInput {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    bio?: string;
    address?: string;
    avatarUrl?: string;
    role?: 'TENANT' | 'AGENT' | 'ADMIN';
    agentStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    trustScore?: number;
    isActive?: boolean;
}

export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    tenants: number;
    agents: number;
    admins: number;
    pendingAgents: number;
    suspendedUsers: number;
    verifiedEmails: number;
}

export class UsersService {

    // Create new user
    async createUser(data: CreateUserInput): Promise<User> {
        // Validate inputs
        const usernameValidation = UserValidators.validateUsername(data.username);
        if (!usernameValidation.isValid) throw new Error(usernameValidation.error);

        const emailValidation = UserValidators.validateEmail(data.email);
        if (!emailValidation.isValid) throw new Error(emailValidation.error);

        const phoneValidation = UserValidators.validatePhoneNumber(data.phoneNumber);
        if (!phoneValidation.isValid) throw new Error(phoneValidation.error);

        const passwordValidation = UserValidators.validatePassword(data.password);
        if (!passwordValidation.isValid) throw new Error(passwordValidation.error);

        const fullNameValidation = UserValidators.validateFullName(data.fullName);
        if (!fullNameValidation.isValid) throw new Error(fullNameValidation.error);

        // Set default role if not provided
        const role = data.role || 'TENANT';
        const roleValidation = UserValidators.validateRole(role);
        if (!roleValidation.isValid) throw new Error(roleValidation.error);

        // Hash password
        const passwordHash = await SecurityUtils.hashPassword(data.password);

        // Format phone number to standard Kenyan format (254...)
        let formattedPhone = data.phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        const { data: newUser, error } = await supabase
            .from('Users')
            .insert({
                Username: data.username,
                Email: data.email.toLowerCase(),
                PasswordHash: passwordHash,
                FullName: data.fullName,
                PhoneNumber: formattedPhone,
                Role: role
            })
            .select()
            .single();

        if (error) {
            // Handle unique constraint violations
            if (error.message?.includes('violates unique constraint') || error.code === '23505') {
                // Supabase generic unique error, ideally we check specifics if possible or just generic
                // But since we can't easily check which field violated without pre-check or improved error parsing:
                // We will do a generic check or let the error bubble if we can't parse it well.
                // For better UX, checking specifically:
                if (error.details?.includes('Username')) throw new Error('Username already exists');
                if (error.details?.includes('Email')) throw new Error('Email already exists');
                if (error.details?.includes('PhoneNumber')) throw new Error('Phone number already exists');
            }
            throw new Error(error.message);
        }

        return newUser as User;
    }

    // Get all users (with pagination)
    async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
        const offset = (page - 1) * limit;

        const { data, count, error } = await supabase
            .from('Users')
            .select('*', { count: 'exact' })
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        return {
            users: data as User[],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        };
    }

    // Get user by ID
    async getUserById(userId: string): Promise<User | null> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('UserId', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows returned
            throw new Error(error.message);
        }

        return data as User;
    }

    // Get user by username
    async getUserByUsername(username: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('Username', username)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as User;
    }

    // Get user by email
    async getUserByEmail(email: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('Email', email.toLowerCase())
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as User;
    }

    // Get user by phone number
    async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('PhoneNumber', formattedPhone)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as User;
    }

    // Update user
    async updateUser(userId: string, data: UpdateUserInput): Promise<User | null> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const updates: any = {};

        if (data.fullName) {
            const validation = UserValidators.validateFullName(data.fullName);
            if (!validation.isValid) throw new Error(validation.error);
            updates.FullName = data.fullName;
        }

        if (data.phoneNumber) {
            const validation = UserValidators.validatePhoneNumber(data.phoneNumber);
            if (!validation.isValid) throw new Error(validation.error);

            let formattedPhone = data.phoneNumber.replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            }
            updates.PhoneNumber = formattedPhone;
        }

        if (data.email) {
            const validation = UserValidators.validateEmail(data.email);
            if (!validation.isValid) throw new Error(validation.error);
            updates.Email = data.email.toLowerCase();
        }

        if (data.bio) updates.Bio = data.bio;
        if (data.address) updates.Address = data.address;
        if (data.avatarUrl) updates.AvatarUrl = data.avatarUrl;

        if (data.role) {
            const validation = UserValidators.validateRole(data.role);
            if (!validation.isValid) throw new Error(validation.error);
            updates.Role = data.role;
        }

        if (data.agentStatus) {
            const validation = UserValidators.validateAgentStatus(data.agentStatus);
            if (!validation.isValid) throw new Error(validation.error);
            updates.AgentStatus = data.agentStatus;
        }

        if (data.trustScore !== undefined) updates.TrustScore = data.trustScore;
        if (data.isActive !== undefined) updates.IsActive = data.isActive;

        if (Object.keys(updates).length === 0) {
            throw new Error('No fields to update in the request');
        }

        updates.UpdatedAt = new Date().toISOString();

        const { data: updatedUser, error } = await supabase
            .from('Users')
            .update(updates)
            .eq('UserId', userId)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                if (error.details?.includes('Email')) throw new Error('Email already exists');
                if (error.details?.includes('PhoneNumber')) throw new Error('Phone number already exists');
            }
            throw new Error(error.message);
        }

        return updatedUser as User;
    }

    // Update user password
    async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const passwordValidation = UserValidators.validatePassword(newPassword);
        if (!passwordValidation.isValid) throw new Error(passwordValidation.error);

        const passwordHash = await SecurityUtils.hashPassword(newPassword);

        const { error } = await supabase
            .from('Users')
            .update({
                PasswordHash: passwordHash,
                UpdatedAt: new Date().toISOString(),
                LoginAttempts: 0,
                LockedUntil: null
            })
            .eq('UserId', userId);

        if (error) throw new Error(error.message);
        return true;
    }

    // Update login attempts
    async updateLoginAttempts(userId: string, successful: boolean = false): Promise<void> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        if (successful) {
            const { error } = await supabase
                .from('Users')
                .update({
                    LoginAttempts: 0,
                    LockedUntil: null,
                    LastLogin: new Date().toISOString(),
                    UpdatedAt: new Date().toISOString()
                })
                .eq('UserId', userId);

            if (error) throw new Error(error.message);
        } else {
            // We need to fetch current attempts first to increment properly safely, or use rpc if available.
            // For now standard select-update pattern
            const { data: user, error: fetchError } = await supabase
                .from('Users')
                .select('LoginAttempts')
                .eq('UserId', userId)
                .single();

            if (fetchError) throw new Error(fetchError.message);

            const loginAttempts = (user?.LoginAttempts || 0) + 1;
            const updates: any = {
                LoginAttempts: loginAttempts,
                UpdatedAt: new Date().toISOString()
            };

            if (loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
                const lockoutMinutes = env.ACCOUNT_LOCKOUT_MINUTES;
                const lockedUntil = new Date(Date.now() + lockoutMinutes * 60000).toISOString();
                updates.LockedUntil = lockedUntil;
            }

            const { error: updateError } = await supabase
                .from('Users')
                .update(updates)
                .eq('UserId', userId);

            if (updateError) throw new Error(updateError.message);
        }
    }

    // Verify user email
    async verifyEmail(userId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { error } = await supabase
            .from('Users')
            .update({
                IsEmailVerified: true,
                UpdatedAt: new Date().toISOString()
            })
            .eq('UserId', userId);

        if (error) throw new Error(error.message);
        return true;
    }

    // Delete user
    async deleteUser(userId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { error } = await supabase
            .from('Users')
            .delete()
            .eq('UserId', userId);

        if (error) throw new Error(error.message);
        return true;
    }

    // Get user statistics
    async getUserStatistics(): Promise<UserStatistics> {
        // Supabase doesn't support multiple counts in one query easily without RPC.
        // We will run parallel queries.

        try {
            const [
                { count: totalUsers },
                { count: activeUsers },
                { count: tenants },
                { count: agents },
                { count: admins },
                { count: pendingAgents },
                { count: suspendedUsers },
                { count: verifiedEmails }
            ] = await Promise.all([
                supabase.from('Users').select('*', { count: 'exact', head: true }),
                supabase.from('Users').select('*', { count: 'exact', head: true }).eq('IsActive', true),
                supabase.from('Users').select('*', { count: 'exact', head: true }).eq('Role', 'TENANT'),
                supabase.from('Users').select('*', { count: 'exact', head: true }).eq('Role', 'AGENT'),
                supabase.from('Users').select('*', { count: 'exact', head: true }).eq('Role', 'ADMIN'),
                supabase.from('Users').select('*', { count: 'exact', head: true }).eq('Role', 'AGENT').eq('AgentStatus', 'PENDING'),
                supabase.from('Users').select('*', { count: 'exact', head: true }).or('AgentStatus.eq.SUSPENDED,IsActive.eq.false'),
                supabase.from('Users').select('*', { count: 'exact', head: true }).eq('IsEmailVerified', true)
            ]);

            return {
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                tenants: tenants || 0,
                agents: agents || 0,
                admins: admins || 0,
                pendingAgents: pendingAgents || 0,
                suspendedUsers: suspendedUsers || 0,
                verifiedEmails: verifiedEmails || 0
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Search users
    async searchUsers(searchTerm: string, page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
        const offset = (page - 1) * limit;

        const { data, count, error } = await supabase
            .from('Users')
            .select('*', { count: 'exact' })
            .or(`Username.ilike.%${searchTerm}%,Email.ilike.%${searchTerm}%,FullName.ilike.%${searchTerm}%,PhoneNumber.ilike.%${searchTerm}%`)
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        return {
            users: data as User[],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        };
    }

    // Get users by role
    async getUsersByRole(role: 'TENANT' | 'AGENT' | 'ADMIN', page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
        const offset = (page - 1) * limit;

        const { data, count, error } = await supabase
            .from('Users')
            .select('*', { count: 'exact' })
            .eq('Role', role)
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        return {
            users: data as User[],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        };
    }
}

// Export singleton instance
export const usersService = new UsersService();
