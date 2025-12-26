// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '../Database/envConfig.js';
export class JWTUtils {
    // Generate access token
    static generateAccessToken(payload) {
        return jwt.sign({
            userId: payload.userId,
            username: payload.username,
            email: payload.email,
            role: payload.role,
            type: 'access'
        }, env.JWT_SECRET, // Add type assertion
        { expiresIn: env.JWT_EXPIRES_IN } // Add type assertion
        );
    }
    // Generate refresh token
    static generateRefreshToken(payload) {
        return jwt.sign({
            userId: payload.userId,
            username: payload.username,
            email: payload.email,
            role: payload.role,
            type: 'refresh'
        }, env.JWT_REFRESH_SECRET, // Add type assertion
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN } // Add type assertion
        );
    }
    // Verify access token
    static verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            return {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            console.error('JWT verification error:', error);
            return null;
        }
    }
    // Verify refresh token
    static verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
            return {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            console.error('Refresh token verification error:', error);
            return null;
        }
    }
    // Generate email verification token
    static generateEmailVerificationToken(email) {
        return jwt.sign({ email, type: 'email_verification' }, env.JWT_SECRET, { expiresIn: '24h' });
    }
    // Verify email verification token
    static verifyEmailVerificationToken(token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            return { email: decoded.email };
        }
        catch (error) {
            return null;
        }
    }
    // Generate password reset token
    static generatePasswordResetToken(userId) {
        return jwt.sign({ userId, type: 'password_reset' }, env.JWT_SECRET, { expiresIn: '1h' });
    }
    // Verify password reset token
    static verifyPasswordResetToken(token) {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            return { userId: decoded.userId };
        }
        catch (error) {
            return null;
        }
    }
}
//# sourceMappingURL=jwt.js.map