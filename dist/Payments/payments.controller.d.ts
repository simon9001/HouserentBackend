import { Context } from 'hono';
export declare const createPayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
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
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPaymentsByUserId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPaymentsByPropertyId: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const updatePayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const completePayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const failPayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const refundPayment: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
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
        recentTransactions: number;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getRecentPayments: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const searchPayments: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PaymentId: string;
        UserId: string;
        PropertyId?: string | undefined;
        Amount: number;
        Currency: string;
        PaymentProvider: string;
        ProviderReference: string;
        Purpose: "ACCESS" | "BOOST" | "SUBSCRIPTION" | "BOOKING" | "DEPOSIT";
        Status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        CreatedAt: string;
        CompletedAt?: string | undefined;
        UserName?: string | undefined;
        PropertyTitle?: string | undefined;
    }[];
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=payments.controller.d.ts.map