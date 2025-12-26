export interface PropertyMedia {
    MediaId: string;
    PropertyId: string;
    MediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    MediaUrl: string;
    ThumbnailUrl: string | null;
    IsPrimary: boolean;
    CreatedAt: Date;
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
    thumbnailUrl?: string | null;
    isPrimary?: boolean;
}
export declare class PropertyMediaService {
    private db;
    constructor();
    private getDb;
    createMedia(data: CreateMediaInput): Promise<PropertyMedia>;
    getMediaById(mediaId: string): Promise<PropertyMedia | null>;
    getMediaByPropertyId(propertyId: string): Promise<PropertyMedia[]>;
    updateMedia(mediaId: string, data: UpdateMediaInput): Promise<PropertyMedia | null>;
    deleteMedia(mediaId: string): Promise<boolean>;
    setPrimaryMedia(mediaId: string): Promise<PropertyMedia | null>;
    getPrimaryMedia(propertyId: string): Promise<PropertyMedia | null>;
    createBulkMedia(mediaList: CreateMediaInput[]): Promise<PropertyMedia[]>;
    getMediaStatistics(propertyId?: string): Promise<{
        total: number;
        images: number;
        videos: number;
        documents: number;
        hasPrimary: number;
    }>;
}
export declare const propertyMediaService: PropertyMediaService;
//# sourceMappingURL=propertyMedia.service.d.ts.map