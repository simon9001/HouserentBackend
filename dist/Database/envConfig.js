import dotenv from 'dotenv';
import assert from 'assert';
dotenv.config();
// Validate required environment variables
export const validateEnv = () => {
    const { DB_USER, DB_PASSWORD, DB_SERVER, DB_DATABASE, JWT_SECRET, JWT_REFRESH_SECRET, SMTP_USER, SMTP_PASS } = process.env;
    try {
        assert(DB_USER, 'DB_USER is required');
        assert(DB_PASSWORD, 'DB_PASSWORD is required');
        assert(DB_SERVER, 'DB_SERVER is required');
        assert(DB_DATABASE, 'DB_DATABASE is required');
        assert(JWT_SECRET, 'JWT_SECRET is required');
        assert(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET is required');
        assert(SMTP_USER, 'SMTP_USER is required');
        assert(SMTP_PASS, 'SMTP_PASS is required');
        console.log('✅ All required environment variables are set');
        return true;
    }
    catch (error) {
        console.error('❌ Environment configuration error:', error.message);
        process.exit(1);
    }
};
// Export validated environment variables with proper typing
export const env = {
    // Database
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SERVER: process.env.DB_SERVER,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_PORT: parseInt(process.env.DB_PORT || '1433'),
    // JWT
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // Security
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    ACCOUNT_LOCKOUT_MINUTES: parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES || '30'),
    PASSWORD_RESET_TOKEN_EXPIRY: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '15'),
    // Email
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'KajaYangu',
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '8000'),
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    APP_NAME: process.env.APP_NAME || 'KajaYangu',
    APP_URL: process.env.APP_URL || 'http://localhost:8000'
};
// Validate on import
validateEnv();
//# sourceMappingURL=envConfig.js.map