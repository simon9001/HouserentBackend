export declare class EmailService {
    private static COLORS;
    private static sendEmail;
    static sendVerificationEmail(email: string, token: string, username?: string): Promise<void>;
    static sendPasswordResetEmail(email: string, token: string): Promise<void>;
    static sendWelcomeEmail(email: string, username: string): Promise<void>;
    static testConnection(): Promise<boolean>;
    private static getVerificationEmailHtml;
    private static getVerificationEmailText;
    private static getPasswordResetEmailHtml;
    private static getPasswordResetEmailText;
    private static getWelcomeEmailHtml;
    private static getWelcomeEmailText;
}
//# sourceMappingURL=EmailService.d.ts.map