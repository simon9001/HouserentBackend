import { savedPropertiesService } from './savedProperties.service.js';
// import { ValidationUtils } from '../utils/validators.js';
export const saveProperty = async (c) => {
    try {
        const userId = c.req.param('userId');
        const { propertyId } = await c.req.json();
        if (!propertyId) {
            return c.json({ success: false, error: 'Property ID is required' }, 400);
        }
        const success = await savedPropertiesService.saveProperty(userId, propertyId);
        return c.json({
            success: true,
            message: success ? 'Property saved successfully' : 'Property was already saved'
        });
    }
    catch (error) {
        console.error('Error saving property:', error.message);
        return c.json({ success: false, error: 'Failed to save property' }, 500);
    }
};
export const unsaveProperty = async (c) => {
    try {
        const userId = c.req.param('userId');
        const propertyId = c.req.param('propertyId');
        const success = await savedPropertiesService.unsaveProperty(userId, propertyId);
        return c.json({
            success: true,
            message: success ? 'Property unsaved successfully' : 'Property was not saved'
        });
    }
    catch (error) {
        console.error('Error unsaving property:', error.message);
        return c.json({ success: false, error: 'Failed to unsave property' }, 500);
    }
};
export const getSavedPropertiesByUserId = async (c) => {
    try {
        const userId = c.req.param('userId');
        const savedProperties = await savedPropertiesService.getSavedPropertiesByUserId(userId);
        return c.json({
            success: true,
            data: savedProperties
        });
    }
    catch (error) {
        console.error('Error fetching saved properties:', error.message);
        return c.json({ success: false, error: 'Failed to fetch saved properties' }, 500);
    }
};
export const isPropertySaved = async (c) => {
    try {
        const userId = c.req.param('userId');
        const propertyId = c.req.param('propertyId');
        const isSaved = await savedPropertiesService.isPropertySaved(userId, propertyId);
        return c.json({
            success: true,
            data: { isSaved }
        });
    }
    catch (error) {
        console.error('Error checking if property is saved:', error.message);
        return c.json({ success: false, error: 'Failed to check saved status' }, 500);
    }
};
//# sourceMappingURL=savedProperties.controller.js.map