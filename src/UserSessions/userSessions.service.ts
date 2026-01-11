import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
import crypto from 'crypto';

export interface UserSession {
    SessionId: string;
    UserId: string;
    DeviceId?: string;
    RefreshTokenHash: string;
    ExpiresAt: string;
    IsActive: boolean;
    CreatedAt: string;
    LastAccessedAt: string;
}

export interface CreateSessionInput {
    userId: string;
    deviceId?: string;
    refreshToken: string;
    expiresInDays?: number;
}

export class UserSessionsService {

    // Create new session
    async createSession(data: CreateSessionInput): Promise<UserSession> {
        // Validate user exists
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('UserId')
            .eq('UserId', data.userId)
            .eq('IsActive', true)
            .single();

        if (userError || !user) throw new Error('User not found or inactive');

        const refreshTokenHash = crypto.createHash('sha256').update(data.refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + (data.expiresInDays || 30) * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        const { data: newSession, error } = await supabase
            .from('UserSessions')
            .insert({
                UserId: data.userId,
                DeviceId: data.deviceId || null,
                RefreshTokenHash: refreshTokenHash,
                ExpiresAt: expiresAt,
                IsActive: true,
                CreatedAt: now,
                LastAccessedAt: now
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return newSession as UserSession;
    }

    // Validate session by refresh token
    async validateSession(refreshToken: string): Promise<{
        isValid: boolean;
        session?: UserSession;
        message?: string;
    }> {
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const { data: session, error } = await supabase
            .from('UserSessions')
            .select('*')
            .eq('RefreshTokenHash', refreshTokenHash)
            .eq('IsActive', true)
            .single();

        if (error || !session) {
            return { isValid: false, message: 'Invalid session' };
        }

        if (new Date(session.ExpiresAt) < new Date()) {
            return { isValid: false, message: 'Session expired' };
        }

        // Update last accessed timestamp
        await this.updateLastAccessed(session.SessionId);

        return { isValid: true, session: session as UserSession };
    }

    // Get session by ID
    async getSessionById(sessionId: string): Promise<UserSession | null> {
        if (!ValidationUtils.isValidUUID(sessionId)) throw new Error('Invalid session ID format');

        const { data, error } = await supabase
            .from('UserSessions')
            .select('*')
            .eq('SessionId', sessionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as UserSession;
    }

    // Get active sessions for user
    async getUserSessions(userId: string): Promise<UserSession[]> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { data, error } = await supabase
            .from('UserSessions')
            .select('*')
            .eq('UserId', userId)
            .eq('IsActive', true)
            .gt('ExpiresAt', new Date().toISOString())
            .order('LastAccessedAt', { ascending: false });

        if (error) throw new Error(error.message);

        return data as UserSession[];
    }

    // Update last accessed timestamp
    async updateLastAccessed(sessionId: string): Promise<void> {
        const { error } = await supabase
            .from('UserSessions')
            .update({ LastAccessedAt: new Date().toISOString() })
            .eq('SessionId', sessionId);

        if (error) console.error('Error updating session last accessed:', error);
    }

    // Revoke session
    async revokeSession(sessionId: string): Promise<boolean> {
        const { error, count } = await supabase
            .from('UserSessions')
            .update({ IsActive: false })
            .eq('SessionId', sessionId)
            .select('SessionId', { count: 'exact' });

        if (error) throw new Error(error.message);

        return (count || 0) > 0;
    }

    // Revoke all sessions for user
    async revokeAllUserSessions(userId: string, excludeSessionId?: string): Promise<number> {
        let query = supabase
            .from('UserSessions')
            .update({ IsActive: false })
            .eq('UserId', userId)
            .eq('IsActive', true);

        if (excludeSessionId) {
            query = query.neq('SessionId', excludeSessionId);
        }

        const { error, count } = await query.select('SessionId', { count: 'exact' });

        if (error) throw new Error(error.message);

        return count || 0;
    }

    // Clean expired sessions
    async cleanExpiredSessions(): Promise<number> {
        // Delete sessions expired more than 7 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        const { error, count } = await supabase
            .from('UserSessions')
            .delete({ count: 'exact' })
            .lt('ExpiresAt', cutoffDate.toISOString());

        if (error) throw new Error(error.message);

        return count || 0;
    }

    // Get session statistics
    async getSessionStatistics(userId?: string): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }> {
        // Parallel queries
        const now = new Date().toISOString();

        // Active count query
        let activeQuery = supabase
            .from('UserSessions')
            .select('*', { count: 'exact', head: true })
            .eq('IsActive', true)
            .gt('ExpiresAt', now);

        // Expired count query (IsActive=false OR ExpiresAt <= now)
        // Correct way in supabase is .or()
        let expiredQuery = supabase
            .from('UserSessions')
            .select('*', { count: 'exact', head: true })
            .or(`IsActive.eq.false,ExpiresAt.lte.${now}`);

        // Recent sessions query
        let recentQuery = supabase
            .from('UserSessions')
            .select('*')
            .order('LastAccessedAt', { ascending: false })
            .limit(10);

        if (userId) {
            activeQuery = activeQuery.eq('UserId', userId);
            // Handling OR with AND filter in Supabase: (A OR B) AND C
            // .or() is top level usually. We need filtering by UserId AND (IsActive=false OR ExpiresAt <= now)
            // syntax: .eq('UserId', userId).or(...)
            expiredQuery = supabase
                .from('UserSessions')
                .select('*', { count: 'exact', head: true })
                .eq('UserId', userId)
                .or(`IsActive.eq.false,ExpiresAt.lte.${now}`);

            recentQuery = recentQuery.eq('UserId', userId);
        }

        const [activeRes, expiredRes, recentRes] = await Promise.all([
            activeQuery,
            expiredQuery,
            recentQuery
        ]);

        if (activeRes.error) throw new Error(activeRes.error.message);
        if (expiredRes.error) throw new Error(expiredRes.error.message);
        if (recentRes.error) throw new Error(recentRes.error.message);

        return {
            totalActive: activeRes.count || 0,
            totalExpired: expiredRes.count || 0,
            recentSessions: recentRes.data as UserSession[]
        };
    }
}

export const userSessionsService = new UserSessionsService();