export interface PropertyAmenity {
    AmenityId: string;
    PropertyId: string;
    AmenityName: string;
    CreatedAt: Date;
}
export interface CreateAmenityInput {
    propertyId: string;
    amenityName: string;
}
export interface BulkAmenityInput {
    propertyId: string;
    amenities: string[];
}
export declare class PropertyAmenitiesService {
    private db;
    constructor();
    private getDb;
    createAmenity(data: CreateAmenityInput): Promise<PropertyAmenity>;
    getAmenityById(amenityId: string): Promise<PropertyAmenity | null>;
    getAmenitiesByPropertyId(propertyId: string): Promise<PropertyAmenity[]>;
    updateAmenity(amenityId: string, amenityName: string): Promise<PropertyAmenity | null>;
    deleteAmenity(amenityId: string): Promise<boolean>;
    createBulkAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]>;
    deleteAmenitiesByPropertyId(propertyId: string): Promise<boolean>;
    getCommonAmenities(limit?: number): Promise<{
        amenityName: string;
        count: number;
    }[]>;
    searchAmenities(searchTerm: string, propertyId?: string): Promise<PropertyAmenity[]>;
    getAmenitiesStatistics(propertyId?: string): Promise<{
        total: number;
        uniqueAmenities: number;
        averagePerProperty: number;
        mostCommon: {
            amenityName: string;
            count: number;
        }[];
    }>;
}
export declare const propertyAmenitiesService: PropertyAmenitiesService;
//# sourceMappingURL=propertyAmenities.service.d.ts.map