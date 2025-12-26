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
    private db;
    constructor();
    private getDb;
    createVerification(data: CreateVerificationInput): Promise<AgentVerification>;
    createVerificationForUser(data: CreateVerificationInput): Promise<AgentVerification>;
    getVerificationById(verificationId: string): Promise<AgentVerification | null>;
    getVerificationByUserId(userId: string): Promise<AgentVerification | null>;
    getAllVerifications(page?: number, limit?: number, status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<{
        verifications: AgentVerification[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateVerification(verificationId: string, data: UpdateVerificationInput, reviewerId: string): Promise<AgentVerification | null>;
    approveVerification(verificationId: string, reviewerId: string, reviewNotes?: string): Promise<AgentVerification | null>;
    rejectVerification(verificationId: string, reviewerId: string, reviewNotes?: string): Promise<AgentVerification | null>;
    getVerificationStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    }>;
    deleteVerification(verificationId: string): Promise<boolean>;
    bulkApproveVerifications(verificationIds: string[], reviewerId: string, reviewNotes?: string): Promise<AgentVerification[]>;
    bulkRejectVerifications(verificationIds: string[], reviewerId: string, reviewNotes?: string): Promise<AgentVerification[]>;
}
export declare const agentVerificationService: AgentVerificationService;
//# sourceMappingURL=agentService.d.ts.map