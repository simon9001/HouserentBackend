export interface AgentVerification {
    VerificationId: string;
    UserId: string;
    NationalId: string;
    SelfieUrl: string;
    IdFrontUrl: string;
    IdBackUrl: string | null;
    PropertyProofUrl: string | null;
    ReviewedBy: string | null;
    ReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    ReviewNotes: string | null;
    SubmittedAt: Date;
    ReviewedAt: Date | null;
    UserFullName?: string;
    UserEmail?: string;
    UserPhoneNumber?: string;
    UserRole?: string;
    UserAgentStatus?: string;
    ReviewerFullName?: string;
}
export interface CreateVerificationInput {
    userId: string;
    nationalId: string;
    selfieUrl: string;
    idFrontUrl: string;
    idBackUrl?: string;
    propertyProofUrl?: string;
}
export interface UpdateVerificationInput {
    reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
    reviewedBy?: string;
}
export declare class AgentVerificationService {
    createVerification(data: CreateVerificationInput): Promise<AgentVerification>;
    private createVerificationWithUserData;
    getVerificationById(verificationId: string): Promise<AgentVerification | null>;
    getVerificationByUserId(userId: string): Promise<AgentVerification | null>;
    private getUserDetails;
    getAllVerifications(page?: number, limit?: number, status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<{
        verifications: AgentVerification[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    private mapToCamelCase;
    updateVerification(verificationId: string, data: UpdateVerificationInput, reviewerId: string): Promise<AgentVerification | null>;
    approveVerification(verificationId: string, reviewerId: string, reviewNotes?: string): Promise<AgentVerification | null>;
    rejectVerification(verificationId: string, reviewerId: string, reviewNotes?: string): Promise<AgentVerification | null>;
    bulkApproveVerifications(verificationIds: string[], reviewerId: string, reviewNotes?: string): Promise<AgentVerification[]>;
    bulkRejectVerifications(verificationIds: string[], reviewerId: string, reviewNotes?: string): Promise<AgentVerification[]>;
    checkEligibility(userId: string): Promise<{
        canApply: boolean;
        reason: string;
        currentStatus: {
            role: string;
            agentStatus: string;
            hasVerification: boolean;
            verificationStatus?: string;
        };
    }>;
    createVerificationForUser(data: CreateVerificationInput): Promise<AgentVerification>;
    getStatusCounts(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    }>;
    getVerificationStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    }>;
    deleteVerification(verificationId: string): Promise<boolean>;
}
export declare const agentVerificationService: AgentVerificationService;
//# sourceMappingURL=agentService.d.ts.map