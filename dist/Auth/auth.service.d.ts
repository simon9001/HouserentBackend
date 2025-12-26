import { TokenPayload } from '../utils/jwt.js';
import { User } from '../Users/userService.js';
export interface LoginInput {
    identifier: string;
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
        sessionId?: string;
    };
}
export interface SessionData {
    sessionId: string;
    userId: string;
    deviceId?: string;
    expiresAt: Date;
    lastAccessedAt: Date;
}
export declare class AuthService {
    private db;
    constructor();
    private getDb;
    private hashTokenForStorage;
    private generateTokenPayload;
    register(data: RegisterInput): Promise<AuthResponse>;
    login(data: LoginInput): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
    }>;
    logout(userId: string, sessionId?: string): Promise<void>;
    verifyEmail(token: string): Promise<boolean>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<boolean>;
    getUserSessions(userId: string): Promise<SessionData[]>;
    revokeSession(userId: string, sessionId: string): Promise<boolean>;
    validateAccessToken(token: string): Promise<TokenPayload | null>;
    private createSession;
    private updateSession;
    private saveEmailVerificationToken;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
    resendVerificationEmail(email: string): Promise<void>;
    getAuthProfile(userId: string): Promise<Omit<User, 'PasswordHash'> | null>;
    getUserIdFromToken(token: string): Promise<string | null>;
    debugTokenStructure(token: string): Promise<any>;
    debugDatabaseSchema(): Promise<void>;
    testJwtGeneration(userId: string): Promise<{
        token: string;
        decoded: any;
        fieldCheck: any;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map