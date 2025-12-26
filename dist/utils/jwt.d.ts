export interface TokenPayload {
    userId: string;
    username: string;
    email: string;
    role: 'TENANT' | 'AGENT' | 'ADMIN';
}
export declare class JWTUtils {
    static generateAccessToken(payload: TokenPayload): string;
    static generateRefreshToken(payload: TokenPayload): string;
    static verifyAccessToken(token: string): TokenPayload | null;
    static verifyRefreshToken(token: string): TokenPayload | null;
    static generateEmailVerificationToken(email: string): string;
    static verifyEmailVerificationToken(token: string): {
        email: string;
    } | null;
    static generatePasswordResetToken(userId: string): string;
    static verifyPasswordResetToken(token: string): {
        userId: string;
    } | null;
}
//# sourceMappingURL=jwt.d.ts.map