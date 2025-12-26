import { AuthContext } from './agentRoutes.js';
export declare const createVerification: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getVerificationById: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getVerificationByUserId: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getAllVerifications: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        verifications: {
            VerificationId: string;
            UserId: string;
            NationalId: string;
            SelfieUrl: string;
            IdFrontUrl: string;
            IdBackUrl: string | null;
            PropertyProofUrl: string | null;
            ReviewedBy: string | null;
            ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
            ReviewNotes: string | null;
            SubmittedAt: string;
            ReviewedAt: string | null;
        }[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const updateVerification: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const approveVerification: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const rejectVerification: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const bulkApproveVerifications: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const bulkRejectVerifications: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VerificationId: string;
        UserId: string;
        NationalId: string;
        SelfieUrl: string;
        IdFrontUrl: string;
        IdBackUrl: string | null;
        PropertyProofUrl: string | null;
        ReviewedBy: string | null;
        ReviewStatus: "PENDING" | "APPROVED" | "REJECTED";
        ReviewNotes: string | null;
        SubmittedAt: string;
        ReviewedAt: string | null;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getVerificationStatistics: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const deleteVerification: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const testAuth: (c: AuthContext) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 401, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    user: {
        userId: string;
        username: string;
        role: "TENANT" | "AGENT" | "ADMIN";
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
//# sourceMappingURL=agentController.d.ts.map