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
        const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;

        console.log('📧 Sending verification email to:', email);
        console.log('🔗 Verification link:', verificationLink);

        const mailOptions = {
            from: `"KajaYangu" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email - KajaYangu',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email - KajaYangu</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8f9fa;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 10px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                            padding: 30px; 
                            text-align: center; 
                            color: white;
                        }
                        .header h1 { 
                            margin: 0; 
                            font-size: 28px; 
                            font-weight: 600;
                        }
                        .content { 
                            padding: 40px; 
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                            color: white !important; 
                            padding: 14px 32px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold; 
                            font-size: 16px; 
                            margin: 20px 0; 
                            text-align: center;
                        }
                        .footer { 
                            background-color: #f1f1f1; 
                            padding: 20px; 
                            text-align: center; 
                            font-size: 12px; 
                            color: #666; 
                            border-top: 1px solid #ddd;
                        }
                        .logo { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #4CAF50; 
                            margin-bottom: 20px;
                        }
                        .token-box { 
                            background-color: #f8f9fa; 
                            border: 1px solid #ddd; 
                            padding: 15px; 
                            border-radius: 5px; 
                            font-family: monospace; 
                            word-break: break-all; 
                            margin: 20px 0;
                        }
                        @media only screen and (max-width: 600px) {
                            .content { padding: 20px; }
                            .header { padding: 20px; }
                            .button { width: 100%; box-sizing: border-box; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to KajaYangu! 🎉</h1>
                            <p>Your journey to finding the perfect home starts here</p>
                        </div>
                        
                        <div class="content">
                            <div class="logo">KajaYangu</div>
                            
                            <h2>Email Verification Required</h2>
                            <p>Hello,</p>
                            <p>Thank you for creating an account with KajaYangu! To complete your registration and access all features, please verify your email address by clicking the button below:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationLink}" class="button">Verify Email Address</a>
                            </div>
                            
                            <p>This verification link will expire in <strong>24 hours</strong>.</p>
                            
                            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                            <div class="token-box">
                                ${verificationLink}
                            </div>
                            
                            <p>Or enter this verification code in the app:</p>
                            <div class="token-box">
                                ${token}
                            </div>
                            
                            <p><strong>Need help?</strong> If you didn't create this account, please ignore this email. If you're having trouble verifying your email, contact our support team.</p>
                        </div>
                        
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} KajaYangu. All rights reserved.</p>
                            <p>This email was sent to ${email}. If you believe you received this email in error, please contact us.</p>
                            <p><a href="${env.FRONTEND_URL}/privacy" style="color: #4CAF50;">Privacy Policy</a> | <a href="${env.FRONTEND_URL}/terms" style="color: #4CAF50;">Terms of Service</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to KajaYangu!\n\nPlease verify your email address to complete your registration.\n\nVerification Link: ${verificationLink}\n\nOr use this verification code in the app: ${token}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with KajaYangu, please ignore this email.\n\nThank you,\nThe KajaYangu Team`
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
            from: `"KajaYangu Support" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Reset Your Password - KajaYangu',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset - KajaYangu</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8f9fa;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 10px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); 
                            padding: 30px; 
                            text-align: center; 
                            color: white;
                        }
                        .header h1 { 
                            margin: 0; 
                            font-size: 28px; 
                            font-weight: 600;
                        }
                        .content { 
                            padding: 40px; 
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); 
                            color: white !important; 
                            padding: 14px 32px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold; 
                            font-size: 16px; 
                            margin: 20px 0; 
                            text-align: center;
                        }
                        .footer { 
                            background-color: #f1f1f1; 
                            padding: 20px; 
                            text-align: center; 
                            font-size: 12px; 
                            color: #666; 
                            border-top: 1px solid #ddd;
                        }
                        .logo { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #2196F3; 
                            margin-bottom: 20px;
                        }
                        .token-box { 
                            background-color: #f8f9fa; 
                            border: 1px solid #ddd; 
                            padding: 15px; 
                            border-radius: 5px; 
                            font-family: monospace; 
                            word-break: break-all; 
                            margin: 20px 0;
                        }
                        .security-note {
                            background-color: #fff8e1;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        @media only screen and (max-width: 600px) {
                            .content { padding: 20px; }
                            .header { padding: 20px; }
                            .button { width: 100%; box-sizing: border-box; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request 🔒</h1>
                            <p>Secure your KajaYangu account</p>
                        </div>
                        
                        <div class="content">
                            <div class="logo">KajaYangu</div>
                            
                            <h2>Reset Your Password</h2>
                            <p>Hello,</p>
                            <p>We received a request to reset your KajaYangu account password. To proceed with resetting your password, click the button below:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button">Reset My Password</a>
                            </div>
                            
                            <p>This password reset link will expire in <strong>1 hour</strong> for security reasons.</p>
                            
                            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                            <div class="token-box">
                                ${resetLink}
                            </div>
                            
                            <div class="security-note">
                                <p><strong>⚠️ Security Notice:</strong></p>
                                <p>If you didn't request this password reset, please ignore this email. Your account is secure, and no changes have been made.</p>
                                <p>For added security, we recommend enabling two-factor authentication in your account settings.</p>
                            </div>
                            
                            <p><strong>Need help?</strong> If you're having trouble resetting your password, contact our support team immediately.</p>
                        </div>
                        
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} KajaYangu. All rights reserved.</p>
                            <p>This security email was sent to ${email}. If you believe this is an error, please contact our security team.</p>
                            <p><a href="${env.FRONTEND_URL}/security" style="color: #2196F3;">Security Center</a> | <a href="${env.FRONTEND_URL}/support" style="color: #2196F3;">Contact Support</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Password Reset Request - KajaYangu\n\nWe received a request to reset your password. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email. Your account is secure and no changes have been made.\n\nFor security reasons, please don't share this email with anyone.\n\nNeed help? Contact our support team.\n\nThank you,\nKajaYangu Security Team`
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
            from: `"KajaYangu Team" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `Welcome to KajaYangu, ${username}! 🏠`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to KajaYangu!</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8f9fa;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 10px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                            padding: 40px; 
                            text-align: center; 
                            color: white;
                        }
                        .header h1 { 
                            margin: 0; 
                            font-size: 32px; 
                            font-weight: 700;
                        }
                        .content { 
                            padding: 40px; 
                        }
                        .cta-button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                            color: white !important; 
                            padding: 14px 32px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-weight: bold; 
                            font-size: 16px; 
                            margin: 20px 0; 
                            text-align: center;
                        }
                        .feature-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin: 30px 0;
                        }
                        .feature-item {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                            border: 1px solid #e9ecef;
                        }
                        .feature-icon {
                            font-size: 32px;
                            margin-bottom: 10px;
                            color: #4CAF50;
                        }
                        .footer { 
                            background-color: #f1f1f1; 
                            padding: 30px; 
                            text-align: center; 
                            font-size: 12px; 
                            color: #666; 
                            border-top: 1px solid #ddd;
                        }
                        @media only screen and (max-width: 600px) {
                            .content { padding: 20px; }
                            .header { padding: 20px; }
                            .cta-button { width: 100%; box-sizing: border-box; }
                            .feature-grid { grid-template-columns: 1fr; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to KajaYangu! 🎉</h1>
                            <p>Your journey to finding the perfect home starts here</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello, ${username}!</h2>
                            <p>We're thrilled to welcome you to KajaYangu - Kenya's premier platform for finding and managing rental properties. Your account has been successfully created and is ready to use!</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${env.FRONTEND_URL}" class="cta-button">Start Exploring Properties</a>
                            </div>
                            
                            <h3>What You Can Do:</h3>
                            <div class="feature-grid">
                                <div class="feature-item">
                                    <div class="feature-icon">🔍</div>
                                    <h4>Find Properties</h4>
                                    <p>Browse thousands of verified properties across Kenya</p>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">📅</div>
                                    <h4>Schedule Visits</h4>
                                    <p>Book property viewings with ease</p>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">🤝</div>
                                    <h4>Connect with Agents</h4>
                                    <p>Chat directly with verified property agents</p>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">⭐</div>
                                    <h4>Save Favorites</h4>
                                    <p>Save properties you love for later review</p>
                                </div>
                            </div>
                            
                            <h3>Get Started:</h3>
                            <ol>
                                <li><strong>Complete your profile</strong> to get personalized property recommendations</li>
                                <li><strong>Set your preferences</strong> for location, budget, and property type</li>
                                <li><strong>Browse properties</strong> or use our smart search filters</li>
                                <li><strong>Save your favorites</strong> and schedule viewings</li>
                            </ol>
                            
                            <p><strong>Need help?</strong> Check out our <a href="${env.FRONTEND_URL}/help" style="color: #4CAF50;">Help Center</a> or contact our support team.</p>
                        </div>
                        
                        <div class="footer">
                            <p style="font-size: 14px; margin-bottom: 10px;">Happy house hunting! 🏡</p>
                            <p>&copy; ${new Date().getFullYear()} KajaYangu. All rights reserved.</p>
                            <p>This email was sent to ${email} as part of your KajaYangu account.</p>
                            <p>
                                <a href="${env.FRONTEND_URL}/privacy" style="color: #4CAF50; margin: 0 10px;">Privacy Policy</a> | 
                                <a href="${env.FRONTEND_URL}/terms" style="color: #4CAF50; margin: 0 10px;">Terms of Service</a> | 
                                <a href="${env.FRONTEND_URL}/unsubscribe" style="color: #4CAF50; margin: 0 10px;">Unsubscribe</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to KajaYangu, ${username}! 🏠\n\nWe're thrilled to welcome you to Kenya's premier platform for finding and managing rental properties.\n\nYour account is now active and ready to use!\n\nGet started:\n1. Complete your profile for personalized recommendations\n2. Set your preferences (location, budget, property type)\n3. Browse thousands of verified properties\n4. Save favorites and schedule viewings\n5. Connect with verified agents\n\nStart exploring now: ${env.FRONTEND_URL}\n\nNeed help? Visit our Help Center or contact our support team.\n\nHappy house hunting!\n\nThe KajaYangu Team`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            // Don't throw error for welcome email - it's not critical
        }
    }

    // Send account security alert
    static async sendSecurityAlert(email: string, alertType: string, details: string): Promise<void> {
        const mailOptions = {
            from: `"KajaYangu Security" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `Security Alert: ${alertType} - KajaYangu`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Security Alert - KajaYangu</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8f9fa;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 10px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); 
                            padding: 30px; 
                            text-align: center; 
                            color: white;
                        }
                        .header h1 { 
                            margin: 0; 
                            font-size: 28px; 
                            font-weight: 600;
                        }
                        .content { 
                            padding: 40px; 
                        }
                        .alert-box {
                            background-color: #ffebee;
                            border: 1px solid #ffcdd2;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .footer { 
                            background-color: #f1f1f1; 
                            padding: 20px; 
                            text-align: center; 
                            font-size: 12px; 
                            color: #666; 
                            border-top: 1px solid #ddd;
                        }
                        .action-button {
                            display: inline-block;
                            background-color: #f44336;
                            color: white !important;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            margin: 10px 5px;
                        }
                        @media only screen and (max-width: 600px) {
                            .content { padding: 20px; }
                            .header { padding: 20px; }
                            .action-button { width: 100%; box-sizing: border-box; margin: 5px 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔒 Security Alert</h1>
                            <p>Important notice regarding your KajaYangu account</p>
                        </div>
                        
                        <div class="content">
                            <h2>Security Alert: ${alertType}</h2>
                            <p>Hello,</p>
                            <p>We detected unusual activity on your KajaYangu account. Here are the details:</p>
                            
                            <div class="alert-box">
                                <p><strong>Alert Type:</strong> ${alertType}</p>
                                <p><strong>Details:</strong> ${details}</p>
                                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p><strong>Recommended Actions:</strong></p>
                            <ul>
                                <li>If you recognize this activity, no action is needed</li>
                                <li>If you don't recognize this activity, secure your account immediately</li>
                                <li>Change your password if you suspect unauthorized access</li>
                                <li>Enable two-factor authentication for added security</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${env.FRONTEND_URL}/security" class="action-button">Review Security Settings</a>
                                <a href="${env.FRONTEND_URL}/support" class="action-button" style="background-color: #666;">Contact Support</a>
                            </div>
                            
                            <p><strong>Stay Secure:</strong> Always use strong, unique passwords and never share your login credentials.</p>
                        </div>
                        
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} KajaYangu. All rights reserved.</p>
                            <p>This is an automated security email. Please do not reply to this message.</p>
                            <p><a href="${env.FRONTEND_URL}/security" style="color: #f44336;">Security Center</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `SECURITY ALERT - KajaYangu\n\nAlert Type: ${alertType}\n\nDetails: ${details}\n\nTime: ${new Date().toLocaleString()}\n\nWe detected unusual activity on your KajaYangu account.\n\nIf you recognize this activity, no action is needed.\n\nIf you don't recognize this activity:\n1. Change your password immediately\n2. Enable two-factor authentication\n3. Review your account activity\n4. Contact support if needed\n\nReview security settings: ${env.FRONTEND_URL}/security\nContact support: ${env.FRONTEND_URL}/support\n\nThis is an automated security alert. Please do not reply.\n\nKajaYangu Security Team`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Security alert email sent to:', email);
        } catch (error) {
            console.error('❌ Failed to send security alert email:', error);
            throw error;
        }
    }

    // Test email connection
    static async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ Email server connection verified');

            // Try sending a test email
            const testMailOptions = {
                from: `"KajaYangu" <${env.SMTP_FROM_EMAIL}>`,
                to: env.SMTP_FROM_EMAIL,
                subject: '✅ Email Configuration Test - KajaYangu',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #4CAF50;">✅ Email Configuration Test Successful!</h2>
                        <p>Your KajaYangu email configuration is working correctly.</p>
                        <p><strong>Test Details:</strong></p>
                        <ul>
                            <li>SMTP Host: ${env.SMTP_HOST}</li>
                            <li>SMTP Port: ${env.SMTP_PORT}</li>
                            <li>From Address: ${env.SMTP_FROM_EMAIL}</li>
                            <li>Frontend URL: ${env.FRONTEND_URL}</li>
                            <li>Test Time: ${new Date().toISOString()}</li>
                        </ul>
                        <p>All email functionalities (verification, password reset, notifications) are now ready to use.</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">
                            This is an automated test email from KajaYangu backend system.
                        </p>
                    </div>
                `,
                text: `✅ Email Configuration Test - KajaYangu\n\nYour email configuration is working correctly.\n\nSMTP Host: ${env.SMTP_HOST}\nSMTP Port: ${env.SMTP_PORT}\nFrom: ${env.SMTP_FROM_EMAIL}\nFrontend URL: ${env.FRONTEND_URL}\n\nAll email functionalities are now ready to use.\n\nThis is an automated test email.`
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
            from: `"KajaYangu Support" <${env.SMTP_FROM_EMAIL}>`,
            to: toEmail,
            subject: 'Test Email - KajaYangu Email System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2196F3;">📧 KajaYangu Email System Test</h2>
                    <p>This is a test email to verify that your KajaYangu email system is configured correctly.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Configuration Status:</strong> ✅ Working</p>
                        <p><strong>Test Link:</strong> <a href="${testLink}">${testLink}</a></p>
                        <p><strong>Test Token:</strong> <code>${testToken}</code></p>
                        <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
                    </div>
                    
                    <p><strong>Email Types Available:</strong></p>
                    <ul>
                        <li>✅ Account verification emails</li>
                        <li>✅ Password reset emails</li>
                        <li>✅ Welcome emails</li>
                        <li>✅ Security alerts</li>
                        <li>✅ Notification emails</li>
                    </ul>
                    
                    <p>If you're receiving this email, all email functionalities are working correctly!</p>
                    
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is a test email from KajaYangu backend. Configuration: SMTP Host: ${env.SMTP_HOST}, Port: ${env.SMTP_PORT}
                    </p>
                </div>
            `,
            text: `KajaYangu Email System Test\n\nThis is a test email to verify your email configuration.\n\nTest Link: ${testLink}\nTest Token: ${testToken}\n\nIf you're receiving this, all email functionalities are working!\n\nThis is a test email from KajaYangu backend.`
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