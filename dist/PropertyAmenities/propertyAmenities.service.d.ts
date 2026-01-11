export interface PropertyAmenity {
    AmenityId: string;
    PropertyId: string;
    AmenityName: string;
    CreatedAt: string;
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
    createAmenity(data: CreateAmenityInput): Promise<PropertyAmenity>;
    bulkCreateAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]>;
    createBulkAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]>;
    getAmenityById(amenityId: string, ...args: any[]): Promise<PropertyAmenity>;
    updateAmenity(amenityId: string, updates: any): Promise<PropertyAmenity>;
    searchAmenities(query: string, ...args: any[]): Promise<PropertyAmenity[]>;
    getAmenitiesByPropertyId(propertyId: string): Promise<PropertyAmenity[]>;
    deleteAmenity(amenityId: string): Promise<boolean>;
    deleteAmenitiesByPropertyId(propertyId: string): Promise<number>;
    getPropertiesByAmenity(amenityName: string, limit?: number, offset?: number): Promise<any[]>;
    getCommonAmenities(limit?: number): Promise<{
        name: string;
        count: number;
    }[]>;
    getAmenitiesStatistics(...args: any[]): Promise<any>;
}
export declare const propertyAmenitiesService: PropertyAmenitiesService;
//# sourceMappingURL=propertyAmenities.service.d.ts.map