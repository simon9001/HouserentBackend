export declare class EmailUtils {
    private static transporter;
    static sendVerificationEmail(email: string, token: string, username?: string): Promise<void>;
    static sendPasswordResetEmail(email: string, token: string): Promise<void>;
    static sendWelcomeEmail(email: string, username: string): Promise<void>;
    static sendSecurityAlert(email: string, alertType: string, details: string, username?: string): Promise<void>;
    static sendPropertyNotification(email: string, username: string, propertyDetails: {
        title: string;
        location: string;
        price: string;
        type: string;
        bedrooms: number;
        bathrooms: number;
        imageUrl?: string;
        propertyId: string;
    }): Promise<void>;
    static sendBookingConfirmation(email: string, username: string, bookingDetails: {
        propertyTitle: string;
        propertyLocation: string;
        bookingDate: string;
        bookingTime: string;
        bookingId: string;
        agentName: string;
        agentPhone: string;
        meetingPoint: string;
    }): Promise<void>;
    static testConnection(): Promise<boolean>;
    static sendTestEmail(toEmail: string): Promise<void>;
}
//# sourceMappingURL=email.d.ts.map