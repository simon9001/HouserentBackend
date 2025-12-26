export interface Property {
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
    PropertyType: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
    Bedrooms: number | null;
    Bathrooms: number | null;
    Rules: string | null;
    IsAvailable: boolean;
    IsVerified: boolean;
    IsBoosted: boolean;
    BoostExpiry: Date | null;
    CreatedAt: Date;
    UpdatedAt: Date;
}
export interface CreatePropertyInput {
    ownerId: string;
    title: string;
    description: string;
    rentAmount: number;
    depositAmount?: number;
    county: string;
    constituency?: string;
    area: string;
    streetAddress?: string;
    latitude?: number;
    longitude?: number;
    propertyType?: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
    bedrooms?: number;
    bathrooms?: number;
    rules?: string;
}
export interface UpdatePropertyInput {
    title?: string;
    description?: string;
    rentAmount?: number;
    depositAmount?: number | null;
    county?: string;
    constituency?: string | null;
    area?: string;
    streetAddress?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    propertyType?: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
    bedrooms?: number | null;
    bathrooms?: number | null;
    rules?: string | null;
    isAvailable?: boolean;
    isVerified?: boolean;
    isBoosted?: boolean;
    boostExpiry?: Date | null;
}
export interface PropertyFilter {
    county?: string;
    area?: string;
    minRent?: number;
    maxRent?: number;
    propertyType?: string;
    bedrooms?: number;
    isAvailable?: boolean;
    isVerified?: boolean;
    searchTerm?: string;
}
export declare class PropertiesService {
    private db;
    constructor();
    private getDb;
    createProperty(data: CreatePropertyInput): Promise<Property>;
    getPropertyById(propertyId: string): Promise<Property | null>;
    getPropertiesByOwner(ownerId: string, page?: number, limit?: number): Promise<{
        properties: Property[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getAllProperties(page?: number, limit?: number, filters?: PropertyFilter): Promise<{
        properties: Property[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateProperty(propertyId: string, data: UpdatePropertyInput): Promise<Property | null>;
    deleteProperty(propertyId: string): Promise<boolean>;
    getPropertyStatistics(ownerId?: string): Promise<{
        total: number;
        available: number;
        rented: number;
        verified: number;
        boosted: number;
        byType: Record<string, number>;
        byCounty: Record<string, number>;
    }>;
    searchProperties(searchTerm: string, page?: number, limit?: number): Promise<{
        properties: Property[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
export declare const propertiesService: PropertiesService;
//# sourceMappingURL=properties.service.d.ts.map