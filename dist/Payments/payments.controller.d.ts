import { Context } from 'hono';
export declare const createPayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPaymentById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPaymentsByUserId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPaymentsByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updatePayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const completePayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const failPayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const refundPayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPaymentStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        totalAmount: number;
        completedAmount: number;
        pendingAmount: number;
        failedAmount: number;
        refundedAmount: number;
        totalTransactions: number;
        completedTransactions: number;
        pendingTransactions: number;
        failedTransactions: number;
        refundedTransactions: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getRecentPayments: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const searchPayments: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        payment_id: string;
        user_id: string;
        property_id?: string | null | undefined;
        amount: number;
        currency: string;
        payment_provider: string;
        provider_reference: string;
        purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        created_at: string;
        completed_at?: string | null | undefined;
        user_name?: string | undefined;
        property_title?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=payments.controller.d.ts.map