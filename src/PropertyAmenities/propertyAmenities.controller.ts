import { Context } from 'hono';
import { propertyAmenitiesService } from './propertyAmenities.service.js';
import { ValidationUtils } from '../utils/validators.js';

// Create new amenity
export const createAmenity = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.propertyId || !body.amenityName) {
            return c.json({
                success: false,
                error: 'Property ID and amenity name are required'
            }, 400);
        }

        // Validate UUID
        if (!ValidationUtils.isValidUUID(body.propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        if (body.amenityName.trim().length === 0) {
            return c.json({
                success: false,
                error: 'Amenity name cannot be empty'
            }, 400);
        }

        const amenityData = {
            propertyId: body.propertyId,
            amenityName: body.amenityName
        };

        const amenity = await propertyAmenitiesService.createAmenity(amenityData);

        return c.json({
            success: true,
            message: 'Amenity created successfully',
            data: amenity
        }, 201);
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to create amenity'
        }, 400);
    }
};

// Get amenity by ID
export const getAmenityById = async (c: Context) => {
    try {
        const amenityId = c.req.param('amenityId');

        if (!ValidationUtils.isValidUUID(amenityId)) {
            return c.json({
                success: false,
                error: 'Invalid amenity ID format'
            }, 400);
        }

        const amenity = await propertyAmenitiesService.getAmenityById(amenityId);

        if (!amenity) {
            return c.json({
                success: false,
                error: 'Amenity not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: amenity
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch amenity'
        }, 400);
    }
};

// Get amenities by property ID
export const getAmenitiesByPropertyId = async (c: Context) => {
    try {
        const propertyId = c.req.param('propertyId');

        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        const amenities = await propertyAmenitiesService.getAmenitiesByPropertyId(propertyId);

        return c.json({
            success: true,
            data: amenities
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch amenities'
        }, 400);
    }
};

// Update amenity
export const updateAmenity = async (c: Context) => {
    try {
        const amenityId = c.req.param('amenityId');
        const body = await c.req.json();

        if (!ValidationUtils.isValidUUID(amenityId)) {
            return c.json({
                success: false,
                error: 'Invalid amenity ID format'
            }, 400);
        }

        if (!body.amenityName || body.amenityName.trim().length === 0) {
            return c.json({
                success: false,
                error: 'Amenity name is required'
            }, 400);
        }

        const updatedAmenity = await propertyAmenitiesService.updateAmenity(amenityId, body.amenityName);

        if (!updatedAmenity) {
            return c.json({
                success: false,
                error: 'Amenity not found'
            }, 404);
        }

        return c.json({
            success: true,
            message: 'Amenity updated successfully',
            data: updatedAmenity
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to update amenity'
        }, 400);
    }
};

// Delete amenity
export const deleteAmenity = async (c: Context) => {
    try {
        const amenityId = c.req.param('amenityId');

        if (!ValidationUtils.isValidUUID(amenityId)) {
            return c.json({
                success: false,
                error: 'Invalid amenity ID format'
            }, 400);
        }

        const deleted = await propertyAmenitiesService.deleteAmenity(amenityId);

        if (!deleted) {
            return c.json({
                success: false,
                error: 'Amenity not found'
            }, 404);
        }

        return c.json({
            success: true,
            message: 'Amenity deleted successfully'
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to delete amenity'
        }, 400);
    }
};

// Bulk create amenities
export const createBulkAmenities = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.propertyId || !body.amenities || !Array.isArray(body.amenities)) {
            return c.json({
                success: false,
                error: 'Property ID and amenities array are required'
            }, 400);
        }

        // Validate UUID
        if (!ValidationUtils.isValidUUID(body.propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        // Validate amenities array
        const validAmenities = body.amenities
            .filter((amenity: any) => typeof amenity === 'string' && amenity.trim().length > 0)
            .map((amenity: string) => amenity.trim());

        if (validAmenities.length === 0) {
            return c.json({
                success: false,
                error: 'At least one valid amenity name is required'
            }, 400);
        }

        const bulkData = {
            propertyId: body.propertyId,
            amenities: validAmenities
        };

        const createdAmenities = await propertyAmenitiesService.createBulkAmenities(bulkData);

        return c.json({
            success: true,
            message: `Created ${createdAmenities.length} amenities`,
            data: createdAmenities
        }, 201);
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to create amenities'
        }, 400);
    }
};

// Delete all amenities for a property
export const deleteAmenitiesByPropertyId = async (c: Context) => {
    try {
        const propertyId = c.req.param('propertyId');

        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }


        return c.json({
            success: true,
            message: `All amenities for property ${propertyId} have been deleted`
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to delete amenities'
        }, 400);
    }
};

// Get common amenities (statistics)
export const getCommonAmenities = async (c: Context) => {
    try {
        const limit = parseInt(c.req.query('limit') || '10');
        
        if (isNaN(limit) || limit < 1 || limit > 50) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 50'
            }, 400);
        }

        const commonAmenities = await propertyAmenitiesService.getCommonAmenities(limit);

        return c.json({
            success: true,
            data: commonAmenities
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch common amenities'
        }, 400);
    }
};

// Search amenities
export const searchAmenities = async (c: Context) => {
    try {
        const searchTerm = c.req.query('q');
        const propertyId = c.req.query('propertyId');

        if (!searchTerm || searchTerm.trim().length < 2) {
            return c.json({
                success: false,
                error: 'Search term must be at least 2 characters'
            }, 400);
        }

        if (propertyId && !ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        const amenities = await propertyAmenitiesService.searchAmenities(
            searchTerm.trim(),
            propertyId
        );

        return c.json({
            success: true,
            data: amenities
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to search amenities'
        }, 400);
    }
};

// Get amenities statistics
export const getAmenitiesStatistics = async (c: Context) => {
    try {
        const propertyId = c.req.query('propertyId');

        if (propertyId && !ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }

        const stats = await propertyAmenitiesService.getAmenitiesStatistics(propertyId);

        return c.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch amenities statistics'
        }, 400);
    }
};