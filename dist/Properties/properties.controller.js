import { propertiesService } from './properties.service.js';
import { ValidationUtils } from '../utils/validators.js';
// Create new property
export const createProperty = async (c) => {
    try {
        const body = await c.req.json();
        // Validate required fields
        const requiredFields = ['ownerId', 'title', 'description', 'rentAmount', 'county', 'area'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        // Validate UUID
        if (!ValidationUtils.isValidUUID(body.ownerId)) {
            return c.json({
                success: false,
                error: 'Invalid owner ID format'
            }, 400);
        }
        // Validate rent amount
        if (body.rentAmount <= 0) {
            return c.json({
                success: false,
                error: 'Rent amount must be greater than 0'
            }, 400);
        }
        if (body.depositAmount && body.depositAmount < 0) {
            return c.json({
                success: false,
                error: 'Deposit amount cannot be negative'
            }, 400);
        }
        const propertyData = {
            ownerId: body.ownerId,
            title: body.title,
            description: body.description,
            rentAmount: body.rentAmount,
            depositAmount: body.depositAmount,
            county: body.county,
            constituency: body.constituency,
            area: body.area,
            streetAddress: body.streetAddress,
            latitude: body.latitude,
            longitude: body.longitude,
            propertyType: body.propertyType || 'APARTMENT',
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            rules: body.rules
        };
        const property = await propertiesService.createProperty(propertyData);
        return c.json({
            success: true,
            message: 'Property created successfully',
            data: property
        }, 201);
    }
    catch (error) {
        console.error('Error creating property:', error.message);
        if (error.message.includes('not found') ||
            error.message.includes('Missing required') ||
            error.message.includes('Invalid') ||
            error.message.includes('must be greater')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to create property'
        }, 500);
    }
};
// Get property by ID
export const getPropertyById = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const property = await propertiesService.getPropertyById(propertyId);
        if (!property) {
            return c.json({
                success: false,
                error: 'Property not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: property
        });
    }
    catch (error) {
        console.error('Error fetching property:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch property'
        }, 500);
    }
};
// Get properties by owner
export const getPropertiesByOwner = async (c) => {
    try {
        const ownerId = c.req.param('ownerId');
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        if (!ValidationUtils.isValidUUID(ownerId)) {
            return c.json({
                success: false,
                error: 'Invalid owner ID format'
            }, 400);
        }
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        const result = await propertiesService.getPropertiesByOwner(ownerId, page, limit);
        return c.json({
            success: true,
            data: {
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching owner properties:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch properties'
        }, 500);
    }
};
// Get all properties with filters
export const getAllProperties = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        // Parse filters from query params
        const filters = {
            county: c.req.query('county'),
            area: c.req.query('area'),
            minRent: c.req.query('minRent') ? parseFloat(c.req.query('minRent')) : undefined,
            maxRent: c.req.query('maxRent') ? parseFloat(c.req.query('maxRent')) : undefined,
            propertyType: c.req.query('propertyType'),
            bedrooms: c.req.query('bedrooms') ? parseInt(c.req.query('bedrooms')) : undefined,
            isAvailable: c.req.query('isAvailable') ? c.req.query('isAvailable') === 'true' : true,
            isVerified: c.req.query('isVerified') ? c.req.query('isVerified') === 'true' : undefined,
            searchTerm: c.req.query('search')
        };
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        // Validate property type if provided
        if (filters.propertyType) {
            const validTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
            if (!validTypes.includes(filters.propertyType.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid property type. Must be one of: APARTMENT, HOUSE, COMMERCIAL, LAND, OTHER'
                }, 400);
            }
            filters.propertyType = filters.propertyType.toUpperCase();
        }
        const result = await propertiesService.getAllProperties(page, limit, filters);
        return c.json({
            success: true,
            data: {
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching properties:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch properties'
        }, 500);
    }
};
// Update property
export const updateProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Validate rent amount if provided
        if (body.rentAmount !== undefined && body.rentAmount <= 0) {
            return c.json({
                success: false,
                error: 'Rent amount must be greater than 0'
            }, 400);
        }
        if (body.depositAmount !== undefined && body.depositAmount < 0) {
            return c.json({
                success: false,
                error: 'Deposit amount cannot be negative'
            }, 400);
        }
        // Validate property type if provided
        if (body.propertyType) {
            const validTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
            if (!validTypes.includes(body.propertyType.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid property type'
                }, 400);
            }
            body.propertyType = body.propertyType.toUpperCase();
        }
        const updateData = {
            title: body.title,
            description: body.description,
            rentAmount: body.rentAmount,
            depositAmount: body.depositAmount,
            county: body.county,
            constituency: body.constituency,
            area: body.area,
            streetAddress: body.streetAddress,
            latitude: body.latitude,
            longitude: body.longitude,
            propertyType: body.propertyType,
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            rules: body.rules,
            isAvailable: body.isAvailable,
            isVerified: body.isVerified,
            isBoosted: body.isBoosted,
            boostExpiry: body.boostExpiry ? new Date(body.boostExpiry) : undefined
        };
        const updatedProperty = await propertiesService.updateProperty(propertyId, updateData);
        if (!updatedProperty) {
            return c.json({
                success: false,
                error: 'Failed to update property'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty
        });
    }
    catch (error) {
        console.error('Error updating property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update property'
        }, 500);
    }
};
// Delete property
export const deleteProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const success = await propertiesService.deleteProperty(propertyId);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to delete property'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Property deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to delete property'
        }, 500);
    }
};
// Get property statistics
export const getPropertyStatistics = async (c) => {
    try {
        const ownerId = c.req.query('ownerId');
        if (ownerId && !ValidationUtils.isValidUUID(ownerId)) {
            return c.json({
                success: false,
                error: 'Invalid owner ID format'
            }, 400);
        }
        const stats = await propertiesService.getPropertyStatistics(ownerId || undefined);
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching property statistics:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch statistics'
        }, 500);
    }
};
// Search properties
export const searchProperties = async (c) => {
    try {
        const searchTerm = c.req.query('q') || '';
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        if (searchTerm.length < 2) {
            return c.json({
                success: false,
                error: 'Search term must be at least 2 characters long'
            }, 400);
        }
        const result = await propertiesService.searchProperties(searchTerm, page, limit);
        return c.json({
            success: true,
            data: {
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });
    }
    catch (error) {
        console.error('Error searching properties:', error.message);
        return c.json({
            success: false,
            error: 'Failed to search properties'
        }, 500);
    }
};
export const verifyProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const updateData = {
            isVerified: true
        };
        const updatedProperty = await propertiesService.updateProperty(propertyId, updateData);
        if (!updatedProperty) {
            return c.json({
                success: false,
                error: 'Failed to verify property'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Property verified successfully',
            data: updatedProperty
        });
    }
    catch (error) {
        console.error('Error verifying property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to verify property'
        }, 500);
    }
};
// Admin boost property
export const boostProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Calculate boost expiry (default 7 days from now)
        const boostDays = body.days || 7;
        const boostExpiry = new Date();
        boostExpiry.setDate(boostExpiry.getDate() + boostDays);
        const updateData = {
            isBoosted: true,
            boostExpiry: boostExpiry
        };
        const updatedProperty = await propertiesService.updateProperty(propertyId, updateData);
        if (!updatedProperty) {
            return c.json({
                success: false,
                error: 'Failed to boost property'
            }, 500);
        }
        return c.json({
            success: true,
            message: `Property boosted for ${boostDays} days`,
            data: updatedProperty
        });
    }
    catch (error) {
        console.error('Error boosting property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to boost property'
        }, 500);
    }
};
//# sourceMappingURL=properties.controller.js.map