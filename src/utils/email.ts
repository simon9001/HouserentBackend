import nodemailer from 'nodemailer';
import { env } from '../Database/envConfig.js';

export class EmailUtils {
    private static transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

    // Send email verification
    static async sendVerificationEmail(email: string, token: string): Promise<void> {
        // Use FRONTEND_URL which should be http://localhost:5174
        const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
        
        console.log('📧 Sending verification email to:', email);
        console.log('🔗 Verification link:', verificationLink);
        
        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email - KajaYangu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to KajaYangu!</h2>
                    <p>Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    <p><strong>Important:</strong> This link will only work if you have the frontend application running.</p>
                    <p>Or you can manually verify by:</p>
                    <ol>
                        <li>Open your KajaYangu app</li>
                        <li>Go to the verification page</li>
                        <li>Use this token: <code style="background: #f5f5f5; padding: 5px; border-radius: 3px;">${token}</code></li>
                    </ol>
                    <p>This token will expire in 24 hours.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">
                        If you didn't create an account with KajaYangu, please ignore this email.
                    </p>
                </div>
            `,
            // Add text version for email clients that don't support HTML
            text: `Welcome to KajaYangu!\n\nPlease verify your email by clicking: ${verificationLink}\n\nOr use this token in the app: ${token}\n\nThis token expires in 24 hours.\n\nIf you didn't create an account, please ignore this email.`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Verification email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw error;
        }
    }

    // Send password reset email
    static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
        
        console.log('📧 Sending password reset email to:', email);
        console.log('🔗 Reset link:', resetLink);
        
        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Reset Your Password - KajaYangu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #2196F3; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p><strong>Important:</strong> This link will only work if you have the frontend application running.</p>
                    <p>Or you can manually reset by:</p>
                    <ol>
                        <li>Open your KajaYangu app</li>
                        <li>Go to the reset password page</li>
                        <li>Use this token: <code style="background: #f5f5f5; padding: 5px; border-radius: 3px;">${token}</code></li>
                    </ol>
                    <p>This token will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">
                        For security reasons, please don't share this email with anyone.
                    </p>
                </div>
            `,
            text: `Password Reset Request\n\nClick to reset your password: ${resetLink}\n\nOr use this token in the app: ${token}\n\nThis token expires in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw error;
        }
    }

    // Send welcome email
    static async sendWelcomeEmail(email: string, username: string): Promise<void> {
        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Welcome to KajaYangu! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to KajaYangu, ${username}!</h2>
                    <p>We're excited to have you join our community. Here's what you can do:</p>
                    <ul>
                        <li>Browse available properties</li>
                        <li>Schedule property visits</li>
                        <li>Connect with agents</li>
                        <li>Save your favorite properties</li>
                        <li>Leave reviews for properties and agents</li>
                    </ul>
                    <p><strong>Next Step:</strong> Please verify your email to unlock all features.</p>
                    <p>Start exploring now: <a href="${env.FRONTEND_URL}">${env.FRONTEND_URL}</a></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">
                        If you have any questions, feel free to contact our support team at ${env.SMTP_FROM_EMAIL}
                    </p>
                </div>
            `,
            text: `Welcome to KajaYangu, ${username}!\n\nWe're excited to have you join our community.\n\nStart exploring now: ${env.FRONTEND_URL}\n\nIf you have questions, contact: ${env.SMTP_FROM_EMAIL}`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            // Don't throw error for welcome email - it's not critical
        }
    }

    // Test email connection
    static async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ Email server connection verified');
            
            // Try sending a test email
            const testMailOptions = {
                from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
                to: env.SMTP_FROM_EMAIL, // Send to yourself
                subject: 'Test Email - KajaYangu',
                text: 'This is a test email from KajaYangu backend.',
                html: '<p>This is a test email from KajaYangu backend.</p>'
            };
            
            await this.transporter.sendMail(testMailOptions);
            console.log('✅ Test email sent successfully');
            
            return true;
        } catch (error: any) {
            console.error('❌ Email server connection failed:', error.message);
            if (error.code) {
                console.error('Error code:', error.code);
            }
            return false;
        }
    }

    // Send test email to verify functionality
    static async sendTestEmail(toEmail: string): Promise<void> {
        const testToken = 'test-token-' + Date.now();
        const testLink = `${env.FRONTEND_URL}/test?token=${testToken}`;
        
        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
            to: toEmail,
            subject: 'Test Email Configuration - KajaYangu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Test Email - KajaYangu</h2>
                    <p>If you're receiving this email, your email configuration is working correctly!</p>
                    <p><strong>Configuration Details:</strong></p>
                    <ul>
                        <li>SMTP Host: ${env.SMTP_HOST}</li>
                        <li>SMTP Port: ${env.SMTP_PORT}</li>
                        <li>From: ${env.SMTP_FROM_EMAIL}</li>
                        <li>Frontend URL: ${env.FRONTEND_URL}</li>
                    </ul>
                    <p>Test link: <a href="${testLink}">${testLink}</a></p>
                    <p>Test token: <code>${testToken}</code></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">
                        This is a test email sent at ${new Date().toISOString()}
                    </p>
                </div>
            `,
            text: `Test Email - KajaYangu\n\nYour email configuration is working!\n\nTest link: ${testLink}\nTest token: ${testToken}`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Test email sent to:', toEmail);
        } catch (error) {
            console.error('❌ Failed to send test email:', error);
            throw error;
        }
    }
}