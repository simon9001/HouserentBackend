import jwt from 'jsonwebtoken';
import { env } from '../Database/envConfig.js';

export interface TokenPayload {
    userId: string;
    username: string;
    email: string;
    role: 'TENANT' | 'AGENT' | 'ADMIN';
}

export class JWTUtils {
    // Generate access token
    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(
            { 
                ...payload, 
                type: 'access' 
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );
    }

    // Generate refresh token
    static generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(
            { 
                ...payload, 
                type: 'refresh' 
            },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
        );
    }

    // Verify access token
    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload & { type: string };
            return decoded;
        } catch (error) {
            return null;
        }
    }

    // Verify refresh token
    static verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload & { type: string };
            return decoded;
        } catch (error) {
            return null;
        }
    }

    // Generate email verification token
    static generateEmailVerificationToken(email: string): string {
        return jwt.sign(
            { email, type: 'email_verification' },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    // Verify email verification token
    static verifyEmailVerificationToken(token: string): { email: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { email: string; type: string };
            return decoded;
        } catch (error) {
            return null;
        }
    }

    // Generate password reset token
    static generatePasswordResetToken(userId: string): string {
        return jwt.sign(
            { userId, type: 'password_reset' },
            env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    // Verify password reset token
    static verifyPasswordResetToken(token: string): { userId: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; type: string };
            return decoded;
        } catch (error) {
            return null;
        }
    }
}