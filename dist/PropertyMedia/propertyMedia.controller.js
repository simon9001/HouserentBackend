import { propertyMediaService } from './propertyMedia.service.js';
import { ValidationUtils } from '../utils/validators.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
// ==================== FILE UPLOAD ENDPOINTS ====================
// Create media with file upload (backend handles Cloudinary)
export const createMediaWithUpload = async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body.file;
        // Fix: Proper type checking for file
        if (!file || typeof file === 'boolean' || !(file instanceof File)) {
            return c.json({
                success: false,
                error: 'Valid file is required'
            }, 400);
        }
        // Fix: Type assertion for body fields
        const propertyId = body.propertyId;
        const mediaTypeValue = body.mediaType;
        const requiredFields = ['propertyId', 'mediaType'];
        const missingFields = requiredFields.filter(field => {
            const value = body[field];
            return !value || (typeof value === 'string' && value.trim() === '');
        });
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        // Validate UUID
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Validate media type
        const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
        const mediaType = mediaTypeValue.toUpperCase();
        if (!validMediaTypes.includes(mediaType)) {
            return c.json({
                success: false,
                error: 'Invalid media type. Must be one of: IMAGE, VIDEO, DOCUMENT'
            }, 400);
        }
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Upload to Cloudinary
        const cloudinaryResult = await CloudinaryService.uploadFile(buffer, {
            folder: `Csrrentalsystem/properties/${propertyId}`,
            resourceType: mediaType.toLowerCase(),
            publicId: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, '')}`,
            tags: ['Csrrentalsystem', 'property', `property_${propertyId}`],
        });
        // Fix: Properly handle isPrimary - check both string and boolean
        const isPrimaryValue = body.isPrimary;
        const isPrimary = typeof isPrimaryValue === 'boolean'
            ? isPrimaryValue
            : isPrimaryValue === 'true';
        // Create media record in database
        const mediaData = {
            propertyId,
            mediaType: mediaType,
            mediaUrl: cloudinaryResult.url,
            thumbnailUrl: cloudinaryResult.thumbnailUrl,
            isPrimary,
            cloudinaryPublicId: cloudinaryResult.publicId,
            fileSize: cloudinaryResult.bytes,
            format: cloudinaryResult.format,
            dimensions: cloudinaryResult.width && cloudinaryResult.height
                ? `${cloudinaryResult.width}x${cloudinaryResult.height}`
                : null,
        };
        const media = await propertyMediaService.createMedia(mediaData);
        return c.json({
            success: true,
            message: 'Media uploaded and added successfully',
            data: {
                ...media,
                cloudinaryInfo: {
                    publicId: cloudinaryResult.publicId,
                    format: cloudinaryResult.format,
                    size: cloudinaryResult.bytes,
                }
            }
        }, 201);
    }
    catch (error) {
        console.error('Error creating media with upload:', error.message);
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to upload and add media'
        }, 500);
    }
};
// Bulk create media with upload
export const createBulkMediaWithUpload = async (c) => {
    try {
        const body = await c.req.parseBody();
        const files = body.files;
        // Fix: Type checking for files array
        if (!files || !Array.isArray(files) || files.length === 0) {
            return c.json({
                success: false,
                error: 'Files array is required and must not be empty'
            }, 400);
        }
        const propertyId = body.propertyId;
        const isPrimaryIndex = parseInt(body.primaryIndex) || 0;
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Filter out non-File objects
        const validFiles = files.filter((file) => file instanceof File);
        if (validFiles.length === 0) {
            return c.json({
                success: false,
                error: 'No valid files found'
            }, 400);
        }
        // Convert Files to buffers
        const fileBuffers = await Promise.all(validFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return {
                buffer,
                originalname: file.name,
                mimetype: file.type,
            };
        }));
        // Upload to Cloudinary
        const cloudinaryResults = await CloudinaryService.uploadMultipleFiles(fileBuffers, {
            folder: `Csrrentalsystem/properties/${propertyId}`,
            tags: ['Csrrentalsystem', 'property', `property_${propertyId}`],
        });
        // Create media records in database
        const mediaRecords = cloudinaryResults.map((result, index) => ({
            propertyId,
            mediaType: result.type,
            mediaUrl: result.url,
            thumbnailUrl: result.thumbnailUrl,
            isPrimary: index === isPrimaryIndex,
            cloudinaryPublicId: result.publicId,
            fileSize: result.bytes,
            format: result.format,
            dimensions: result.width && result.height
                ? `${result.width}x${result.height}`
                : null,
        }));
        const createdMedia = await propertyMediaService.createBulkMedia(mediaRecords);
        return c.json({
            success: true,
            message: `Successfully uploaded ${createdMedia.length} media files`,
            data: createdMedia.map((media, index) => ({
                ...media,
                cloudinaryInfo: {
                    publicId: cloudinaryResults[index].publicId,
                    format: cloudinaryResults[index].format,
                    size: cloudinaryResults[index].bytes,
                }
            }))
        }, 201);
    }
    catch (error) {
        console.error('Error creating bulk media with upload:', error.message);
        return c.json({
            success: false,
            error: 'Failed to upload and create media'
        }, 500);
    }
};
// Get upload signature for client-side uploads
export const getUploadSignature = async (c) => {
    try {
        const { propertyId } = c.req.query();
        if (propertyId && !ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const folder = propertyId
            ? `Csrrentalsystem/properties/${propertyId}`
            : undefined;
        const uploadData = CloudinaryService.generateSignedUploadUrl(folder);
        return c.json({
            success: true,
            data: uploadData
        });
    }
    catch (error) {
        console.error('Error generating upload signature:', error.message);
        return c.json({
            success: false,
            error: 'Failed to generate upload signature'
        }, 500);
    }
};
// Delete media and remove from Cloudinary
export const deleteMediaWithCloudinary = async (c) => {
    try {
        const mediaId = c.req.param('mediaId');
        if (!ValidationUtils.isValidUUID(mediaId)) {
            return c.json({
                success: false,
                error: 'Invalid media ID format'
            }, 400);
        }
        // Get media to get Cloudinary public ID
        const media = await propertyMediaService.getMediaById(mediaId);
        if (!media) {
            return c.json({
                success: false,
                error: 'Media not found'
            }, 404);
        }
        // Fix: Check if cloudinary_public_id exists (note the snake_case)
        if (media.cloudinary_public_id) {
            // Fix: Access media_type (snake_case) and convert to resourceType
            const resourceType = (media.media_type || '').toLowerCase();
            await CloudinaryService.deleteFile(media.cloudinary_public_id, resourceType);
        }
        // Delete from database
        const success = await propertyMediaService.deleteMedia(mediaId);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to delete media from database'
            }, 404);
        }
        return c.json({
            success: true,
            message: 'Media deleted successfully from Cloudinary and database'
        });
    }
    catch (error) {
        console.error('Error deleting media:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to delete media'
        }, 500);
    }
};
// ==================== EXISTING ENDPOINTS (UPDATED) ====================
// Create new property media (for existing Cloudinary URLs)
export const createMedia = async (c) => {
    try {
        const body = await c.req.json();
        // Validate required fields
        const requiredFields = ['propertyId', 'mediaType', 'mediaUrl'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        // Validate UUID
        if (!ValidationUtils.isValidUUID(body.propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Validate media type
        const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
        const mediaType = body.mediaType.toUpperCase();
        if (!validMediaTypes.includes(mediaType)) {
            return c.json({
                success: false,
                error: 'Invalid media type. Must be one of: IMAGE, VIDEO, DOCUMENT'
            }, 400);
        }
        const mediaData = {
            propertyId: body.propertyId,
            mediaType: mediaType,
            mediaUrl: body.mediaUrl,
            thumbnailUrl: body.thumbnailUrl,
            isPrimary: body.isPrimary || false,
            cloudinaryPublicId: body.cloudinaryPublicId || null,
            fileSize: body.fileSize || null,
            format: body.format || null,
            dimensions: body.dimensions || null,
        };
        const media = await propertyMediaService.createMedia(mediaData);
        return c.json({
            success: true,
            message: 'Media added successfully',
            data: media
        }, 201);
    }
    catch (error) {
        console.error('Error creating media:', error.message);
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to add media'
        }, 500);
    }
};
// Get media by ID
export const getMediaById = async (c) => {
    try {
        const mediaId = c.req.param('mediaId');
        if (!ValidationUtils.isValidUUID(mediaId)) {
            return c.json({
                success: false,
                error: 'Invalid media ID format'
            }, 400);
        }
        const media = await propertyMediaService.getMediaById(mediaId);
        if (!media) {
            return c.json({
                success: false,
                error: 'Media not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: media
        });
    }
    catch (error) {
        console.error('Error fetching media:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch media'
        }, 500);
    }
};
// Get all media for a property
export const getMediaByPropertyId = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const media = await propertyMediaService.getMediaByPropertyId(propertyId);
        return c.json({
            success: true,
            data: media
        });
    }
    catch (error) {
        console.error('Error fetching property media:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch media'
        }, 500);
    }
};
// Update media
export const updateMedia = async (c) => {
    try {
        const mediaId = c.req.param('mediaId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(mediaId)) {
            return c.json({
                success: false,
                error: 'Invalid media ID format'
            }, 400);
        }
        // Validate media type if provided
        if (body.mediaType) {
            const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
            const mediaType = body.mediaType.toUpperCase();
            if (!validMediaTypes.includes(mediaType)) {
                return c.json({
                    success: false,
                    error: 'Invalid media type'
                }, 400);
            }
            body.mediaType = mediaType;
        }
        const updateData = {
            mediaType: body.mediaType,
            mediaUrl: body.mediaUrl,
            thumbnailUrl: body.thumbnailUrl,
            isPrimary: body.isPrimary,
            cloudinaryPublicId: body.cloudinaryPublicId,
            fileSize: body.fileSize,
            format: body.format,
            dimensions: body.dimensions,
        };
        const updatedMedia = await propertyMediaService.updateMedia(mediaId, updateData);
        return c.json({
            success: true,
            message: 'Media updated successfully',
            data: updatedMedia
        });
    }
    catch (error) {
        console.error('Error updating media:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update media'
        }, 500);
    }
};
// Delete media (legacy - use deleteMediaWithCloudinary instead)
export const deleteMedia = async (c) => {
    try {
        const mediaId = c.req.param('mediaId');
        if (!ValidationUtils.isValidUUID(mediaId)) {
            return c.json({
                success: false,
                error: 'Invalid media ID format'
            }, 400);
        }
        const success = await propertyMediaService.deleteMedia(mediaId);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to delete media'
            }, 404);
        }
        return c.json({
            success: true,
            message: 'Media deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting media:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to delete media'
        }, 500);
    }
};
// Set media as primary
export const setPrimaryMedia = async (c) => {
    try {
        const mediaId = c.req.param('mediaId');
        const propertyId = c.req.query('propertyId');
        if (!ValidationUtils.isValidUUID(mediaId)) {
            return c.json({
                success: false,
                error: 'Invalid media ID format'
            }, 400);
        }
        if (!propertyId || !ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Valid propertyId query parameter is required'
            }, 400);
        }
        await propertyMediaService.setPrimaryMedia(mediaId, propertyId);
        return c.json({
            success: true,
            message: 'Media set as primary successfully'
        });
    }
    catch (error) {
        console.error('Error setting primary media:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to set media as primary'
        }, 500);
    }
};
// Get primary media for property
export const getPrimaryMedia = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const primaryMedia = await propertyMediaService.getPrimaryMedia(propertyId);
        if (!primaryMedia) {
            return c.json({
                success: false,
                error: 'No primary media found for this property'
            }, 404);
        }
        return c.json({
            success: true,
            data: primaryMedia
        });
    }
    catch (error) {
        console.error('Error fetching primary media:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch primary media'
        }, 500);
    }
};
// Bulk create media (for existing Cloudinary URLs)
export const createBulkMedia = async (c) => {
    try {
        const body = await c.req.json();
        if (!Array.isArray(body.media)) {
            return c.json({
                success: false,
                error: 'Media must be an array'
            }, 400);
        }
        // Validate each media item
        const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
        const mediaRecords = [];
        for (const media of body.media) {
            if (!media.propertyId || !media.mediaType || !media.mediaUrl) {
                return c.json({
                    success: false,
                    error: 'Each media item must have propertyId, mediaType, and mediaUrl'
                }, 400);
            }
            if (!ValidationUtils.isValidUUID(media.propertyId)) {
                return c.json({
                    success: false,
                    error: 'Invalid property ID format'
                }, 400);
            }
            const mediaType = media.mediaType.toUpperCase();
            if (!validMediaTypes.includes(mediaType)) {
                return c.json({
                    success: false,
                    error: 'Invalid media type'
                }, 400);
            }
            mediaRecords.push({
                propertyId: media.propertyId,
                mediaType: mediaType,
                mediaUrl: media.mediaUrl,
                thumbnailUrl: media.thumbnailUrl,
                isPrimary: media.isPrimary || false,
                cloudinaryPublicId: media.cloudinaryPublicId || null,
                fileSize: media.fileSize || null,
                format: media.format || null,
                dimensions: media.dimensions || null,
            });
        }
        const createdMedia = await propertyMediaService.createBulkMedia(mediaRecords);
        return c.json({
            success: true,
            message: `Successfully created ${createdMedia.length} media items`,
            data: createdMedia
        }, 201);
    }
    catch (error) {
        console.error('Error creating bulk media:', error.message);
        return c.json({
            success: false,
            error: 'Failed to create media'
        }, 500);
    }
};
// Get media statistics
export const getMediaStatistics = async (c) => {
    try {
        const propertyId = c.req.query('propertyId');
        if (propertyId && !ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const stats = await propertyMediaService.getMediaStatistics(propertyId || undefined);
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching media statistics:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch statistics'
        }, 500);
    }
};
// Get media count for property
export const getMediaCount = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const count = await propertyMediaService.getMediaCountByPropertyId(propertyId);
        return c.json({
            success: true,
            data: { count }
        });
    }
    catch (error) {
        console.error('Error fetching media count:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch media count'
        }, 500);
    }
};
// Get media by type
export const getMediaByType = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const mediaType = c.req.query('type')?.toUpperCase();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const validMediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'];
        if (!mediaType || !validMediaTypes.includes(mediaType)) {
            return c.json({
                success: false,
                error: 'Valid media type is required: IMAGE, VIDEO, or DOCUMENT'
            }, 400);
        }
        const media = await propertyMediaService.getMediaByType(propertyId, mediaType);
        return c.json({
            success: true,
            data: media
        });
    }
    catch (error) {
        console.error('Error fetching media by type:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch media'
        }, 500);
    }
};
//# sourceMappingURL=propertyMedia.controller.js.map