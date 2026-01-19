export declare class EmailUtils {
    private static transporter;
    static sendVerificationEmail(email: string, token: string): Promise<void>;
    static sendPasswordResetEmail(email: string, token: string): Promise<void>;
    static sendWelcomeEmail(email: string, username: string): Promise<void>;
    static sendSecurityAlert(email: string, alertType: string, details: string): Promise<void>;
    static testConnection(): Promise<boolean>;
    static sendTestEmail(toEmail: string): Promise<void>;
}
//# sourceMappingURL=email.d.ts.map