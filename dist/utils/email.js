import nodemailer from 'nodemailer';
import { env } from '../Database/envConfig.js';
export class EmailUtils {
    static transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });
    // Send email verification - UPDATED with professional design
    static async sendVerificationEmail(email, token, username) {
        const verificationLink = `${env.FRONTEND_URL}/verify-email-success?token=${token}`;
        console.log('📧 Sending verification email to:', email);
        console.log('🔗 Verification link:', verificationLink);
        const mailOptions = {
            from: `"KajaYangu" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Action Required: Verify Your KajaYangu Email',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email - KajaYangu</title>
                    <style>
                        /* Modern CSS Reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8fafc;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        .email-container {
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                        }
                        
                        .email-header { 
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            padding: 48px 40px; 
                            text-align: center; 
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .email-header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            right: -50%;
                            width: 200px;
                            height: 200px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 50%;
                        }
                        
                        .email-header::after {
                            content: '';
                            position: absolute;
                            bottom: -30%;
                            left: -20%;
                            width: 150px;
                            height: 150px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 50%;
                        }
                        
                        .header-content {
                            position: relative;
                            z-index: 1;
                        }
                        
                        .email-header h1 { 
                            margin: 0 0 12px 0; 
                            font-size: 36px; 
                            font-weight: 700;
                            letter-spacing: -0.5px;
                        }
                        
                        .email-header p {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 400;
                            opacity: 0.9;
                        }
                        
                        .email-content { 
                            padding: 48px 40px; 
                        }
                        
                        .greeting {
                            font-size: 18px;
                            color: #4b5563;
                            margin-bottom: 32px;
                            line-height: 1.8;
                        }
                        
                        .greeting strong {
                            color: #111827;
                            font-weight: 600;
                        }
                        
                        .verification-box {
                            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                            border: 2px solid #0ea5e9;
                            border-radius: 12px;
                            padding: 32px;
                            text-align: center;
                            margin: 32px 0;
                        }
                        
                        .verification-icon {
                            width: 64px;
                            height: 64px;
                            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 24px;
                        }
                        
                        .verification-icon svg {
                            width: 32px;
                            height: 32px;
                            color: white;
                        }
                        
                        .verification-box h2 {
                            font-size: 24px;
                            font-weight: 700;
                            color: #0c4a6e;
                            margin-bottom: 16px;
                        }
                        
                        .verification-box p {
                            color: #475569;
                            font-size: 16px;
                            margin-bottom: 24px;
                        }
                        
                        .verification-button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
                            color: white !important; 
                            padding: 16px 48px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: 600; 
                            font-size: 18px; 
                            text-align: center;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
                            border: none;
                            cursor: pointer;
                        }
                        
                        .verification-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.35);
                            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                        }
                        
                        .expiry-notice {
                            background-color: #fffbeb;
                            border: 1px solid #fbbf24;
                            border-radius: 8px;
                            padding: 16px;
                            margin: 24px 0;
                            text-align: center;
                        }
                        
                        .expiry-notice p {
                            color: #92400e;
                            font-size: 14px;
                            font-weight: 500;
                            margin: 0;
                        }
                        
                        .manual-link {
                            background-color: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 24px 0;
                        }
                        
                        .manual-link p {
                            color: #475569;
                            font-size: 14px;
                            margin-bottom: 8px;
                        }
                        
                        .manual-link a {
                            color: #0ea5e9;
                            font-size: 14px;
                            word-break: break-all;
                            text-decoration: none;
                        }
                        
                        .manual-link a:hover {
                            text-decoration: underline;
                        }
                        
                        .features-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin: 40px 0;
                        }
                        
                        .feature-item {
                            background: #f8fafc;
                            padding: 24px;
                            border-radius: 12px;
                            text-align: center;
                            border: 1px solid #e5e7eb;
                            transition: all 0.3s ease;
                        }
                        
                        .feature-item:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
                            border-color: #0ea5e9;
                        }
                        
                        .feature-icon {
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 16px;
                        }
                        
                        .feature-icon svg {
                            width: 24px;
                            height: 24px;
                            color: white;
                        }
                        
                        .feature-item h4 {
                            font-size: 16px;
                            font-weight: 600;
                            color: #1f2937;
                            margin-bottom: 8px;
                        }
                        
                        .feature-item p {
                            color: #6b7280;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        
                        .email-footer { 
                            background-color: #111827; 
                            padding: 40px; 
                            text-align: center; 
                            color: #9ca3af; 
                            border-top: 1px solid #374151;
                        }
                        
                        .footer-logo {
                            font-size: 24px; 
                            font-weight: 700; 
                            color: #ffffff; 
                            margin-bottom: 16px;
                            letter-spacing: -0.5px;
                        }
                        
                        .footer-links {
                            display: flex;
                            justify-content: center;
                            gap: 24px;
                            margin: 24px 0;
                        }
                        
                        .footer-links a {
                            color: #9ca3af;
                            text-decoration: none;
                            font-size: 14px;
                            transition: color 0.3s ease;
                        }
                        
                        .footer-links a:hover {
                            color: #ffffff;
                        }
                        
                        .copyright {
                            font-size: 12px;
                            color: #6b7280;
                            margin-top: 24px;
                            padding-top: 24px;
                            border-top: 1px solid #374151;
                        }
                        
                        .security-note {
                            background-color: #fef3c7;
                            border: 1px solid #f59e0b;
                            border-radius: 8px;
                            padding: 16px;
                            margin: 24px 0;
                        }
                        
                        .security-note p {
                            color: #92400e;
                            font-size: 14px;
                            margin: 0;
                        }
                        
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                border-radius: 0;
                                border: none;
                            }
                            
                            .email-header, .email-content {
                                padding: 32px 24px;
                            }
                            
                            .email-header h1 {
                                font-size: 28px;
                            }
                            
                            .features-grid {
                                grid-template-columns: 1fr;
                            }
                            
                            .verification-button {
                                width: 100%;
                                padding: 16px 24px;
                            }
                            
                            .footer-links {
                                flex-direction: column;
                                gap: 12px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="header-content">
                                <h1>Welcome to KajaYangu! 🎉</h1>
                                <p>Your journey to finding the perfect home starts here</p>
                            </div>
                        </div>
                        
                        <div class="email-content">
                            <div class="greeting">
                                <p>Hello${username ? ` <strong>${username}</strong>` : ''},</p>
                                <p>Thank you for creating an account with KajaYangu! We're excited to have you join our community of home seekers and property experts.</p>
                            </div>
                            
                            <div class="verification-box">
                                <div class="verification-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                </div>
                                <h2>Verify Your Email Address</h2>
                                <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
                                
                                <a href="${verificationLink}" class="verification-button">Verify Email Address</a>
                            </div>
                            
                            <div class="expiry-notice">
                                <p>⏰ This verification link will expire in <strong>24 hours</strong> for security reasons.</p>
                            </div>
                            
                            <div class="manual-link">
                                <p><strong>Manual Verification:</strong> If the button above doesn't work, copy and paste this URL into your browser:</p>
                                <a href="${verificationLink}">${verificationLink}</a>
                            </div>
                            
                            <div class="security-note">
                                <p>🔒 <strong>Security Notice:</strong> If you didn't create this account, please ignore this email. Your email address will not be used for any purpose.</p>
                            </div>
                            
                            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px;">What Awaits You:</h3>
                            <div class="features-grid">
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Smart Property Search</h4>
                                    <p>Find your dream home with advanced filters and location-based search</p>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Verified Listings</h4>
                                    <p>All properties are thoroughly verified for authenticity and quality</p>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Direct Agent Contact</h4>
                                    <p>Communicate directly with verified property agents and owners</p>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <h4>Secure Platform</h4>
                                    <p>Your data and transactions are protected with enterprise-grade security</p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                                    <strong>Need help?</strong> If you're having trouble verifying your email or have any questions, our support team is here to help.
                                </p>
                                <a href="${env.FRONTEND_URL}/help" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">Visit our Help Center →</a>
                            </div>
                        </div>
                        
                        <div class="email-footer">
                            <div class="footer-logo">KajaYangu</div>
                            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 24px;">
                                Kenya's Premier Property Platform
                            </p>
                            
                            <div class="footer-links">
                                <a href="${env.FRONTEND_URL}/about">About Us</a>
                                <a href="${env.FRONTEND_URL}/blog">Blog</a>
                                <a href="${env.FRONTEND_URL}/contact">Contact</a>
                                <a href="${env.FRONTEND_URL}/careers">Careers</a>
                            </div>
                            
                            <div class="footer-links">
                                <a href="${env.FRONTEND_URL}/privacy">Privacy Policy</a>
                                <a href="${env.FRONTEND_URL}/terms">Terms of Service</a>
                                <a href="${env.FRONTEND_URL}/cookies">Cookie Policy</a>
                                <a href="${env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
                            </div>
                            
                            <div class="copyright">
                                <p>&copy; ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.</p>
                                <p style="margin-top: 8px;">This email was sent to ${email} as part of your KajaYangu account registration.</p>
                                <p style="margin-top: 8px; font-size: 11px;">
                                    KajaYangu Ltd, Nairobi, Kenya | support@kajayangu.com
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to KajaYangu!\n\nHello${username ? ` ${username}` : ''},\n\nThank you for creating an account with KajaYangu! We're excited to have you join our community.\n\nVERIFY YOUR EMAIL:\nTo complete your registration, please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis verification link will expire in 24 hours for security reasons.\n\nIf the link above doesn't work, copy and paste the URL into your browser.\n\nWHAT YOU GET WITH KAJAYANGU:\n• Smart property search with advanced filters\n• Verified property listings across Kenya\n• Direct communication with agents\n• Secure platform with enterprise-grade security\n\nSECURITY NOTICE:\nIf you didn't create this account, please ignore this email. Your email address will not be used for any purpose.\n\nNEED HELP?\nVisit our Help Center: ${env.FRONTEND_URL}/help\nContact Support: support@kajayangu.com\n\nWelcome aboard,\nThe KajaYangu Team\n\n---\nKajaYangu Ltd | Nairobi, Kenya\n© ${new Date().getFullYear()} All rights reserved.\nThis email was sent to ${email}.`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Verification email sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw error;
        }
    }
    // Send password reset email - UPDATED with modern design
    static async sendPasswordResetEmail(email, token) {
        const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
        console.log('📧 Sending password reset email to:', email);
        console.log('🔗 Reset link:', resetLink);
        const mailOptions = {
            from: `"KajaYangu Support" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: 'Password Reset Request - KajaYangu',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset - KajaYangu</title>
                    <style>
                        /* Modern CSS Reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8fafc;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        .email-container {
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                        }
                        
                        .email-header { 
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                            padding: 48px 40px; 
                            text-align: center; 
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .email-header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            right: -50%;
                            width: 200px;
                            height: 200px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 50%;
                        }
                        
                        .email-header::after {
                            content: '';
                            position: absolute;
                            bottom: -30%;
                            left: -20%;
                            width: 150px;
                            height: 150px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 50%;
                        }
                        
                        .header-content {
                            position: relative;
                            z-index: 1;
                        }
                        
                        .email-header h1 { 
                            margin: 0 0 12px 0; 
                            font-size: 36px; 
                            font-weight: 700;
                            letter-spacing: -0.5px;
                        }
                        
                        .email-header p {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 400;
                            opacity: 0.9;
                        }
                        
                        .email-content { 
                            padding: 48px 40px; 
                        }
                        
                        .greeting {
                            font-size: 18px;
                            color: #4b5563;
                            margin-bottom: 32px;
                            line-height: 1.8;
                        }
                        
                        .reset-box {
                            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                            border: 2px solid #ef4444;
                            border-radius: 12px;
                            padding: 32px;
                            text-align: center;
                            margin: 32px 0;
                        }
                        
                        .reset-icon {
                            width: 64px;
                            height: 64px;
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 24px;
                        }
                        
                        .reset-icon svg {
                            width: 32px;
                            height: 32px;
                            color: white;
                        }
                        
                        .reset-box h2 {
                            font-size: 24px;
                            font-weight: 700;
                            color: #7f1d1d;
                            margin-bottom: 16px;
                        }
                        
                        .reset-box p {
                            color: #475569;
                            font-size: 16px;
                            margin-bottom: 24px;
                        }
                        
                        .reset-button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                            color: white !important; 
                            padding: 16px 48px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: 600; 
                            font-size: 18px; 
                            text-align: center;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
                            border: none;
                            cursor: pointer;
                        }
                        
                        .reset-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
                            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                        }
                        
                        .expiry-notice {
                            background-color: #fffbeb;
                            border: 1px solid #fbbf24;
                            border-radius: 8px;
                            padding: 16px;
                            margin: 24px 0;
                            text-align: center;
                        }
                        
                        .expiry-notice p {
                            color: #92400e;
                            font-size: 14px;
                            font-weight: 500;
                            margin: 0;
                        }
                        
                        .security-warning {
                            background-color: #fef3c7;
                            border: 1px solid #f59e0b;
                            border-radius: 8px;
                            padding: 16px;
                            margin: 24px 0;
                        }
                        
                        .security-warning p {
                            color: #92400e;
                            font-size: 14px;
                            margin: 0;
                        }
                        
                        .manual-link {
                            background-color: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 24px 0;
                        }
                        
                        .manual-link p {
                            color: #475569;
                            font-size: 14px;
                            margin-bottom: 8px;
                        }
                        
                        .manual-link a {
                            color: #ef4444;
                            font-size: 14px;
                            word-break: break-all;
                            text-decoration: none;
                        }
                        
                        .manual-link a:hover {
                            text-decoration: underline;
                        }
                        
                        .email-footer { 
                            background-color: #111827; 
                            padding: 40px; 
                            text-align: center; 
                            color: #9ca3af; 
                            border-top: 1px solid #374151;
                        }
                        
                        .footer-logo {
                            font-size: 24px; 
                            font-weight: 700; 
                            color: #ffffff; 
                            margin-bottom: 16px;
                            letter-spacing: -0.5px;
                        }
                        
                        .footer-links {
                            display: flex;
                            justify-content: center;
                            gap: 24px;
                            margin: 24px 0;
                        }
                        
                        .footer-links a {
                            color: #9ca3af;
                            text-decoration: none;
                            font-size: 14px;
                            transition: color 0.3s ease;
                        }
                        
                        .footer-links a:hover {
                            color: #ffffff;
                        }
                        
                        .copyright {
                            font-size: 12px;
                            color: #6b7280;
                            margin-top: 24px;
                            padding-top: 24px;
                            border-top: 1px solid #374151;
                        }
                        
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                border-radius: 0;
                                border: none;
                            }
                            
                            .email-header, .email-content {
                                padding: 32px 24px;
                            }
                            
                            .email-header h1 {
                                font-size: 28px;
                            }
                            
                            .reset-button {
                                width: 100%;
                                padding: 16px 24px;
                            }
                            
                            .footer-links {
                                flex-direction: column;
                                gap: 12px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="header-content">
                                <h1>Password Reset Request 🔒</h1>
                                <p>Secure your KajaYangu account</p>
                            </div>
                        </div>
                        
                        <div class="email-content">
                            <div class="greeting">
                                <p>Hello,</p>
                                <p>We received a request to reset the password for your KajaYangu account. To proceed with resetting your password, click the button below:</p>
                            </div>
                            
                            <div class="reset-box">
                                <div class="reset-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <h2>Reset Your Password</h2>
                                <p>This link will allow you to create a new password for your KajaYangu account.</p>
                                
                                <a href="${resetLink}" class="reset-button">Reset My Password</a>
                            </div>
                            
                            <div class="expiry-notice">
                                <p>⏰ This password reset link will expire in <strong>1 hour</strong> for security reasons.</p>
                            </div>
                            
                            <div class="security-warning">
                                <p>⚠️ <strong>Security Warning:</strong> If you didn't request this password reset, please ignore this email. Your account is secure, and no changes have been made.</p>
                            </div>
                            
                            <div class="manual-link">
                                <p><strong>Manual Reset:</strong> If the button above doesn't work, copy and paste this URL into your browser:</p>
                                <a href="${resetLink}">${resetLink}</a>
                            </div>
                            
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    <strong>Stay Secure:</strong> Always use strong, unique passwords and never share your login credentials. For added security, we recommend enabling two-factor authentication in your account settings.
                                </p>
                                <a href="${env.FRONTEND_URL}/security" style="color: #ef4444; text-decoration: none; font-weight: 500; margin-top: 12px; display: inline-block;">Learn about account security →</a>
                            </div>
                        </div>
                        
                        <div class="email-footer">
                            <div class="footer-logo">KajaYangu</div>
                            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 24px;">
                                Kenya's Premier Property Platform
                            </p>
                            
                            <div class="footer-links">
                                <a href="${env.FRONTEND_URL}/security">Security Center</a>
                                <a href="${env.FRONTEND_URL}/help">Help Center</a>
                                <a href="${env.FRONTEND_URL}/contact">Contact Support</a>
                            </div>
                            
                            <div class="copyright">
                                <p>&copy; ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.</p>
                                <p style="margin-top: 8px;">This security email was sent to ${email}.</p>
                                <p style="margin-top: 8px; font-size: 11px;">
                                    KajaYangu Ltd, Nairobi, Kenya | security@kajayangu.com
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Password Reset Request - KajaYangu\n\nHello,\n\nWe received a request to reset your password. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour for security reasons.\n\nSECURITY NOTICE:\nIf you didn't request this password reset, please ignore this email. Your account is secure and no changes have been made.\n\nFor security reasons, please don't share this email with anyone.\n\nSTAY SECURE:\n• Use strong, unique passwords\n• Enable two-factor authentication\n• Never share your login credentials\n\nNEED HELP?\nSecurity Center: ${env.FRONTEND_URL}/security\nContact Support: security@kajayangu.com\n\nKajaYangu Security Team\n\n---\nKajaYangu Ltd | Nairobi, Kenya\n© ${new Date().getFullYear()} All rights reserved.`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw error;
        }
    }
    // Send welcome email - UPDATED with professional design
    static async sendWelcomeEmail(email, username) {
        console.log('📧 Sending welcome email to:', email);
        const mailOptions = {
            from: `"KajaYangu Team" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `Welcome to KajaYangu, ${username}! Your Journey Begins 🏠`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to KajaYangu!</title>
                    <style>
                        /* Modern CSS Reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8fafc;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        .email-container {
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                        }
                        
                        .email-header { 
                            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                            padding: 48px 40px; 
                            text-align: center; 
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .email-header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            right: -50%;
                            width: 200px;
                            height: 200px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 50%;
                        }
                        
                        .email-header::after {
                            content: '';
                            position: absolute;
                            bottom: -30%;
                            left: -20%;
                            width: 150px;
                            height: 150px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 50%;
                        }
                        
                        .header-content {
                            position: relative;
                            z-index: 1;
                        }
                        
                        .email-header h1 { 
                            margin: 0 0 12px 0; 
                            font-size: 36px; 
                            font-weight: 700;
                            letter-spacing: -0.5px;
                        }
                        
                        .email-header p {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 400;
                            opacity: 0.9;
                        }
                        
                        .email-content { 
                            padding: 48px 40px; 
                        }
                        
                        .greeting {
                            font-size: 18px;
                            color: #4b5563;
                            margin-bottom: 32px;
                            line-height: 1.8;
                        }
                        
                        .greeting strong {
                            color: #111827;
                            font-weight: 600;
                        }
                        
                        .welcome-box {
                            background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
                            border: 2px solid #8b5cf6;
                            border-radius: 12px;
                            padding: 32px;
                            text-align: center;
                            margin: 32px 0;
                        }
                        
                        .welcome-icon {
                            width: 64px;
                            height: 64px;
                            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 24px;
                        }
                        
                        .welcome-icon svg {
                            width: 32px;
                            height: 32px;
                            color: white;
                        }
                        
                        .welcome-box h2 {
                            font-size: 24px;
                            font-weight: 700;
                            color: #4c1d95;
                            margin-bottom: 16px;
                        }
                        
                        .welcome-box p {
                            color: #475569;
                            font-size: 16px;
                            margin-bottom: 24px;
                        }
                        
                        .cta-button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                            color: white !important; 
                            padding: 16px 48px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: 600; 
                            font-size: 18px; 
                            text-align: center;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                            border: none;
                            cursor: pointer;
                        }
                        
                        .cta-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.35);
                            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                        }
                        
                        .features-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin: 40px 0;
                        }
                        
                        .feature-item {
                            background: #f8fafc;
                            padding: 24px;
                            border-radius: 12px;
                            text-align: center;
                            border: 1px solid #e5e7eb;
                            transition: all 0.3s ease;
                        }
                        
                        .feature-item:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
                            border-color: #8b5cf6;
                        }
                        
                        .feature-icon {
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 16px;
                        }
                        
                        .feature-icon svg {
                            width: 24px;
                            height: 24px;
                            color: white;
                        }
                        
                        .feature-item h4 {
                            font-size: 16px;
                            font-weight: 600;
                            color: #1f2937;
                            margin-bottom: 8px;
                        }
                        
                        .feature-item p {
                            color: #6b7280;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        
                        .get-started {
                            background-color: #f8fafc;
                            border: 1px solid #e5e7eb;
                            border-radius: 12px;
                            padding: 32px;
                            margin: 40px 0;
                        }
                        
                        .get-started h3 {
                            font-size: 20px;
                            font-weight: 600;
                            color: #1f2937;
                            margin-bottom: 20px;
                        }
                        
                        .step {
                            display: flex;
                            align-items: flex-start;
                            margin-bottom: 16px;
                            padding-bottom: 16px;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        
                        .step:last-child {
                            border-bottom: none;
                        }
                        
                        .step-number {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 600;
                            margin-right: 16px;
                            flex-shrink: 0;
                        }
                        
                        .step-content {
                            flex: 1;
                        }
                        
                        .step-content h4 {
                            font-size: 16px;
                            font-weight: 600;
                            color: #1f2937;
                            margin-bottom: 4px;
                        }
                        
                        .step-content p {
                            color: #6b7280;
                            font-size: 14px;
                        }
                        
                        .email-footer { 
                            background-color: #111827; 
                            padding: 40px; 
                            text-align: center; 
                            color: #9ca3af; 
                            border-top: 1px solid #374151;
                        }
                        
                        .footer-logo {
                            font-size: 24px; 
                            font-weight: 700; 
                            color: #ffffff; 
                            margin-bottom: 16px;
                            letter-spacing: -0.5px;
                        }
                        
                        .footer-links {
                            display: flex;
                            justify-content: center;
                            gap: 24px;
                            margin: 24px 0;
                        }
                        
                        .footer-links a {
                            color: #9ca3af;
                            text-decoration: none;
                            font-size: 14px;
                            transition: color 0.3s ease;
                        }
                        
                        .footer-links a:hover {
                            color: #ffffff;
                        }
                        
                        .copyright {
                            font-size: 12px;
                            color: #6b7280;
                            margin-top: 24px;
                            padding-top: 24px;
                            border-top: 1px solid #374151;
                        }
                        
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                border-radius: 0;
                                border: none;
                            }
                            
                            .email-header, .email-content {
                                padding: 32px 24px;
                            }
                            
                            .email-header h1 {
                                font-size: 28px;
                            }
                            
                            .features-grid {
                                grid-template-columns: 1fr;
                            }
                            
                            .cta-button {
                                width: 100%;
                                padding: 16px 24px;
                            }
                            
                            .footer-links {
                                flex-direction: column;
                                gap: 12px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="header-content">
                                <h1>Welcome to KajaYangu! 🎉</h1>
                                <p>Your journey to finding the perfect home starts here</p>
                            </div>
                        </div>
                        
                        <div class="email-content">
                            <div class="greeting">
                                <p>Hello <strong>${username}</strong>,</p>
                                <p>We're absolutely thrilled to welcome you to KajaYangu! Your account has been successfully verified, and you're now part of Kenya's premier property platform.</p>
                            </div>
                            
                            <div class="welcome-box">
                                <div class="welcome-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                    </svg>
                                </div>
                                <h2>Your Home Awaits</h2>
                                <p>Get ready to discover thousands of verified properties and find your perfect match.</p>
                                
                                <a href="${env.FRONTEND_URL}" class="cta-button">Start Exploring Properties</a>
                            </div>
                            
                            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px;">What Makes KajaYangu Special:</h3>
                            <div class="features-grid">
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Smart Search</h4>
                                    <p>Advanced filters to find exactly what you're looking for</p>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Verified Listings</h4>
                                    <p>Every property is thoroughly checked for authenticity</p>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Direct Contact</h4>
                                    <p>Connect directly with verified agents and owners</p>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    </div>
                                    <h4>Secure Platform</h4>
                                    <p>Your data is protected with enterprise-grade security</p>
                                </div>
                            </div>
                            
                            <div class="get-started">
                                <h3>Quick Start Guide:</h3>
                                
                                <div class="step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h4>Complete Your Profile</h4>
                                        <p>Add your preferences to get personalized property recommendations</p>
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h4>Set Your Preferences</h4>
                                        <p>Tell us your desired location, budget, and property type</p>
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h4>Browse & Save</h4>
                                        <p>Explore properties and save your favorites for later review</p>
                                    </div>
                                </div>
                                
                                <div class="step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h4>Schedule Visits</h4>
                                        <p>Book property viewings directly through our platform</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                                    <strong>Need assistance?</strong> Our support team is always here to help you navigate your home search journey.
                                </p>
                                <div style="display: flex; gap: 20px;">
                                    <a href="${env.FRONTEND_URL}/help" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">Help Center →</a>
                                    <a href="${env.FRONTEND_URL}/faq" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">FAQs →</a>
                                    <a href="${env.FRONTEND_URL}/contact" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">Contact Us →</a>
                                </div>
                            </div>
                        </div>
                        
                        <div class="email-footer">
                            <div class="footer-logo">KajaYangu</div>
                            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 24px;">
                                Kenya's Premier Property Platform
                            </p>
                            
                            <div class="footer-links">
                                <a href="${env.FRONTEND_URL}/about">About Us</a>
                                <a href="${env.FRONTEND_URL}/blog">Blog</a>
                                <a href="${env.FRONTEND_URL}/contact">Contact</a>
                                <a href="${env.FRONTEND_URL}/careers">Careers</a>
                            </div>
                            
                            <div class="footer-links">
                                <a href="${env.FRONTEND_URL}/privacy">Privacy Policy</a>
                                <a href="${env.FRONTEND_URL}/terms">Terms of Service</a>
                                <a href="${env.FRONTEND_URL}/cookies">Cookie Policy</a>
                                <a href="${env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
                            </div>
                            
                            <div class="copyright">
                                <p>&copy; ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.</p>
                                <p style="margin-top: 8px;">This email was sent to ${email} as part of your KajaYangu account.</p>
                                <p style="margin-top: 8px; font-size: 11px;">
                                    KajaYangu Ltd, Nairobi, Kenya | support@kajayangu.com
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Welcome to KajaYangu, ${username}! 🏠\n\nWe're thrilled to welcome you to KajaYangu - Kenya's premier platform for finding and managing rental properties.\n\nYour account is now active and ready to use!\n\nGET STARTED:\n1. Complete your profile for personalized recommendations\n2. Set your preferences (location, budget, property type)\n3. Browse thousands of verified properties\n4. Save favorites and schedule viewings\n5. Connect directly with verified agents\n\nStart exploring now: ${env.FRONTEND_URL}\n\nWHAT MAKES US SPECIAL:\n• Smart search with advanced filters\n• 100% verified property listings\n• Direct communication with agents\n• Secure, enterprise-grade platform\n• Nationwide property coverage\n\nQUICK START GUIDE:\n1. Complete your profile\n2. Set your preferences\n3. Browse and save properties\n4. Schedule viewings\n5. Find your perfect home!\n\nNEED HELP?\n• Help Center: ${env.FRONTEND_URL}/help\n• FAQs: ${env.FRONTEND_URL}/faq\n• Contact Support: support@kajayangu.com\n\nHappy house hunting! 🏡\n\nWelcome aboard,\nThe KajaYangu Team\n\n---\nKajaYangu Ltd | Nairobi, Kenya\n© ${new Date().getFullYear()} All rights reserved.`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send welcome email:', error);
            // Don't throw error for welcome email - it's not critical
        }
    }
    // Send account security alert - UPDATED with professional design
    static async sendSecurityAlert(email, alertType, details, username) {
        console.log('🔒 Sending security alert email to:', email);
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
                        /* Modern CSS Reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8fafc;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        .email-container {
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                        }
                        
                        .email-header { 
                            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                            padding: 48px 40px; 
                            text-align: center; 
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .email-header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            right: -50%;
                            width: 200px;
                            height: 200px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 50%;
                        }
                        
                        .email-header::after {
                            content: '';
                            position: absolute;
                            bottom: -30%;
                            left: -20%;
                            width: 150px;
                            height: 150px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 50%;
                        }
                        
                        .header-content {
                            position: relative;
                            z-index: 1;
                        }
                        
                        .email-header h1 { 
                            margin: 0 0 12px 0; 
                            font-size: 36px; 
                            font-weight: 700;
                            letter-spacing: -0.5px;
                        }
                        
                        .email-header p {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 400;
                            opacity: 0.9;
                        }
                        
                        .email-content { 
                            padding: 48px 40px; 
                        }
                        
                        .greeting {
                            font-size: 18px;
                            color: #4b5563;
                            margin-bottom: 32px;
                            line-height: 1.8;
                        }
                        
                        .greeting strong {
                            color: #111827;
                            font-weight: 600;
                        }
                        
                        .alert-box {
                            background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
                            border: 2px solid #f97316;
                            border-radius: 12px;
                            padding: 32px;
                            text-align: center;
                            margin: 32px 0;
                        }
                        
                        .alert-icon {
                            width: 64px;
                            height: 64px;
                            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 24px;
                        }
                        
                        .alert-icon svg {
                            width: 32px;
                            height: 32px;
                            color: white;
                        }
                        
                        .alert-box h2 {
                            font-size: 24px;
                            font-weight: 700;
                            color: #7c2d12;
                            margin-bottom: 16px;
                        }
                        
                        .alert-details {
                            background-color: #f8fafc;
                            border: 1px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 24px;
                            margin: 24px 0;
                            text-align: left;
                        }
                        
                        .detail-row {
                            display: flex;
                            margin-bottom: 12px;
                            padding-bottom: 12px;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        
                        .detail-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                            padding-bottom: 0;
                        }
                        
                        .detail-label {
                            font-weight: 600;
                            color: #1f2937;
                            width: 120px;
                            flex-shrink: 0;
                        }
                        
                        .detail-value {
                            color: #4b5563;
                            flex: 1;
                        }
                        
                        .action-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin: 40px 0;
                        }
                        
                        .action-item {
                            background: #f8fafc;
                            padding: 24px;
                            border-radius: 12px;
                            text-align: center;
                            border: 1px solid #e5e7eb;
                            transition: all 0.3s ease;
                        }
                        
                        .action-item:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
                            border-color: #f97316;
                        }
                        
                        .action-icon {
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 16px;
                        }
                        
                        .action-icon svg {
                            width: 24px;
                            height: 24px;
                            color: white;
                        }
                        
                        .action-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                            color: white !important;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: 600;
                            font-size: 14px;
                            margin-top: 12px;
                            transition: all 0.3s ease;
                        }
                        
                        .action-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
                        }
                        
                        .security-tips {
                            background-color: #fef3c7;
                            border: 1px solid #f59e0b;
                            border-radius: 8px;
                            padding: 24px;
                            margin: 32px 0;
                        }
                        
                        .security-tips h3 {
                            color: #92400e;
                            font-size: 18px;
                            font-weight: 600;
                            margin-bottom: 16px;
                        }
                        
                        .tip-item {
                            display: flex;
                            align-items: flex-start;
                            margin-bottom: 12px;
                        }
                        
                        .tip-icon {
                            color: #f59e0b;
                            margin-right: 12px;
                            flex-shrink: 0;
                        }
                        
                        .tip-text {
                            color: #92400e;
                            font-size: 14px;
                            line-height: 1.5;
                        }
                        
                        .email-footer { 
                            background-color: #111827; 
                            padding: 40px; 
                            text-align: center; 
                            color: #9ca3af; 
                            border-top: 1px solid #374151;
                        }
                        
                        .footer-logo {
                            font-size: 24px; 
                            font-weight: 700; 
                            color: #ffffff; 
                            margin-bottom: 16px;
                            letter-spacing: -0.5px;
                        }
                        
                        .footer-links {
                            display: flex;
                            justify-content: center;
                            gap: 24px;
                            margin: 24px 0;
                        }
                        
                        .footer-links a {
                            color: #9ca3af;
                            text-decoration: none;
                            font-size: 14px;
                            transition: color 0.3s ease;
                        }
                        
                        .footer-links a:hover {
                            color: #ffffff;
                        }
                        
                        .copyright {
                            font-size: 12px;
                            color: #6b7280;
                            margin-top: 24px;
                            padding-top: 24px;
                            border-top: 1px solid #374151;
                        }
                        
                        @media only screen and (max-width: 600px) {
                            .email-container {
                                border-radius: 0;
                                border: none;
                            }
                            
                            .email-header, .email-content {
                                padding: 32px 24px;
                            }
                            
                            .email-header h1 {
                                font-size: 28px;
                            }
                            
                            .action-grid {
                                grid-template-columns: 1fr;
                            }
                            
                            .detail-row {
                                flex-direction: column;
                            }
                            
                            .detail-label {
                                width: 100%;
                                margin-bottom: 4px;
                            }
                            
                            .footer-links {
                                flex-direction: column;
                                gap: 12px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="header-content">
                                <h1>Security Alert 🔒</h1>
                                <p>Important notice regarding your KajaYangu account</p>
                            </div>
                        </div>
                        
                        <div class="email-content">
                            <div class="greeting">
                                <p>Hello${username ? ` <strong>${username}</strong>` : ''},</p>
                                <p>We detected unusual activity on your KajaYangu account. Please review the details below and take appropriate action.</p>
                            </div>
                            
                            <div class="alert-box">
                                <div class="alert-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.798-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                </div>
                                <h2>${alertType}</h2>
                                <p>This alert was triggered by our security system to protect your account.</p>
                            </div>
                            
                            <div class="alert-details">
                                <div class="detail-row">
                                    <div class="detail-label">Alert Type:</div>
                                    <div class="detail-value">${alertType}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Details:</div>
                                    <div class="detail-value">${details}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Time:</div>
                                    <div class="detail-value">${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            })}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Account:</div>
                                    <div class="detail-value">${email}</div>
                                </div>
                            </div>
                            
                            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 20px;">Recommended Actions:</h3>
                            <div class="action-grid">
                                <div class="action-item">
                                    <div class="action-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                        </svg>
                                    </div>
                                    <h4>Change Password</h4>
                                    <p>If you suspect unauthorized access, change your password immediately</p>
                                    <a href="${env.FRONTEND_URL}/change-password" class="action-button">Change Password</a>
                                </div>
                                
                                <div class="action-item">
                                    <div class="action-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                        </svg>
                                    </div>
                                    <h4>Enable 2FA</h4>
                                    <p>Add an extra layer of security with two-factor authentication</p>
                                    <a href="${env.FRONTEND_URL}/security/2fa" class="action-button">Enable 2FA</a>
                                </div>
                                
                                <div class="action-item">
                                    <div class="action-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                    <h4>Review Activity</h4>
                                    <p>Check your recent account activity for anything unusual</p>
                                    <a href="${env.FRONTEND_URL}/security/activity" class="action-button">View Activity</a>
                                </div>
                                
                                <div class="action-item">
                                    <div class="action-icon">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                        </svg>
                                    </div>
                                    <h4>Contact Support</h4>
                                    <p>Get immediate assistance from our security team</p>
                                    <a href="${env.FRONTEND_URL}/security/support" class="action-button">Contact Support</a>
                                </div>
                            </div>
                            
                            <div class="security-tips">
                                <h3>Security Best Practices:</h3>
                                <div class="tip-item">
                                    <div class="tip-icon">🔒</div>
                                    <div class="tip-text">Use strong, unique passwords for your account</div>
                                </div>
                                <div class="tip-item">
                                    <div class="tip-icon">📱</div>
                                    <div class="tip-text">Enable two-factor authentication for added security</div>
                                </div>
                                <div class="tip-item">
                                    <div class="tip-icon">👁️</div>
                                    <div class="tip-text">Regularly review your account activity</div>
                                </div>
                                <div class="tip-item">
                                    <div class="tip-icon">🚫</div>
                                    <div class="tip-text">Never share your login credentials with anyone</div>
                                </div>
                                <div class="tip-item">
                                    <div class="tip-icon">📧</div>
                                    <div class="tip-text">Be cautious of suspicious emails or links</div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    <strong>If you recognize this activity:</strong> No action is required. This alert was generated as a precaution.
                                    <br><br>
                                    <strong>If you don't recognize this activity:</strong> Please take immediate action to secure your account.
                                </p>
                            </div>
                        </div>
                        
                        <div class="email-footer">
                            <div class="footer-logo">KajaYangu</div>
                            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 24px;">
                                Kenya's Premier Property Platform
                            </p>
                            
                            <div class="footer-links">
                                <a href="${env.FRONTEND_URL}/security">Security Center</a>
                                <a href="${env.FRONTEND_URL}/help/security">Security Help</a>
                                <a href="${env.FRONTEND_URL}/report">Report Issue</a>
                                <a href="${env.FRONTEND_URL}/contact/security">Security Contact</a>
                            </div>
                            
                            <div class="copyright">
                                <p>&copy; ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.</p>
                                <p style="margin-top: 8px;">This is an automated security email. Please do not reply to this message.</p>
                                <p style="margin-top: 8px; font-size: 11px;">
                                    KajaYangu Security Team, Nairobi, Kenya | security@kajayangu.com
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `SECURITY ALERT - KajaYangu\n\nAlert Type: ${alertType}\n\nDetails: ${details}\n\nTime: ${new Date().toLocaleString()}\n\nWe detected unusual activity on your KajaYangu account.\n\nRECOMMENDED ACTIONS:\n1. Change your password immediately if you suspect unauthorized access\n2. Enable two-factor authentication for added security\n3. Review your recent account activity\n4. Contact our security team if needed\n\nURGENT ACTIONS:\n- Change Password: ${env.FRONTEND_URL}/change-password\n- Enable 2FA: ${env.FRONTEND_URL}/security/2fa\n- View Activity: ${env.FRONTEND_URL}/security/activity\n- Contact Support: ${env.FRONTEND_URL}/security/support\n\nSECURITY BEST PRACTICES:\n• Use strong, unique passwords\n• Enable two-factor authentication\n• Never share your login credentials\n• Regularly review account activity\n• Be cautious of suspicious emails\n\nIf you recognize this activity, no action is required.\n\nIf you don't recognize this activity, please secure your account immediately.\n\nThis is an automated security alert. Please do not reply.\n\nKajaYangu Security Team\nsecurity@kajayangu.com\n\n---\nKajaYangu Ltd | Nairobi, Kenya\n© ${new Date().getFullYear()} All rights reserved.`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Security alert email sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send security alert email:', error);
            throw error;
        }
    }
    // Send property listing notification - NEW professional method
    static async sendPropertyNotification(email, username, propertyDetails) {
        const propertyLink = `${env.FRONTEND_URL}/property/${propertyDetails.propertyId}`;
        console.log('📧 Sending property notification to:', email);
        console.log('🏠 Property:', propertyDetails.title);
        const mailOptions = {
            from: `"KajaYangu Properties" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `New Property Match: ${propertyDetails.title} - ${propertyDetails.location}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Property Alert - KajaYangu</title>
                    <style>
                        /* Modern CSS Reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8fafc;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        .email-container {
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                        }
                        
                        .email-header { 
                            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
                            padding: 48px 40px; 
                            text-align: center; 
                            color: white;
                            position: relative;
                            overflow: hidden;
                        }
                        
                        .email-header h1 { 
                            margin: 0 0 12px 0; 
                            font-size: 36px; 
                            font-weight: 700;
                            letter-spacing: -0.5px;
                        }
                        
                        .email-header p {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 400;
                            opacity: 0.9;
                        }
                        
                        .property-card {
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                            margin: 32px 0;
                        }
                        
                        .property-image {
                            width: 100%;
                            height: 200px;
                            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #0c4a6e;
                            font-weight: 600;
                        }
                        
                        .property-details {
                            padding: 32px;
                        }
                        
                        .property-price {
                            font-size: 28px;
                            font-weight: 700;
                            color: #0ea5e9;
                            margin-bottom: 16px;
                        }
                        
                        .property-title {
                            font-size: 22px;
                            font-weight: 600;
                            color: #1f2937;
                            margin-bottom: 12px;
                        }
                        
                        .property-location {
                            color: #6b7280;
                            font-size: 16px;
                            margin-bottom: 24px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        
                        .property-features {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 16px;
                            margin: 24px 0;
                        }
                        
                        .feature-item {
                            text-align: center;
                            padding: 16px;
                            background: #f8fafc;
                            border-radius: 8px;
                            border: 1px solid #e5e7eb;
                        }
                        
                        .feature-value {
                            font-size: 20px;
                            font-weight: 700;
                            color: #0ea5e9;
                            margin-bottom: 4px;
                        }
                        
                        .feature-label {
                            color: #6b7280;
                            font-size: 14px;
                        }
                        
                        .view-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                            color: white !important;
                            padding: 16px 48px;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: 600;
                            font-size: 18px;
                            text-align: center;
                            transition: all 0.3s ease;
                        }
                        
                        .email-footer { 
                            background-color: #111827; 
                            padding: 40px; 
                            text-align: center; 
                            color: #9ca3af; 
                            border-top: 1px solid #374151;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>🏠 New Property Alert!</h1>
                            <p>We found a property that matches your preferences</p>
                        </div>
                        
                        <div style="padding: 48px 40px;">
                            <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
                                Hello ${username},
                            </h2>
                            <p style="color: #4b5563; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">
                                Based on your saved preferences, we've found a property that might be your perfect match!
                            </p>
                            
                            <div class="property-card">
                                <div class="property-image">
                                    <div style="text-align: center;">
                                        <div style="font-size: 48px; margin-bottom: 16px;">🏡</div>
                                        <div>${propertyDetails.title}</div>
                                    </div>
                                </div>
                                
                                <div class="property-details">
                                    <div class="property-price">${propertyDetails.price}</div>
                                    <h3 class="property-title">${propertyDetails.title}</h3>
                                    <div class="property-location">
                                        📍 ${propertyDetails.location}
                                    </div>
                                    
                                    <div class="property-features">
                                        <div class="feature-item">
                                            <div class="feature-value">${propertyDetails.bedrooms}</div>
                                            <div class="feature-label">Bedrooms</div>
                                        </div>
                                        <div class="feature-item">
                                            <div class="feature-value">${propertyDetails.bathrooms}</div>
                                            <div class="feature-label">Bathrooms</div>
                                        </div>
                                        <div class="feature-item">
                                            <div class="feature-value">${propertyDetails.type}</div>
                                            <div class="feature-label">Property Type</div>
                                        </div>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 32px;">
                                        <a href="${propertyLink}" class="view-button">View Property Details</a>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 32px;">
                                <p style="color: #6b7280; font-size: 14px;">
                                    Want to see more properties like this?
                                    <br>
                                    <a href="${env.FRONTEND_URL}/properties" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">
                                        Browse All Properties →
                                    </a>
                                </p>
                            </div>
                        </div>
                        
                        <div class="email-footer">
                            <div style="font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">
                                KajaYangu
                            </div>
                            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 24px;">
                                Kenya's Premier Property Platform
                            </p>
                            <div style="color: #6b7280; font-size: 12px;">
                                <p>&copy; ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.</p>
                                <p style="margin-top: 8px;">
                                    <a href="${env.FRONTEND_URL}/unsubscribe/property-alerts" style="color: #9ca3af; text-decoration: none;">
                                        Unsubscribe from property alerts
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `New Property Alert - KajaYangu\n\nHello ${username},\n\nWe found a property that matches your preferences!\n\n🏡 ${propertyDetails.title}\n📍 ${propertyDetails.location}\n💰 ${propertyDetails.price}\n🛏️ ${propertyDetails.bedrooms} bedrooms\n🚿 ${propertyDetails.bathrooms} bathrooms\n🏠 Type: ${propertyDetails.type}\n\nView Property: ${propertyLink}\n\nBrowse More Properties: ${env.FRONTEND_URL}/properties\n\nUnsubscribe from alerts: ${env.FRONTEND_URL}/unsubscribe/property-alerts\n\nKajaYangu - Kenya's Premier Property Platform`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Property notification sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send property notification:', error);
            throw error;
        }
    }
    // Send booking confirmation - NEW professional method
    static async sendBookingConfirmation(email, username, bookingDetails) {
        const bookingLink = `${env.FRONTEND_URL}/bookings/${bookingDetails.bookingId}`;
        console.log('📧 Sending booking confirmation to:', email);
        console.log('📅 Booking ID:', bookingDetails.bookingId);
        const mailOptions = {
            from: `"KajaYangu Bookings" <${env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: `Booking Confirmed: ${bookingDetails.propertyTitle}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Booking Confirmation - KajaYangu</title>
                    <style>
                        /* Modern CSS Reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333333; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #f8fafc;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        
                        .email-container {
                            max-width: 600px; 
                            margin: 0 auto; 
                            background-color: #ffffff; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                            border: 1px solid #e5e7eb;
                        }
                        
                        .email-header { 
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            padding: 48px 40px; 
                            text-align: center; 
                            color: white;
                        }
                        
                        .booking-details {
                            padding: 40px;
                            background: #f0fdf4;
                            border-radius: 12px;
                            margin: 24px 0;
                        }
                        
                        .detail-row {
                            display: flex;
                            margin-bottom: 16px;
                            padding-bottom: 16px;
                            border-bottom: 1px solid #dcfce7;
                        }
                        
                        .detail-row:last-child {
                            border-bottom: none;
                            margin-bottom: 0;
                        }
                        
                        .detail-label {
                            font-weight: 600;
                            color: #065f46;
                            width: 180px;
                            flex-shrink: 0;
                        }
                        
                        .detail-value {
                            color: #064e3b;
                            flex: 1;
                        }
                        
                        .agent-info {
                            background: #f8fafc;
                            border: 1px solid #e5e7eb;
                            border-radius: 12px;
                            padding: 24px;
                            margin: 24px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>✅ Booking Confirmed!</h1>
                            <p>Your property viewing is scheduled</p>
                        </div>
                        
                        <div style="padding: 48px 40px;">
                            <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 16px;">
                                Hello ${username},
                            </h2>
                            <p style="color: #4b5563; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">
                                Your property viewing has been successfully confirmed. Here are your booking details:
                            </p>
                            
                            <div class="booking-details">
                                <h3 style="color: #065f46; font-size: 20px; font-weight: 600; margin-bottom: 24px;">
                                    📅 Booking Details
                                </h3>
                                
                                <div class="detail-row">
                                    <div class="detail-label">Property:</div>
                                    <div class="detail-value">${bookingDetails.propertyTitle}</div>
                                </div>
                                
                                <div class="detail-row">
                                    <div class="detail-label">Location:</div>
                                    <div class="detail-value">${bookingDetails.propertyLocation}</div>
                                </div>
                                
                                <div class="detail-row">
                                    <div class="detail-label">Date:</div>
                                    <div class="detail-value">${bookingDetails.bookingDate}</div>
                                </div>
                                
                                <div class="detail-row">
                                    <div class="detail-label">Time:</div>
                                    <div class="detail-value">${bookingDetails.bookingTime}</div>
                                </div>
                                
                                <div class="detail-row">
                                    <div class="detail-label">Booking ID:</div>
                                    <div class="detail-value" style="font-family: monospace; font-weight: 600;">
                                        ${bookingDetails.bookingId}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="agent-info">
                                <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 16px;">
                                    🤝 Agent Information
                                </h3>
                                <p style="color: #4b5563; margin-bottom: 8px;">
                                    <strong>Agent Name:</strong> ${bookingDetails.agentName}
                                </p>
                                <p style="color: #4b5563; margin-bottom: 8px;">
                                    <strong>Contact Phone:</strong> ${bookingDetails.agentPhone}
                                </p>
                                <p style="color: #4b5563;">
                                    <strong>Meeting Point:</strong> ${bookingDetails.meetingPoint}
                                </p>
                            </div>
                            
                            <div style="margin-top: 32px; padding: 24px; background: #fffbeb; border-radius: 8px; border: 1px solid #fbbf24;">
                                <h4 style="color: #92400e; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                                    📋 Important Notes
                                </h4>
                                <ul style="color: #92400e; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                                    <li>Please arrive 5-10 minutes before your scheduled time</li>
                                    <li>Bring a valid ID for verification</li>
                                    <li>Contact the agent directly if you're running late</li>
                                    <li>Cancel at least 24 hours in advance if needed</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin-top: 40px;">
                                <a href="${bookingLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white !important; padding: 16px 48px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px;">
                                    View Booking Details
                                </a>
                            </div>
                        </div>
                        
                        <div style="background-color: #111827; padding: 40px; text-align: center; color: #9ca3af; border-top: 1px solid #374151;">
                            <div style="font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 16px;">
                                KajaYangu
                            </div>
                            <p style="color: #d1d5db; font-size: 14px; margin-bottom: 24px;">
                                Kenya's Premier Property Platform
                            </p>
                            <div style="color: #6b7280; font-size: 12px;">
                                <p>&copy; ${new Date().getFullYear()} KajaYangu Ltd. All rights reserved.</p>
                                <p style="margin-top: 8px;">
                                    Need to reschedule or cancel? <a href="${bookingLink}" style="color: #10b981; text-decoration: none;">Manage Booking</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Booking Confirmed - KajaYangu\n\nHello ${username},\n\nYour property viewing has been successfully confirmed!\n\n📅 BOOKING DETAILS\nProperty: ${bookingDetails.propertyTitle}\nLocation: ${bookingDetails.propertyLocation}\nDate: ${bookingDetails.bookingDate}\nTime: ${bookingDetails.bookingTime}\nBooking ID: ${bookingDetails.bookingId}\n\n🤝 AGENT INFORMATION\nAgent Name: ${bookingDetails.agentName}\nContact Phone: ${bookingDetails.agentPhone}\nMeeting Point: ${bookingDetails.meetingPoint}\n\n📋 IMPORTANT NOTES\n• Arrive 5-10 minutes before scheduled time\n• Bring valid ID for verification\n• Contact agent if running late\n• Cancel 24+ hours in advance if needed\n\nView Booking: ${bookingLink}\nManage Booking: ${bookingLink}\n\nKajaYangu - Kenya's Premier Property Platform`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Booking confirmation sent to:', email);
        }
        catch (error) {
            console.error('❌ Failed to send booking confirmation:', error);
            throw error;
        }
    }
    // Test email connection
    static async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email server connection verified');
            // Try sending a test email
            const testMailOptions = {
                from: `"KajaYangu" <${env.SMTP_FROM_EMAIL}>`,
                to: env.SMTP_FROM_EMAIL,
                subject: '✅ Email Configuration Test - KajaYangu',
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px; text-align: center; color: white; border-radius: 12px 12px 0 0; margin: -40px -40px 40px -40px;">
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700;">✅ Email Test Successful!</h1>
                            <p style="font-size: 18px; opacity: 0.9; margin-top: 12px;">Your KajaYangu email configuration is working perfectly</p>
                        </div>
                        
                        <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Configuration Details</h2>
                        
                        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                                <div>
                                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">SMTP Host</p>
                                    <p style="color: #1f2937; font-weight: 600;">${env.SMTP_HOST}</p>
                                </div>
                                <div>
                                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">SMTP Port</p>
                                    <p style="color: #1f2937; font-weight: 600;">${env.SMTP_PORT}</p>
                                </div>
                                <div>
                                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">From Email</p>
                                    <p style="color: #1f2937; font-weight: 600;">${env.SMTP_FROM_EMAIL}</p>
                                </div>
                                <div>
                                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Frontend URL</p>
                                    <p style="color: #1f2937; font-weight: 600;">${env.FRONTEND_URL}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                            <h3 style="color: #0c4a6e; font-size: 18px; font-weight: 600; margin-bottom: 16px;">🎉 All Systems Operational</h3>
                            <ul style="color: #0c4a6e; list-style: none; padding: 0;">
                                <li style="margin-bottom: 8px; display: flex; align-items: center;">
                                    <span style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">✓</span>
                                    Account verification emails
                                </li>
                                <li style="margin-bottom: 8px; display: flex; align-items: center;">
                                    <span style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">✓</span>
                                    Password reset emails
                                </li>
                                <li style="margin-bottom: 8px; display: flex; align-items: center;">
                                    <span style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">✓</span>
                                    Welcome emails
                                </li>
                                <li style="margin-bottom: 8px; display: flex; align-items: center;">
                                    <span style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">✓</span>
                                    Security alerts
                                </li>
                                <li style="margin-bottom: 8px; display: flex; align-items: center;">
                                    <span style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">✓</span>
                                    Property notifications
                                </li>
                                <li style="display: flex; align-items: center;">
                                    <span style="background: #10b981; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">✓</span>
                                    Booking confirmations
                                </li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                Test Time: ${new Date().toISOString()}<br>
                                This is an automated test email from KajaYangu backend system.
                            </p>
                        </div>
                    </div>
                `,
                text: `✅ Email Configuration Test - KajaYangu\n\nYour email configuration is working correctly.\n\nCONFIGURATION DETAILS:\nSMTP Host: ${env.SMTP_HOST}\nSMTP Port: ${env.SMTP_PORT}\nFrom: ${env.SMTP_FROM_EMAIL}\nFrontend URL: ${env.FRONTEND_URL}\n\nALL SYSTEMS OPERATIONAL:\n✓ Account verification emails\n✓ Password reset emails\n✓ Welcome emails\n✓ Security alerts\n✓ Property notifications\n✓ Booking confirmations\n\nTest Time: ${new Date().toISOString()}\n\nThis is an automated test email from KajaYangu backend.`
            };
            await this.transporter.sendMail(testMailOptions);
            console.log('✅ Test email sent successfully');
            return true;
        }
        catch (error) {
            console.error('❌ Email server connection failed:', error.message);
            if (error.code) {
                console.error('Error code:', error.code);
            }
            return false;
        }
    }
    // Send test email to verify functionality
    static async sendTestEmail(toEmail) {
        const testToken = 'test-token-' + Date.now();
        const testLink = `${env.FRONTEND_URL}/test?token=${testToken}`;
        const mailOptions = {
            from: `"KajaYangu Support" <${env.SMTP_FROM_EMAIL}>`,
            to: toEmail,
            subject: 'Test Email - KajaYangu Email System',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
                    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 48px 40px; text-align: center; color: white; border-radius: 12px 12px 0 0; margin: -40px -40px 40px -40px;">
                        <h1 style="margin: 0; font-size: 36px; font-weight: 700;">📧 KajaYangu Email System Test</h1>
                        <p style="font-size: 18px; opacity: 0.9; margin-top: 12px;">Email functionality verification</p>
                    </div>
                    
                    <h2 style="color: #1f2937; font-size: 24px; font-weight: 600; margin-bottom: 20px;">Configuration Status: ✅ Working</h2>
                    <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px; line-height: 1.6;">
                        This test email confirms that your KajaYangu email system is configured correctly and ready to send all types of notification emails.
                    </p>
                    
                    <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 32px 0;">
                        <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Test Information</h3>
                        <div style="display: grid; gap: 12px;">
                            <div>
                                <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Test Link</p>
                                <a href="${testLink}" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">${testLink}</a>
                            </div>
                            <div>
                                <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Test Token</p>
                                <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${testToken}</code>
                            </div>
                            <div>
                                <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Test Time</p>
                                <p style="color: #1f2937; font-weight: 500;">${new Date().toISOString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                        <h3 style="color: #0c4a6e; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Available Email Types</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <div style="color: #10b981; font-size: 20px; margin-bottom: 8px;">✅</div>
                                <p style="color: #1f2937; font-weight: 600; margin: 0; font-size: 14px;">Account Verification</p>
                            </div>
                            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <div style="color: #10b981; font-size: 20px; margin-bottom: 8px;">✅</div>
                                <p style="color: #1f2937; font-weight: 600; margin: 0; font-size: 14px;">Password Reset</p>
                            </div>
                            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <div style="color: #10b981; font-size: 20px; margin-bottom: 8px;">✅</div>
                                <p style="color: #1f2937; font-weight: 600; margin: 0; font-size: 14px;">Welcome Emails</p>
                            </div>
                            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <div style="color: #10b981; font-size: 20px; margin-bottom: 8px;">✅</div>
                                <p style="color: #1f2937; font-weight: 600; margin: 0; font-size: 14px;">Security Alerts</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 24px; background: #f8fafc; border-radius: 8px;">
                        <p style="color: #4b5563; font-size: 14px; margin: 0;">
                            <strong>Configuration:</strong> SMTP Host: ${env.SMTP_HOST}, Port: ${env.SMTP_PORT}<br>
                            <span style="font-size: 12px; color: #6b7280;">This is a test email from KajaYangu backend system</span>
                        </p>
                    </div>
                </div>
            `,
            text: `KajaYangu Email System Test\n\nThis test email confirms your email configuration is working.\n\nTEST INFORMATION:\nTest Link: ${testLink}\nTest Token: ${testToken}\nTest Time: ${new Date().toISOString()}\n\nAVAILABLE EMAIL TYPES:\n✅ Account verification emails\n✅ Password reset emails\n✅ Welcome emails\n✅ Security alerts\n✅ Property notifications\n✅ Booking confirmations\n\nIf you're receiving this, all email functionalities are working!\n\nConfiguration: SMTP Host: ${env.SMTP_HOST}, Port: ${env.SMTP_PORT}\n\nThis is a test email from KajaYangu backend.`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Test email sent to:', toEmail);
        }
        catch (error) {
            console.error('❌ Failed to send test email:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=email.js.map