export declare class UserValidators {
    static validateUsername(username: string): {
        isValid: boolean;
        error?: string;
    };
    static validateEmail(email: string): {
        isValid: boolean;
        error?: string;
    };
    static validatePhoneNumber(phone: string): {
        isValid: boolean;
        error?: string;
    };
    static validatePassword(password: string): {
        isValid: boolean;
        error?: string;
    };
    static validateFullName(fullName: string): {
        isValid: boolean;
        error?: string;
    };
    static validateRole(role: string): {
        isValid: boolean;
        error?: string;
    };
    static validateAgentStatus(status: string): {
        isValid: boolean;
        error?: string;
    };
}
export declare class ValidationUtils {
    static sanitizeInput(input: string): string;
    static isValidUUID(uuid: string): boolean;
}
//# sourceMappingURL=validators.d.ts.map