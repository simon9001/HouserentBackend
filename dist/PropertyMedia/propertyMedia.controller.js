import { propertyMediaService } from './propertyMedia.service.js';
import { ValidationUtils } from '../utils/validators.js';
// Create new property media
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
        if (!validMediaTypes.includes(body.mediaType.toUpperCase())) {
            return c.json({
                success: false,
                error: 'Invalid media type. Must be one of: IMAGE, VIDEO, DOCUMENT'
            }, 400);
        }
        const mediaData = {
            propertyId: body.propertyId,
            mediaType: body.mediaType.toUpperCase(),
            mediaUrl: body.mediaUrl,
            thumbnailUrl: body.thumbnailUrl,
            isPrimary: body.isPrimary || false
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
        if (error.message.includes('not found') ||
            error.message.includes('Invalid')) {
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
            if (!validMediaTypes.includes(body.mediaType.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid media type'
                }, 400);
            }
            body.mediaType = body.mediaType.toUpperCase();
        }
        const updateData = {
            mediaType: body.mediaType,
            mediaUrl: body.mediaUrl,
            thumbnailUrl: body.thumbnailUrl,
            isPrimary: body.isPrimary
        };
        const updatedMedia = await propertyMediaService.updateMedia(mediaId, updateData);
        if (!updatedMedia) {
            return c.json({
                success: false,
                error: 'Failed to update media'
            }, 500);
        }
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
// Delete media
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
            }, 500);
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
        if (!ValidationUtils.isValidUUID(mediaId)) {
            return c.json({
                success: false,
                error: 'Invalid media ID format'
            }, 400);
        }
        const updatedMedia = await propertyMediaService.setPrimaryMedia(mediaId);
        if (!updatedMedia) {
            return c.json({
                success: false,
                error: 'Failed to set media as primary'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Media set as primary successfully',
            data: updatedMedia
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
// Bulk create media
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
            if (!validMediaTypes.includes(media.mediaType.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid media type'
                }, 400);
            }
            media.mediaType = media.mediaType.toUpperCase();
        }
        const createdMedia = await propertyMediaService.createBulkMedia(body.media);
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
//# sourceMappingURL=propertyMedia.controller.js.map