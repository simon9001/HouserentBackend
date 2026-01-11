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
export declare class UserSessionsService {
    createSession(data: CreateSessionInput): Promise<UserSession>;
    validateSession(refreshToken: string): Promise<{
        isValid: boolean;
        session?: UserSession;
        message?: string;
    }>;
    getSessionById(sessionId: string): Promise<UserSession | null>;
    getUserSessions(userId: string): Promise<UserSession[]>;
    updateLastAccessed(sessionId: string): Promise<void>;
    revokeSession(sessionId: string): Promise<boolean>;
    revokeAllUserSessions(userId: string, excludeSessionId?: string): Promise<number>;
    cleanExpiredSessions(): Promise<number>;
    getSessionStatistics(): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }>;
    getSessionStatistics(userId: string): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }>;
    revokeSessionsByDevice(userId: string, deviceId: string): Promise<number>;
    hasActiveSessionOnDevice(userId: string, deviceId: string): Promise<boolean>;
    getSessionByDevice(userId: string, deviceId: string): Promise<UserSession | null>;
    renewSession(sessionId: string, additionalDays?: number): Promise<UserSession | null>;
    getSessionWithUser(sessionId: string): Promise<{
        session: UserSession;
        user: {
            user_id: string;
            username: string;
            full_name: string;
            email: string;
            role: string;
        };
    } | null>;
    cleanupOldSessions(daysOld?: number): Promise<number>;
}
export declare const userSessionsService: UserSessionsService;
//# sourceMappingURL=userSessions.service.d.ts.map