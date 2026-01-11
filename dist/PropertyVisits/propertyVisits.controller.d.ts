import { Context } from 'hono';
export declare const createVisit: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VisitId: string;
        PropertyId: string;
        TenantId: string;
        AgentId: string;
        VisitDate: string;
        VisitPurpose: string;
        TenantNotes: string;
        AgentNotes: string;
        CheckInTime: string | null;
        CheckOutTime: string | null;
        Status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        CreatedAt: string;
        UpdatedAt: string;
        PropertyTitle?: string | undefined;
        TenantName?: string | undefined;
        AgentName?: string | undefined;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getVisitById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        VisitId: string;
        PropertyId: string;
        TenantId: string;
        AgentId: string;
        VisitDate: string;
        VisitPurpose: string;
        TenantNotes: string;
        AgentNotes: string;
        CheckInTime: string | null;
        CheckOutTime: string | null;
        Status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        CreatedAt: string;
        UpdatedAt: string;
        PropertyTitle?: string | undefined;
        TenantName?: string | undefined;
        AgentName?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getVisitsByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        VisitId: string;
        PropertyId: string;
        TenantId: string;
        AgentId: string;
        VisitDate: string;
        VisitPurpose: string;
        TenantNotes: string;
        AgentNotes: string;
        CheckInTime: string | null;
        CheckOutTime: string | null;
        Status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        CreatedAt: string;
        UpdatedAt: string;
        PropertyTitle?: string | undefined;
        TenantName?: string | undefined;
        AgentName?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getVisitsByUserId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        VisitId: string;
        PropertyId: string;
        TenantId: string;
        AgentId: string;
        VisitDate: string;
        VisitPurpose: string;
        TenantNotes: string;
        AgentNotes: string;
        CheckInTime: string | null;
        CheckOutTime: string | null;
        Status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        CreatedAt: string;
        UpdatedAt: string;
        PropertyTitle?: string | undefined;
        TenantName?: string | undefined;
        AgentName?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateVisit: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        VisitId: string;
        PropertyId: string;
        TenantId: string;
        AgentId: string;
        VisitDate: string;
        VisitPurpose: string;
        TenantNotes: string;
        AgentNotes: string;
        CheckInTime: string | null;
        CheckOutTime: string | null;
        Status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        CreatedAt: string;
        UpdatedAt: string;
        PropertyTitle?: string | undefined;
        TenantName?: string | undefined;
        AgentName?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const cancelVisit: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const checkIn: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const checkOut: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getUpcomingVisits: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        VisitId: string;
        PropertyId: string;
        TenantId: string;
        AgentId: string;
        VisitDate: string;
        VisitPurpose: string;
        TenantNotes: string;
        AgentNotes: string;
        CheckInTime: string | null;
        CheckOutTime: string | null;
        Status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        CreatedAt: string;
        UpdatedAt: string;
        PropertyTitle?: string | undefined;
        TenantName?: string | undefined;
        AgentName?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getVisitStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        total: number;
        confirmed: number;
        cancelled: number;
        checkedIn: number;
        checkedOut: number;
        noShow: number;
        upcoming: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=propertyVisits.controller.d.ts.map