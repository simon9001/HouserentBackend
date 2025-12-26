// src/utils/jwt.ts
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
                userId: payload.userId,
                username: payload.username,
                email: payload.email,
                role: payload.role,
                type: 'access' 
            },
            env.JWT_SECRET as jwt.Secret, // Add type assertion
            { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] } // Add type assertion
        );
    }

    // Generate refresh token
    static generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(
            { 
                userId: payload.userId,
                username: payload.username,
                email: payload.email,
                role: payload.role,
                type: 'refresh' 
            },
            env.JWT_REFRESH_SECRET as jwt.Secret, // Add type assertion
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] } // Add type assertion
        );
    }

    // Verify access token
    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as any;
            
            return {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            console.error('JWT verification error:', error);
            return null;
        }
    }

    // Verify refresh token
    static verifyRefreshToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret) as any;
            
            return {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            console.error('Refresh token verification error:', error);
            return null;
        }
    }

    // Generate email verification token
    static generateEmailVerificationToken(email: string): string {
        return jwt.sign(
            { email, type: 'email_verification' },
            env.JWT_SECRET as jwt.Secret,
            { expiresIn: '24h' as jwt.SignOptions['expiresIn'] }
        );
    }

    // Verify email verification token
    static verifyEmailVerificationToken(token: string): { email: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as { email: string; type: string };
            return { email: decoded.email };
        } catch (error) {
            return null;
        }
    }

    // Generate password reset token
    static generatePasswordResetToken(userId: string): string {
        return jwt.sign(
            { userId, type: 'password_reset' },
            env.JWT_SECRET as jwt.Secret,
            { expiresIn: '1h' as jwt.SignOptions['expiresIn'] }
        );
    }

    // Verify password reset token
    static verifyPasswordResetToken(token: string): { userId: string } | null {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as { userId: string; type: string };
            return { userId: decoded.userId };
        } catch (error) {
            return null;
        }
    }
}