// In your src/utils/security.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../Database/envConfig.js';
export class SecurityUtils {
    // Hash password
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
        return await bcrypt.hash(password, salt);
    }
    // Compare password
    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    // Hash token (for storing in database)
    static hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    // Generate random token
    static generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    // Generate numeric OTP
    static generateOTP(length = 6) {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    }
}
//# sourceMappingURL=security.js.map