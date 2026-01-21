export interface PropertyMedia {
    media_id: string;
    property_id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    media_url: string;
    thumbnail_url: string | null;
    is_primary: boolean;
    created_at: string;
    cloudinary_public_id?: string | null;
    file_size?: number | null;
    format?: string | null;
    dimensions?: string | null;
}
export interface CreateMediaInput {
    propertyId: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
    cloudinaryPublicId?: string | null;
    fileSize?: number | null;
    format?: string | null;
    dimensions?: string | null;
}
export interface UpdateMediaInput {
    mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl?: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
    cloudinaryPublicId?: string | null;
    fileSize?: number | null;
    format?: string | null;
    dimensions?: string | null;
}
export declare class PropertyMediaService {
    addMedia(data: CreateMediaInput): Promise<PropertyMedia>;
    createMedia(data: CreateMediaInput): Promise<PropertyMedia>;
    addBulkMedia(propertyId: string, mediaList: Omit<CreateMediaInput, 'propertyId'>[]): Promise<PropertyMedia[]>;
    createBulkMedia(mediaList: CreateMediaInput[]): Promise<PropertyMedia[]>;
    getMediaById(mediaId: string): Promise<PropertyMedia | null>;
    updateMedia(mediaId: string, updates: Partial<UpdateMediaInput>): Promise<PropertyMedia>;
    getPrimaryMedia(propertyId: string): Promise<PropertyMedia | null>;
    getMediaStatistics(propertyId?: string): Promise<{
        totalMedia: number;
        images: number;
        videos: number;
        documents: number;
        primaryMedia: number;
    }>;
    getMediaByPropertyId(propertyId: string): Promise<PropertyMedia[]>;
    setPrimaryMedia(mediaId: string, propertyId: string): Promise<void>;
    deleteMedia(mediaId: string): Promise<boolean>;
    deleteMediaByPropertyId(propertyId: string): Promise<number>;
    getMediaCountByPropertyId(propertyId: string): Promise<number>;
    getMediaByType(propertyId: string, mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT'): Promise<PropertyMedia[]>;
    getAllMedia(limit?: number, offset?: number): Promise<PropertyMedia[]>;
    getMediaWithCloudinaryInfo(propertyId?: string): Promise<PropertyMedia[]>;
    updateCloudinaryInfo(mediaId: string, cloudinaryData: {
        publicId?: string;
        fileSize?: number;
        format?: string;
        dimensions?: string;
    }): Promise<PropertyMedia>;
    findMediaByCloudinaryPublicId(publicId: string): Promise<PropertyMedia | null>;
    getCloudinaryStatistics(propertyId?: string): Promise<{
        totalMedia: number;
        withCloudinaryInfo: number;
        withoutCloudinaryInfo: number;
        byResourceType: {
            images: number;
            videos: number;
            documents: number;
        };
        totalFileSize: number;
        averageFileSize: number;
    }>;
    rotatePrimaryMedia(propertyId: string): Promise<PropertyMedia | null>;
    hasMedia(propertyId: string): Promise<boolean>;
    cleanupOrphanedMedia(): Promise<{
        cleaned: number;
        errors: string[];
    }>;
    getMediaByCloudinaryFolder(): Promise<Record<string, PropertyMedia[]>>;
}
export declare const propertyMediaService: PropertyMediaService;
//# sourceMappingURL=propertyMedia.service.d.ts.map