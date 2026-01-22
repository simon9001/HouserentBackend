// import dotenv from 'dotenv';
// import assert from 'assert';
// dotenv.config();
// // Validate required environment variables
// export const validateEnv = () => {
//     const {
//         SUPABASE_URL,
//         SUPABASE_SERVICE_KEY,
//         JWT_SECRET,
//         JWT_REFRESH_SECRET,
//         SMTP_USER,
//         SMTP_PASS
//     } = process.env;
//     try {
//         assert(SUPABASE_URL, 'SUPABASE_URL is required');
//         assert(SUPABASE_SERVICE_KEY, 'SUPABASE_SERVICE_KEY is required');
//         assert(JWT_SECRET, 'JWT_SECRET is required');
//         assert(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET is required');
//         assert(SMTP_USER, 'SMTP_USER is required');
//         assert(SMTP_PASS, 'SMTP_PASS is required');
//         console.log('✅ All required environment variables are set');
//         return true;
//     } catch (error: any) {
//         console.error('❌ Environment configuration error:', error.message);
//         process.exit(1);
//     }
// };
// // Export validated environment variables with proper typing
// export const env = {
//     // Database
//     SUPABASE_URL: process.env.SUPABASE_URL as string,
//     SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY as string,
//     // JWT
//     JWT_SECRET: process.env.JWT_SECRET as string,
//     JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
//     JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
//     JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
//     // Security
//     BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
//     MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
//     ACCOUNT_LOCKOUT_MINUTES: parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES || '30'),
//     PASSWORD_RESET_TOKEN_EXPIRY: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '15'),
//     // Email
//     SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
//     SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
//     SMTP_USER: process.env.SMTP_USER as string,
//     SMTP_PASS: process.env.SMTP_PASS as string,
//     SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER as string,
//     SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'KajaYangu',
//     // Server
//     NODE_ENV: process.env.NODE_ENV || 'development',
//     PORT: parseInt(process.env.PORT || '8000'),
//     FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
//     APP_NAME: process.env.APP_NAME || 'KajaYangu',
//     APP_URL: process.env.APP_URL || 'http://localhost:8000'
// };
// // Validate on import
// validateEnv();
import dotenv from 'dotenv';
import assert from 'assert';
dotenv.config();
// Validate required environment variables
export const validateEnv = () => {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, JWT_REFRESH_SECRET, BREVO_API_KEY, // Changed from SMTP credentials
    SMTP_FROM_EMAIL } = process.env;
    try {
        assert(SUPABASE_URL, 'SUPABASE_URL is required');
        assert(SUPABASE_SERVICE_KEY, 'SUPABASE_SERVICE_KEY is required');
        assert(JWT_SECRET, 'JWT_SECRET is required');
        assert(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET is required');
        assert(BREVO_API_KEY, 'BREVO_API_KEY is required'); // Using Brevo API key instead of SMTP
        assert(SMTP_FROM_EMAIL, 'SMTP_FROM_EMAIL is required');
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
    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
    // Brevo Configuration (API instead of SMTP)
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'KajaYangu',
    // Email Logo Configuration (optional)
    EMAIL_LOGO_URL: process.env.EMAIL_LOGO_URL || 'https://i.imgur.com/YOUR_IMAGE_ID.png',
    EMAIL_LOGO_ALT: process.env.EMAIL_LOGO_ALT || 'KajaYangu Logo',
    EMAIL_LOGO_HEIGHT: process.env.EMAIL_LOGO_HEIGHT || '40',
    // Email Colors (optional)
    EMAIL_PRIMARY_COLOR: process.env.EMAIL_PRIMARY_COLOR || '#2563eb',
    EMAIL_SUCCESS_COLOR: process.env.EMAIL_SUCCESS_COLOR || '#10b981',
    EMAIL_WARNING_COLOR: process.env.EMAIL_WARNING_COLOR || '#f59e0b',
    EMAIL_ERROR_COLOR: process.env.EMAIL_ERROR_COLOR || '#ef4444',
    // Database
    SUPABASE_URL: process.env.SUPABASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
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