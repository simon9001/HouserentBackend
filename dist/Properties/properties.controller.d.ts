import { Context } from 'hono';
export declare const createProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PropertyId: string;
        OwnerId: string;
        Title: string;
        Description: string;
        RentAmount: number;
        DepositAmount: number | null;
        County: string;
        Constituency: string | null;
        Area: string;
        StreetAddress: string | null;
        Latitude: number | null;
        Longitude: number | null;
        PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
        Bedrooms: number | null;
        Bathrooms: number | null;
        Rules: string | null;
        IsAvailable: boolean;
        IsVerified: boolean;
        IsBoosted: boolean;
        BoostExpiry: string | null;
        CreatedAt: string;
        UpdatedAt: string;
        OwnerName?: string | undefined;
        OwnerEmail?: string | undefined;
        OwnerPhoneNumber?: string | undefined;
        OwnerTrustScore?: number | undefined;
        OwnerAgentStatus?: string | undefined;
    };
}, 201, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getPropertyById: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 404, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        PropertyId: string;
        OwnerId: string;
        Title: string;
        Description: string;
        RentAmount: number;
        DepositAmount: number | null;
        County: string;
        Constituency: string | null;
        Area: string;
        StreetAddress: string | null;
        Latitude: number | null;
        Longitude: number | null;
        PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
        Bedrooms: number | null;
        Bathrooms: number | null;
        Rules: string | null;
        IsAvailable: boolean;
        IsVerified: boolean;
        IsBoosted: boolean;
        BoostExpiry: string | null;
        CreatedAt: string;
        UpdatedAt: string;
        OwnerName?: string | undefined;
        OwnerEmail?: string | undefined;
        OwnerPhoneNumber?: string | undefined;
        OwnerTrustScore?: number | undefined;
        OwnerAgentStatus?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const getPropertiesByOwner: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        properties: {
            PropertyId: string;
            OwnerId: string;
            Title: string;
            Description: string;
            RentAmount: number;
            DepositAmount: number | null;
            County: string;
            Constituency: string | null;
            Area: string;
            StreetAddress: string | null;
            Latitude: number | null;
            Longitude: number | null;
            PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
            Bedrooms: number | null;
            Bathrooms: number | null;
            Rules: string | null;
            IsAvailable: boolean;
            IsVerified: boolean;
            IsBoosted: boolean;
            BoostExpiry: string | null;
            CreatedAt: string;
            UpdatedAt: string;
            OwnerName?: string | undefined;
            OwnerEmail?: string | undefined;
            OwnerPhoneNumber?: string | undefined;
            OwnerTrustScore?: number | undefined;
            OwnerAgentStatus?: string | undefined;
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
export declare const getAllProperties: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        properties: {
            PropertyId: string;
            OwnerId: string;
            Title: string;
            Description: string;
            RentAmount: number;
            DepositAmount: number | null;
            County: string;
            Constituency: string | null;
            Area: string;
            StreetAddress: string | null;
            Latitude: number | null;
            Longitude: number | null;
            PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
            Bedrooms: number | null;
            Bathrooms: number | null;
            Rules: string | null;
            IsAvailable: boolean;
            IsVerified: boolean;
            IsBoosted: boolean;
            BoostExpiry: string | null;
            CreatedAt: string;
            UpdatedAt: string;
            OwnerName?: string | undefined;
            OwnerEmail?: string | undefined;
            OwnerPhoneNumber?: string | undefined;
            OwnerTrustScore?: number | undefined;
            OwnerAgentStatus?: string | undefined;
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
export declare const updateProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PropertyId: string;
        OwnerId: string;
        Title: string;
        Description: string;
        RentAmount: number;
        DepositAmount: number | null;
        County: string;
        Constituency: string | null;
        Area: string;
        StreetAddress: string | null;
        Latitude: number | null;
        Longitude: number | null;
        PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
        Bedrooms: number | null;
        Bathrooms: number | null;
        Rules: string | null;
        IsAvailable: boolean;
        IsVerified: boolean;
        IsBoosted: boolean;
        BoostExpiry: string | null;
        CreatedAt: string;
        UpdatedAt: string;
        OwnerName?: string | undefined;
        OwnerEmail?: string | undefined;
        OwnerPhoneNumber?: string | undefined;
        OwnerTrustScore?: number | undefined;
        OwnerAgentStatus?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const deleteProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const getPropertyStatistics: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        total: number;
        available: number;
        rented: number;
        verified: number;
        boosted: number;
        byType: {
            [x: string]: number;
        };
        byCounty: {
            [x: string]: number;
        };
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">)>;
export declare const searchProperties: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 400, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    data: {
        properties: {
            PropertyId: string;
            OwnerId: string;
            Title: string;
            Description: string;
            RentAmount: number;
            DepositAmount: number | null;
            County: string;
            Constituency: string | null;
            Area: string;
            StreetAddress: string | null;
            Latitude: number | null;
            Longitude: number | null;
            PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
            Bedrooms: number | null;
            Bathrooms: number | null;
            Rules: string | null;
            IsAvailable: boolean;
            IsVerified: boolean;
            IsBoosted: boolean;
            BoostExpiry: string | null;
            CreatedAt: string;
            UpdatedAt: string;
            OwnerName?: string | undefined;
            OwnerEmail?: string | undefined;
            OwnerPhoneNumber?: string | undefined;
            OwnerTrustScore?: number | undefined;
            OwnerAgentStatus?: string | undefined;
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
export declare const verifyProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PropertyId: string;
        OwnerId: string;
        Title: string;
        Description: string;
        RentAmount: number;
        DepositAmount: number | null;
        County: string;
        Constituency: string | null;
        Area: string;
        StreetAddress: string | null;
        Latitude: number | null;
        Longitude: number | null;
        PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
        Bedrooms: number | null;
        Bathrooms: number | null;
        Rules: string | null;
        IsAvailable: boolean;
        IsVerified: boolean;
        IsBoosted: boolean;
        BoostExpiry: string | null;
        CreatedAt: string;
        UpdatedAt: string;
        OwnerName?: string | undefined;
        OwnerEmail?: string | undefined;
        OwnerPhoneNumber?: string | undefined;
        OwnerTrustScore?: number | undefined;
        OwnerAgentStatus?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
export declare const boostProperty: (c: Context) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    error: string;
}, 500, "json">) | (Response & import("hono").TypedResponse<{
    success: true;
    message: string;
    data: {
        PropertyId: string;
        OwnerId: string;
        Title: string;
        Description: string;
        RentAmount: number;
        DepositAmount: number | null;
        County: string;
        Constituency: string | null;
        Area: string;
        StreetAddress: string | null;
        Latitude: number | null;
        Longitude: number | null;
        PropertyType: "APARTMENT" | "HOUSE" | "COMMERCIAL" | "LAND" | "OTHER";
        Bedrooms: number | null;
        Bathrooms: number | null;
        Rules: string | null;
        IsAvailable: boolean;
        IsVerified: boolean;
        IsBoosted: boolean;
        BoostExpiry: string | null;
        CreatedAt: string;
        UpdatedAt: string;
        OwnerName?: string | undefined;
        OwnerEmail?: string | undefined;
        OwnerPhoneNumber?: string | undefined;
        OwnerTrustScore?: number | undefined;
        OwnerAgentStatus?: string | undefined;
    };
}, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
    success: false;
    error: any;
}, 400, "json">)>;
//# sourceMappingURL=properties.controller.d.ts.map