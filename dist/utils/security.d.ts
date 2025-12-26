export declare class SecurityUtils {
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static hashToken(token: string): string;
    static generateRandomToken(length?: number): string;
    static generateOTP(length?: number): string;
}
//# sourceMappingURL=security.d.ts.map