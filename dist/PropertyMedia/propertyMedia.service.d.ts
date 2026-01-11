export interface PropertyMedia {
    MediaId: string;
    PropertyId: string;
    MediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    MediaUrl: string;
    ThumbnailUrl: string | null;
    IsPrimary: boolean;
    CreatedAt: string;
}
export interface CreateMediaInput {
    propertyId: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
}
export interface UpdateMediaInput {
    mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl?: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
}
export declare class PropertyMediaService {
    addMedia(data: CreateMediaInput): Promise<PropertyMedia>;
    createMedia(data: CreateMediaInput): Promise<PropertyMedia>;
    addBulkMedia(propertyId: string, mediaList: Omit<CreateMediaInput, 'propertyId'>[]): Promise<PropertyMedia[]>;
    createBulkMedia(propertyId: string, mediaList: Omit<CreateMediaInput, 'propertyId'>[]): Promise<PropertyMedia[]>;
    getMediaById(mediaId: string): Promise<PropertyMedia>;
    updateMedia(mediaId: string, updates: Partial<UpdateMediaInput>): Promise<PropertyMedia>;
    getPrimaryMedia(propertyId: string): Promise<PropertyMedia | null>;
    getMediaStatistics(...args: any[]): Promise<any>;
    getMediaByPropertyId(propertyId: string): Promise<PropertyMedia[]>;
    setPrimaryMedia(mediaId: string, propertyId: string): Promise<void>;
    deleteMedia(mediaId: string): Promise<boolean>;
    deleteMediaByPropertyId(propertyId: string): Promise<number>;
}
export declare const propertyMediaService: PropertyMediaService;
//# sourceMappingURL=propertyMedia.service.d.ts.map