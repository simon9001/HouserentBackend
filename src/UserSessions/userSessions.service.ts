import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
import crypto from 'crypto';

export interface UserSession {
    session_id: string;
    user_id: string;
    device_id?: string;
    refresh_token_hash: string;
    expires_at: string;
    is_active: boolean;
    created_at: string;
    last_accessed_at: string;
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
            .from('users')
            .select('user_id')
            .eq('user_id', data.userId)
            .eq('is_active', true)
            .single();

        if (userError || !user) throw new Error('User not found or inactive');

        const refreshTokenHash = crypto.createHash('sha256').update(data.refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + (data.expiresInDays || 30) * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();

        const { data: newSession, error } = await supabase
            .from('user_sessions')
            .insert({
                user_id: data.userId,
                device_id: data.deviceId || null,
                refresh_token_hash: refreshTokenHash,
                expires_at: expiresAt,
                is_active: true,
                created_at: now,
                last_accessed_at: now
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
            .from('user_sessions')
            .select('*')
            .eq('refresh_token_hash', refreshTokenHash)
            .eq('is_active', true)
            .single();

        if (error || !session) {
            return { isValid: false, message: 'Invalid session' };
        }

        if (new Date(session.expires_at) < new Date()) {
            return { isValid: false, message: 'Session expired' };
        }

        // Update last accessed timestamp
        await this.updateLastAccessed(session.session_id);

        return { isValid: true, session: session as UserSession };
    }

    // Get session by ID
    async getSessionById(sessionId: string): Promise<UserSession | null> {
        if (!ValidationUtils.isValidUUID(sessionId)) throw new Error('Invalid session ID format');

        const { data, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('session_id', sessionId)
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
            .from('user_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .order('last_accessed_at', { ascending: false });

        if (error) throw new Error(error.message);

        return data as UserSession[];
    }

    // Update last accessed timestamp
    async updateLastAccessed(sessionId: string): Promise<void> {
        const { error } = await supabase
            .from('user_sessions')
            .update({ last_accessed_at: new Date().toISOString() })
            .eq('session_id', sessionId);

        if (error) throw new Error(`Error updating session last accessed: ${error.message}`);
    }

    // Revoke session
    async revokeSession(sessionId: string): Promise<boolean> {
        // First, check if session exists and is active
        const { data: session, error: checkError } = await supabase
            .from('user_sessions')
            .select('session_id')
            .eq('session_id', sessionId)
            .eq('is_active', true)
            .single();
    
        if (checkError || !session) return false;
    
        // Then update it
        const { error } = await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .eq('session_id', sessionId)
            .eq('is_active', true);
    
        if (error) throw new Error(error.message);
    
        return true;
    }
    
    // Revoke all sessions for user with count
    async revokeAllUserSessions(userId: string, excludeSessionId?: string): Promise<number> {
        // First, get the count of active sessions
        let countQuery = supabase
            .from('user_sessions')
            .select('session_id')
            .eq('user_id', userId)
            .eq('is_active', true);
    
        if (excludeSessionId) {
            countQuery = countQuery.neq('session_id', excludeSessionId);
        }
    
        const { data: sessions, error: countError } = await countQuery;
    
        if (countError) throw new Error(countError.message);
    
        const sessionIds = sessions?.map(s => s.session_id) || [];
    
        if (sessionIds.length === 0) return 0;
    
        // Update all sessions in batches if there are many
        const { error } = await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .in('session_id', sessionIds);
    
        if (error) throw new Error(error.message);
    
        return sessionIds.length;
    }

    // Clean expired sessions
    async cleanExpiredSessions(): Promise<number> {
        // Delete sessions expired more than 7 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        const { error, count } = await supabase
            .from('user_sessions')
            .delete({ count: 'exact' })
            .lt('expires_at', cutoffDate.toISOString());

        if (error) throw new Error(error.message);

        return count || 0;
    }

    // Get session statistics - Method overload for TypeScript
    async getSessionStatistics(): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }>;
    async getSessionStatistics(userId: string): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }>;
    async getSessionStatistics(userId?: string): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }> {
        const now = new Date().toISOString();

        // Build queries without the problematic 'head' parameter
        let activeCountQuery = supabase
            .from('user_sessions')
            .select('session_id', { count: 'exact' })
            .eq('is_active', true)
            .gt('expires_at', now);

        let expiredCountQuery = supabase
            .from('user_sessions')
            .select('session_id', { count: 'exact' })
            .or(`is_active.eq.false,expires_at.lte.${now}`);

        let recentSessionsQuery = supabase
            .from('user_sessions')
            .select('*')
            .order('last_accessed_at', { ascending: false })
            .limit(10);

        // Apply userId filter if provided
        if (userId) {
            activeCountQuery = activeCountQuery.eq('user_id', userId);
            expiredCountQuery = expiredCountQuery.eq('user_id', userId);
            recentSessionsQuery = recentSessionsQuery.eq('user_id', userId);
        }

        // Execute all queries in parallel
        const [activeRes, expiredRes, recentRes] = await Promise.all([
            activeCountQuery,
            expiredCountQuery,
            recentSessionsQuery
        ]);

        // Check for errors
        if (activeRes.error) throw new Error(`Active sessions query failed: ${activeRes.error.message}`);
        if (expiredRes.error) throw new Error(`Expired sessions query failed: ${expiredRes.error.message}`);
        if (recentRes.error) throw new Error(`Recent sessions query failed: ${recentRes.error.message}`);

        return {
            totalActive: activeRes.count || 0,
            totalExpired: expiredRes.count || 0,
            recentSessions: recentRes.data as UserSession[]
        };
    }
    
    async revokeSessionsByDevice(userId: string, deviceId: string): Promise<number> {
        // First, find all active sessions for this user and device
        const { data: activeSessions, error: findError } = await supabase
            .from('user_sessions')
            .select('session_id')
            .eq('user_id', userId)
            .eq('device_id', deviceId)
            .eq('is_active', true);
    
        if (findError) throw new Error(`Failed to find sessions: ${findError.message}`);
    
        if (!activeSessions || activeSessions.length === 0) {
            return 0;
        }
    
        // Extract session IDs
        const sessionIds = activeSessions.map(session => session.session_id);
    
        // Update all found sessions
        const { error: updateError } = await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .in('session_id', sessionIds);
    
        if (updateError) throw new Error(`Failed to revoke sessions: ${updateError.message}`);
    
        return sessionIds.length;
    }
    
    // Check if user has active session on device
    async hasActiveSessionOnDevice(userId: string, deviceId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('user_sessions')
            .select('session_id')
            .eq('user_id', userId)
            .eq('device_id', deviceId)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .limit(1);

        if (error) throw new Error(error.message);

        return (data?.length || 0) > 0;
    }

    // Get session by device ID
    async getSessionByDevice(userId: string, deviceId: string): Promise<UserSession | null> {
        const { data, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('device_id', deviceId)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as UserSession;
    }

    // Renew session (extend expiry)
    async renewSession(sessionId: string, additionalDays: number = 30): Promise<UserSession | null> {
        const newExpiry = new Date(Date.now() + additionalDays * 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
            .from('user_sessions')
            .update({ 
                expires_at: newExpiry,
                last_accessed_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)
            .eq('is_active', true)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as UserSession;
    }

    // Get session with user details
    async getSessionWithUser(sessionId: string): Promise<{
        session: UserSession;
        user: { user_id: string; username: string; full_name: string; email: string; role: string };
    } | null> {
        const { data, error } = await supabase
            .from('user_sessions')
            .select(`
                *,
                users:user_id (
                    user_id,
                    username,
                    full_name,
                    email,
                    role
                )
            `)
            .eq('session_id', sessionId)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return {
            session: data as UserSession,
            user: data.users
        };
    }

    // Clean up old inactive sessions (maintenance)
    async cleanupOldSessions(daysOld: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { error, count } = await supabase
            .from('user_sessions')
            .delete({ count: 'exact' })
            .lt('updated_at', cutoffDate.toISOString())
            .eq('is_active', false);

        if (error) throw new Error(error.message);

        return count || 0;
    }
}

export const userSessionsService = new UserSessionsService();