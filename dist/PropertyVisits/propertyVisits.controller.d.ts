import { Context } from 'hono';
export declare const createVisit: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        visit_id: string;
        property_id: string;
        tenant_id: string;
        agent_id: string;
        visit_date: string;
        visit_purpose: string;
        tenant_notes: string;
        agent_notes: string;
        check_in_time: string | null;
        check_out_time: string | null;
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        created_at: string;
        updated_at: string;
        property_title?: string | undefined;
        tenant_name?: string | undefined;
        agent_name?: string | undefined;
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
        visit_id: string;
        property_id: string;
        tenant_id: string;
        agent_id: string;
        visit_date: string;
        visit_purpose: string;
        tenant_notes: string;
        agent_notes: string;
        check_in_time: string | null;
        check_out_time: string | null;
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        created_at: string;
        updated_at: string;
        property_title?: string | undefined;
        tenant_name?: string | undefined;
        agent_name?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getVisitsByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        visit_id: string;
        property_id: string;
        tenant_id: string;
        agent_id: string;
        visit_date: string;
        visit_purpose: string;
        tenant_notes: string;
        agent_notes: string;
        check_in_time: string | null;
        check_out_time: string | null;
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        created_at: string;
        updated_at: string;
        property_title?: string | undefined;
        tenant_name?: string | undefined;
        agent_name?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getVisitsByUserId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        visit_id: string;
        property_id: string;
        tenant_id: string;
        agent_id: string;
        visit_date: string;
        visit_purpose: string;
        tenant_notes: string;
        agent_notes: string;
        check_in_time: string | null;
        check_out_time: string | null;
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        created_at: string;
        updated_at: string;
        property_title?: string | undefined;
        tenant_name?: string | undefined;
        agent_name?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updateVisit: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        visit_id: string;
        property_id: string;
        tenant_id: string;
        agent_id: string;
        visit_date: string;
        visit_purpose: string;
        tenant_notes: string;
        agent_notes: string;
        check_in_time: string | null;
        check_out_time: string | null;
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        created_at: string;
        updated_at: string;
        property_title?: string | undefined;
        tenant_name?: string | undefined;
        agent_name?: string | undefined;
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
        visit_id: string;
        property_id: string;
        tenant_id: string;
        agent_id: string;
        visit_date: string;
        visit_purpose: string;
        tenant_notes: string;
        agent_notes: string;
        check_in_time: string | null;
        check_out_time: string | null;
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT" | "NO_SHOW";
        created_at: string;
        updated_at: string;
        property_title?: string | undefined;
        tenant_name?: string | undefined;
        agent_name?: string | undefined;
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