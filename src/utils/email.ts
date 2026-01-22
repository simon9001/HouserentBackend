import nodemailer from 'nodemailer';
import { env } from '../Database/envConfig.js';

export class EmailUtils {
    // Use environment variables for Brevo credentials
    private static transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: false,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
        headers: {
            'X-Mailin-Custom': 'disable-tracking=1',
            'X-Mailin-Track': 'none',
        }
    });

    // Color scheme - Use optional chaining to avoid TypeScript errors
    private static COLORS = {
        primary: (env as any).EMAIL_PRIMARY_COLOR || '#2563eb',      // Blue for actions
        success: (env as any).EMAIL_SUCCESS_COLOR || '#10b981',      // Green for confirmation
        warning: (env as any).EMAIL_WARNING_COLOR || '#f59e0b',      // Yellow/orange for warnings
        error: (env as any).EMAIL_ERROR_COLOR || '#ef4444',          // Red for errors
        lightBg: '#f8fafc',
        darkText: '#111827',
        mediumText: '#4b5563',
        lightText: '#6b7280',
        border: '#e5e7eb'
    };

    // Verification email - BLUE for verify action
    static async sendVerificationEmail(email: string, token: string, username?: string): Promise<void> {
        const verificationLink = `${env.FRONTEND_URL}/verify-email-success?token=${token}`;

        console.log('📧 Sending verification email to:', email);
        console.log('🔗 Verification link:', verificationLink);

        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME || 'KajaYangu'}" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email - KajaYangu',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 20px; 
                            background-color: #f9fafb;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 12px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                            border: 1px solid ${EmailUtils.COLORS.border};
                        }
                        .header { 
                            background: linear-gradient(135deg, ${EmailUtils.COLORS.primary} 0%, #1d4ed8 100%); 
                            color: white; 
                            padding: 40px; 
                            text-align: center; 
                        }
                        .content { 
                            padding: 40px; 
                            background: ${EmailUtils.COLORS.lightBg}; 
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, ${EmailUtils.COLORS.primary} 0%, #1d4ed8 100%); 
                            color: white !important; 
                            padding: 18px 42px; 
                            text-decoration: none; 
                            border-radius: 10px; 
                            font-weight: 700; 
                            font-size: 18px; 
                            margin: 30px 0; 
                            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); 
                            transition: all 0.3s ease;
                            border: 2px solid white;
                            text-align: center;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                        }
                        .button:hover { 
                            transform: translateY(-3px); 
                            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4); 
                            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 32px; 
                            color: ${EmailUtils.COLORS.lightText}; 
                            font-size: 12px; 
                            padding-top: 24px; 
                            border-top: 1px solid ${EmailUtils.COLORS.border}; 
                        }
                        .info-box { 
                            background: #eff6ff; 
                            color: #1e40af; 
                            padding: 18px; 
                            border-radius: 10px; 
                            border: 2px solid #dbeafe; 
                            margin: 25px 0; 
                            font-size: 15px; 
                            text-align: center; 
                            font-weight: 500;
                        }
                        .security-box { 
                            background: #fef3c7; 
                            color: #92400e; 
                            padding: 18px; 
                            border-radius: 10px; 
                            border: 2px solid #fde68a; 
                            margin: 25px 0; 
                            font-size: 15px; 
                            text-align: center; 
                            font-weight: 500;
                        }
                        .brand-name {
                            color: ${EmailUtils.COLORS.primary};
                            font-weight: 800;
                            font-size: 24px;
                            letter-spacing: 1px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">Welcome to <span class="brand-name">KajaYangu</span>! 🎉</h1>
                            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 18px; font-weight: 400;">Your journey to finding the perfect home starts here</p>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 17px; color: ${EmailUtils.COLORS.mediumText}; margin-bottom: 12px; line-height: 1.8;">
                                Hello${username ? ` <strong style="color: ${EmailUtils.COLORS.darkText}; font-size: 18px;">${username}</strong>` : ''},
                            </p>
                            <p style="font-size: 17px; color: ${EmailUtils.COLORS.mediumText}; margin-bottom: 30px; line-height: 1.8;">
                                Thank you for registering with <strong>KajaYangu</strong>! To complete your registration and access all features, please verify your email address.
                            </p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationLink}" class="button" style="color: white !important; text-decoration: none;">
                                    VERIFY EMAIL ADDRESS
                                </a>
                            </div>
                            
                            <div class="info-box">
                                ⏰ This verification link expires in <strong style="font-size: 16px;">24 HOURS</strong>
                            </div>
                            
                            <div class="security-box">
                                🔒 <strong style="font-size: 16px;">SECURITY NOTICE:</strong> If you didn't create this account, please ignore this email.
                            </div>
                            
                            <div class="footer">
                                <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} <strong>KajaYangu Ltd</strong>. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to KajaYangu! 🎉\n\nHello${username ? ` ${username}` : ''},\n\nThank you for registering with KajaYangu! To complete your registration and access all features, please verify your email address.\n\nClick to verify: ${verificationLink}\n\n⏰ This verification link expires in 24 HOURS\n\n🔒 SECURITY NOTICE: If you didn't create this account, please ignore this email.\n\n© ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Verification email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw error;
        }
    }

    // Password reset email - BLUE for reset action
    static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

        console.log('📧 Sending password reset email to:', email);
        console.log('🔗 Reset link:', resetLink);

        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME || 'KajaYangu Support'}" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Reset Your Password - KajaYangu',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 20px; 
                            background-color: #f9fafb;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 12px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                            border: 1px solid ${EmailUtils.COLORS.border};
                        }
                        .header { 
                            background: linear-gradient(135deg, ${EmailUtils.COLORS.primary} 0%, #1d4ed8 100%); 
                            color: white; 
                            padding: 40px; 
                            text-align: center; 
                        }
                        .content { 
                            padding: 40px; 
                            background: ${EmailUtils.COLORS.lightBg}; 
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, ${EmailUtils.COLORS.primary} 0%, #1d4ed8 100%); 
                            color: white !important; 
                            padding: 18px 42px; 
                            text-decoration: none; 
                            border-radius: 10px; 
                            font-weight: 700; 
                            font-size: 18px; 
                            margin: 30px 0; 
                            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); 
                            transition: all 0.3s ease;
                            border: 2px solid white;
                            text-align: center;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                        }
                        .button:hover { 
                            transform: translateY(-3px); 
                            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4); 
                            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 32px; 
                            color: ${EmailUtils.COLORS.lightText}; 
                            font-size: 12px; 
                            padding-top: 24px; 
                            border-top: 1px solid ${EmailUtils.COLORS.border}; 
                        }
                        .info-box { 
                            background: #eff6ff; 
                            color: #1e40af; 
                            padding: 18px; 
                            border-radius: 10px; 
                            border: 2px solid #dbeafe; 
                            margin: 25px 0; 
                            font-size: 15px; 
                            text-align: center; 
                            font-weight: 500;
                        }
                        .security-box { 
                            background: #fef3c7; 
                            color: #92400e; 
                            padding: 18px; 
                            border-radius: 10px; 
                            border: 2px solid #fde68a; 
                            margin: 25px 0; 
                            font-size: 15px; 
                            text-align: center; 
                            font-weight: 500;
                        }
                        .brand-name {
                            color: ${EmailUtils.COLORS.primary};
                            font-weight: 800;
                            font-size: 24px;
                            letter-spacing: 1px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">Password Reset 🔒</h1>
                            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 18px; font-weight: 400;">Secure your <span class="brand-name">KajaYangu</span> account</p>
                        </div>
                        
                        <div class="content">
                            <p style="font-size: 17px; color: ${EmailUtils.COLORS.mediumText}; margin-bottom: 30px; line-height: 1.8;">
                                Hello,<br><br>
                                We received a request to reset your password for your <strong>KajaYangu</strong> account.
                            </p>
                            
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button" style="color: white !important; text-decoration: none;">
                                    RESET PASSWORD
                                </a>
                            </div>
                            
                            <div class="info-box">
                                ⏰ This link expires in <strong style="font-size: 16px;">1 HOUR</strong>
                            </div>
                            
                            <div class="security-box">
                                ⚠️ <strong style="font-size: 16px;">IMPORTANT:</strong> If you didn't request this password reset, please ignore this email. Your account is secure.
                            </div>
                            
                            <div class="footer">
                                <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>KajaYangu Security Team</strong></p>
                                <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} <strong>KajaYangu Ltd</strong>. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Password Reset - KajaYangu 🔒\n\nHello,\n\nWe received a request to reset your password for your KajaYangu account.\n\nClick to reset: ${resetLink}\n\n⏰ This link expires in 1 HOUR\n\n⚠️ IMPORTANT: If you didn't request this password reset, please ignore this email. Your account is secure.\n\nKajaYangu Security Team\n© ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw error;
        }
    }

    // Welcome email after successful verification - GREEN for success/confirmation
    static async sendWelcomeEmail(email: string, username: string): Promise<void> {
        console.log('📧 Sending welcome email to:', email);

        const mailOptions = {
            from: `"${env.SMTP_FROM_NAME || 'KajaYangu Team'}" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `Welcome to KajaYangu, ${username}! 🏠`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 20px; 
                            background-color: #f9fafb;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 12px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                            border: 1px solid ${EmailUtils.COLORS.border};
                        }
                        .header { 
                            background: linear-gradient(135deg, ${EmailUtils.COLORS.success} 0%, #059669 100%); 
                            color: white; 
                            padding: 40px; 
                            text-align: center; 
                        }
                        .content { 
                            padding: 40px; 
                            background: ${EmailUtils.COLORS.lightBg}; 
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, ${EmailUtils.COLORS.primary} 0%, #1d4ed8 100%); 
                            color: white !important; 
                            padding: 18px 42px; 
                            text-decoration: none; 
                            border-radius: 10px; 
                            font-weight: 700; 
                            font-size: 18px; 
                            margin: 30px 0; 
                            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); 
                            transition: all 0.3s ease;
                            border: 2px solid white;
                            text-align: center;
                            letter-spacing: 0.5px;
                            text-transform: uppercase;
                        }
                        .button:hover { 
                            transform: translateY(-3px); 
                            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4); 
                            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
                        }
                        .footer { 
                            text-align: center; 
                            margin-top: 32px; 
                            color: ${EmailUtils.COLORS.lightText}; 
                            font-size: 12px; 
                            padding-top: 24px; 
                            border-top: 1px solid ${EmailUtils.COLORS.border}; 
                        }
                        .success-box { 
                            background: #d1fae5; 
                            color: #065f46; 
                            padding: 20px; 
                            border-radius: 10px; 
                            border: 2px solid #a7f3d0; 
                            margin: 25px 0; 
                            font-size: 16px; 
                            text-align: center; 
                            font-weight: 600;
                        }
                        .brand-name {
                            color: ${EmailUtils.COLORS.primary};
                            font-weight: 800;
                            font-size: 24px;
                            letter-spacing: 1px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">Welcome aboard, ${username}! 🎉</h1>
                            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 18px; font-weight: 400;">Your <span class="brand-name">KajaYangu</span> account is now active</p>
                        </div>
                        
                        <div class="content">
                            <div class="success-box">
                                ✅ <strong style="font-size: 18px;">EMAIL VERIFIED SUCCESSFULLY!</strong><br>
                                Your account is now fully activated and ready to use.
                            </div>
                            
                            <p style="font-size: 17px; color: ${EmailUtils.COLORS.mediumText}; margin-bottom: 12px; line-height: 1.8;">
                                Hello <strong style="color: ${EmailUtils.COLORS.darkText}; font-size: 18px;">${username}</strong>,
                            </p>
                            <p style="font-size: 17px; color: ${EmailUtils.COLORS.mediumText}; margin-bottom: 30px; line-height: 1.8;">
                                Congratulations! Your email has been verified and your <strong>KajaYangu</strong> account is now ready to use. You can start exploring properties, save favorites, and connect with landlords.
                            </p>
                            
                            <div style="text-align: center;">
                                <a href="${env.FRONTEND_URL}" class="button" style="color: white !important; text-decoration: none;">
                                    START EXPLORING PROPERTIES
                                </a>
                            </div>
                            
                            <div class="footer">
                                <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} <strong>KajaYangu Ltd</strong>. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to KajaYangu, ${username}! 🏠\n\n✅ EMAIL VERIFIED SUCCESSFULLY!\nYour account is now fully activated and ready to use.\n\nCongratulations! Your email has been verified and your KajaYangu account is now ready to use.\n\nStart exploring properties: ${env.FRONTEND_URL}\n\n© ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.`
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
            console.log('📧 Using:', {
                host: env.SMTP_HOST,
                port: env.SMTP_PORT,
                user: env.SMTP_USER?.substring(0, 5) + '...',
                from: env.SMTP_FROM_EMAIL
            });
            return true;
        } catch (error: any) {
            console.error('❌ Email server connection failed:', error.message);
            console.error('Current SMTP config:', {
                host: env.SMTP_HOST,
                port: env.SMTP_PORT,
                user: env.SMTP_USER,
                hasPassword: !!env.SMTP_PASS
            });
            return false;
        }
    }
}