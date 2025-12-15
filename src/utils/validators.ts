import validator from 'validator';

export class UserValidators {
    // Validate username
    static validateUsername(username: string): { isValid: boolean; error?: string } {
        if (!username || username.trim().length === 0) {
            return { isValid: false, error: 'Username is required' };
        }
        if (username.length < 3 || username.length > 50) {
            return { isValid: false, error: 'Username must be between 3 and 50 characters' };
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
            return { isValid: false, error: 'Username can only contain letters, numbers, dots, underscores, and hyphens' };
        }
        return { isValid: true };
    }

    // Validate email
    static validateEmail(email: string): { isValid: boolean; error?: string } {
        if (!email || email.trim().length === 0) {
            return { isValid: false, error: 'Email is required' };
        }
        if (!validator.isEmail(email)) {
            return { isValid: false, error: 'Invalid email format' };
        }
        return { isValid: true };
    }

    // Validate phone number (Kenyan format)
    static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
        if (!phone || phone.trim().length === 0) {
            return { isValid: false, error: 'Phone number is required' };
        }
        
        // Clean phone number
        const cleanedPhone = phone.replace(/\D/g, '');
        
        // Check if it starts with 254 (Kenyan country code)
        if (cleanedPhone.length === 12 && cleanedPhone.startsWith('254')) {
            return { isValid: true };
        }
        
        // Check if it starts with 0 and would be 10 digits including 254
        if (cleanedPhone.length === 10 && cleanedPhone.startsWith('0')) {
            return { isValid: true };
        }
        
        // Check if it starts with +254
        if (cleanedPhone.length === 12 && cleanedPhone.startsWith('254')) {
            return { isValid: true };
        }
        
        return { isValid: false, error: 'Invalid Kenyan phone number format' };
    }

    // Validate password
    static validatePassword(password: string): { isValid: boolean; error?: string } {
        if (!password || password.length === 0) {
            return { isValid: false, error: 'Password is required' };
        }
        if (password.length < 8) {
            return { isValid: false, error: 'Password must be at least 8 characters long' };
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return { isValid: false, error: 'Password must contain at least one lowercase letter' };
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return { isValid: false, error: 'Password must contain at least one uppercase letter' };
        }
        if (!/(?=.*\d)/.test(password)) {
            return { isValid: false, error: 'Password must contain at least one number' };
        }
        return { isValid: true };
    }

    // Validate full name
    static validateFullName(fullName: string): { isValid: boolean; error?: string } {
        if (!fullName || fullName.trim().length === 0) {
            return { isValid: false, error: 'Full name is required' };
        }
        if (fullName.trim().length < 2 || fullName.trim().length > 150) {
            return { isValid: false, error: 'Full name must be between 2 and 150 characters' };
        }
        return { isValid: true };
    }

    // Validate role
    static validateRole(role: string): { isValid: boolean; error?: string } {
        const validRoles = ['TENANT', 'AGENT', 'ADMIN'];
        if (!validRoles.includes(role.toUpperCase())) {
            return { isValid: false, error: `Role must be one of: ${validRoles.join(', ')}` };
        }
        return { isValid: true };
    }

    // Validate agent status
    static validateAgentStatus(status: string): { isValid: boolean; error?: string } {
        const validStatuses = ['NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return { isValid: false, error: `Agent status must be one of: ${validStatuses.join(', ')}` };
        }
        return { isValid: true };
    }
}

export class ValidationUtils {
    // Sanitize input
    static sanitizeInput(input: string): string {
        return validator.trim(validator.escape(input));
    }

    // Validate UUID
    static isValidUUID(uuid: string): boolean {
        return validator.isUUID(uuid);
    }
}