export interface UserSession {
    SessionId: string;
    UserId: string;
    DeviceId?: string;
    RefreshTokenHash: string;
    ExpiresAt: Date;
    IsActive: boolean;
    CreatedAt: Date;
    LastAccessedAt: Date;
}
export interface CreateSessionInput {
    userId: string;
    deviceId?: string;
    refreshToken: string;
    expiresInDays?: number;
}
export declare class UserSessionsService {
    private db;
    constructor();
    private getDb;
    createSession(data: CreateSessionInput): Promise<UserSession>;
    validateSession(refreshToken: string): Promise<{
        isValid: boolean;
        session?: UserSession;
        message?: string;
    }>;
    getSessionById(sessionId: string): Promise<UserSession>;
    getUserSessions(userId: string): Promise<UserSession[]>;
    updateLastAccessed(sessionId: string): Promise<void>;
    revokeSession(sessionId: string): Promise<boolean>;
    revokeAllUserSessions(userId: string, excludeSessionId?: string): Promise<number>;
    cleanExpiredSessions(): Promise<number>;
    getSessionStatistics(userId?: string): Promise<{
        totalActive: number;
        totalExpired: number;
        recentSessions: UserSession[];
    }>;
}
export declare const userSessionsService: UserSessionsService;
//# sourceMappingURL=userSessions.service.d.ts.map