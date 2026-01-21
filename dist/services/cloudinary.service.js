// backend/src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
export class CloudinaryService {
    /**
     * Upload a file to Cloudinary
     */
    static async uploadFile(file, options = {}) {
        try {
            const uploadOptions = {
                folder: options.folder || process.env.CLOUDINARY_FOLDER || 'Csrrentalsystem/properties',
                resource_type: options.resourceType || 'auto',
                public_id: options.publicId,
                overwrite: options.overwrite || false,
                tags: options.tags || ['Csrrentalsystem', 'property'],
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'Csrrentalsystem',
            };
            let uploadResult;
            if (typeof file === 'string') {
                // Upload from URL
                uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
            }
            else if (file instanceof Buffer) {
                // Upload from buffer (convert to base64)
                const base64File = `data:application/octet-stream;base64,${file.toString('base64')}`;
                uploadResult = await cloudinary.uploader.upload(base64File, uploadOptions);
            }
            else {
                // Upload from stream
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(this.formatResult(result));
                    });
                    if (file instanceof Readable) {
                        file.pipe(uploadStream);
                    }
                    else {
                        uploadStream.end(file);
                    }
                });
            }
            return this.formatResult(uploadResult);
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
        }
    }
    /**
     * Upload multiple files to Cloudinary
     */
    static async uploadMultipleFiles(files, options = {}) {
        try {
            const uploadPromises = files.map(async (file, index) => {
                const resourceType = this.getResourceType(file.mimetype);
                const publicId = options.publicId
                    ? `${options.publicId}_${index}`
                    : file.originalname.replace(/\.[^/.]+$/, '');
                return this.uploadFile(file.buffer, {
                    ...options,
                    resourceType,
                    publicId,
                });
            });
            return await Promise.all(uploadPromises);
        }
        catch (error) {
            console.error('Cloudinary bulk upload error:', error);
            throw new Error(`Failed to upload multiple files: ${error.message}`);
        }
    }
    /**
     * Delete a file from Cloudinary
     */
    static async deleteFile(publicId, resourceType = 'image') {
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        }
        catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
        }
    }
    /**
     * Delete multiple files from Cloudinary
     */
    static async deleteMultipleFiles(publicIds, resourceType = 'image') {
        try {
            await Promise.all(publicIds.map(publicId => cloudinary.uploader.destroy(publicId, { resource_type: resourceType })));
        }
        catch (error) {
            console.error('Cloudinary bulk delete error:', error);
            throw new Error(`Failed to delete multiple files: ${error.message}`);
        }
    }
    /**
     * Generate a signed upload URL for client-side uploads
     */
    static generateSignedUploadUrl(folder) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uploadOptions = {
            folder: folder || process.env.CLOUDINARY_FOLDER || 'Csrrentalsystem/properties',
            timestamp,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        };
        const signature = cloudinary.utils.api_sign_request(uploadOptions, process.env.CLOUDINARY_API_SECRET);
        return {
            url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
            signature,
            timestamp,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        };
    }
    /**
     * Get resource type from MIME type
     */
    static getResourceType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        return 'raw';
    }
    /**
     * Format Cloudinary result
     */
    static formatResult(result) {
        const type = this.getResourceTypeFromResourceType(result.resource_type);
        return {
            url: result.secure_url,
            type,
            publicId: result.public_id,
            thumbnailUrl: result.thumbnail_url || result.secure_url,
            duration: result.duration,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    }
    /**
     * Get media type from Cloudinary resource type
     */
    static getResourceTypeFromResourceType(resourceType) {
        switch (resourceType) {
            case 'image': return 'IMAGE';
            case 'video': return 'VIDEO';
            default: return 'DOCUMENT';
        }
    }
    /**
     * Get file information from Cloudinary
     */
    static async getFileInfo(publicId) {
        try {
            return await cloudinary.api.resource(publicId);
        }
        catch (error) {
            console.error('Cloudinary get file info error:', error);
            throw new Error(`Failed to get file information: ${error.message}`);
        }
    }
    /**
     * Generate transformation URL
     */
    static generateTransformedUrl(publicId, transformations = {}) {
        return cloudinary.url(publicId, {
            ...transformations,
            secure: true,
        });
    }
}
//# sourceMappingURL=cloudinary.service.js.map