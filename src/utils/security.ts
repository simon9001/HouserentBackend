// In your src/utils/security.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../Database/envConfig.js';

export class SecurityUtils {
    // Hash password
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
        return await bcrypt.hash(password, salt);
    }

    // Compare password
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    // Hash token (for storing in database)
    static hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    // Generate random token
    static generateRandomToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    // Generate numeric OTP
    static generateOTP(length: number = 6): string {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    }
}