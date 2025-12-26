export interface User {
    UserId: string;
    Username: string;
    PasswordHash: string;
    FullName: string;
    PhoneNumber: string;
    Email: string;
    Role: 'TENANT' | 'AGENT' | 'ADMIN';
    AgentStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    TrustScore: number;
    IsActive: boolean;
    IsEmailVerified: boolean;
    LoginAttempts: number;
    LastLogin: Date | null;
    LockedUntil: Date | null;
    CreatedAt: Date;
    UpdatedAt: Date;
}
export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role?: 'TENANT' | 'AGENT' | 'ADMIN';
}
export interface UpdateUserInput {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    role?: 'TENANT' | 'AGENT' | 'ADMIN';
    agentStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    trustScore?: number;
    isActive?: boolean;
}
export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    tenants: number;
    agents: number;
    admins: number;
    pendingAgents: number;
    suspendedUsers: number;
    verifiedEmails: number;
}
export declare class UsersService {
    private db;
    constructor();
    private getDb;
    createUser(data: CreateUserInput): Promise<User>;
    getAllUsers(page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUserById(userId: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserByPhoneNumber(phoneNumber: string): Promise<User | null>;
    updateUser(userId: string, data: UpdateUserInput): Promise<User | null>;
    updateUserPassword(userId: string, newPassword: string): Promise<boolean>;
    updateLoginAttempts(userId: string, successful?: boolean): Promise<void>;
    verifyEmail(userId: string): Promise<boolean>;
    deleteUser(userId: string): Promise<boolean>;
    getUserStatistics(): Promise<UserStatistics>;
    searchUsers(searchTerm: string, page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUsersByRole(role: 'TENANT' | 'AGENT' | 'ADMIN', page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
export declare const usersService: UsersService;
//# sourceMappingURL=userService.d.ts.map