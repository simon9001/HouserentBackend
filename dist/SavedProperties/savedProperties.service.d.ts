export interface SavedProperty {
    SavedId: string;
    UserId: string;
    PropertyId: string;
    CreatedAt: Date;
    Title?: string;
    Description?: string;
    RentAmount?: number;
    County?: string;
    Area?: string;
    PropertyType?: string;
}
export declare class SavedPropertiesService {
    private getDb;
    saveProperty(userId: string, propertyId: string): Promise<boolean>;
    unsaveProperty(userId: string, propertyId: string): Promise<boolean>;
    getSavedPropertiesByUserId(userId: string): Promise<SavedProperty[]>;
    isPropertySaved(userId: string, propertyId: string): Promise<boolean>;
}
export declare const savedPropertiesService: SavedPropertiesService;
//# sourceMappingURL=savedProperties.service.d.ts.map