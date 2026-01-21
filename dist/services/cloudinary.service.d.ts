import { Readable } from 'stream';
export interface CloudinaryUploadResult {
    url: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    publicId: string;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    format: string;
    bytes: number;
}
export interface UploadOptions {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    publicId?: string;
    overwrite?: boolean;
    tags?: string[];
}
export declare class CloudinaryService {
    /**
     * Upload a file to Cloudinary
     */
    static uploadFile(file: Buffer | Readable | string, options?: UploadOptions): Promise<CloudinaryUploadResult>;
    /**
     * Upload multiple files to Cloudinary
     */
    static uploadMultipleFiles(files: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }>, options?: UploadOptions): Promise<CloudinaryUploadResult[]>;
    /**
     * Delete a file from Cloudinary
     */
    static deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<void>;
    /**
     * Delete multiple files from Cloudinary
     */
    static deleteMultipleFiles(publicIds: string[], resourceType?: 'image' | 'video' | 'raw'): Promise<void>;
    /**
     * Generate a signed upload URL for client-side uploads
     */
    static generateSignedUploadUrl(folder?: string): {
        url: string;
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
    };
    /**
     * Get resource type from MIME type
     */
    private static getResourceType;
    /**
     * Format Cloudinary result
     */
    private static formatResult;
    /**
     * Get media type from Cloudinary resource type
     */
    private static getResourceTypeFromResourceType;
    /**
     * Get file information from Cloudinary
     */
    static getFileInfo(publicId: string): Promise<any>;
    /**
     * Generate transformation URL
     */
    static generateTransformedUrl(publicId: string, transformations?: any): string;
}
//# sourceMappingURL=cloudinary.service.d.ts.map