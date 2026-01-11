import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class SavedPropertiesService {
    async saveProperty(userId, propertyId) {
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }
        // Check if already saved
        const { data: existing, error: checkError } = await supabase
            .from('SavedProperties')
            .select('SavedId')
            .eq('UserId', userId)
            .eq('PropertyId', propertyId)
            .single();
        if (checkError && checkError.code !== 'PGRST116')
            throw new Error(checkError.message);
        if (existing) {
            return false; // Already saved
        }
        const { error } = await supabase
            .from('SavedProperties')
            .insert({
            UserId: userId,
            PropertyId: propertyId,
            CreatedAt: new Date().toISOString()
        });
        if (error)
            throw new Error(error.message);
        return true;
    }
    async unsaveProperty(userId, propertyId) {
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }
        const { error, count } = await supabase
            .from('SavedProperties')
            .delete({ count: 'exact' })
            .eq('UserId', userId)
            .eq('PropertyId', propertyId);
        if (error)
            throw new Error(error.message);
        return (count || 0) > 0;
    }
    async getSavedPropertiesByUserId(userId) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        // We need: SavedProperties -> Properties -> PropertyMedia (limit 1)
        // Query: *, Properties!inner (*, PropertyMedia(MediaUrl))
        const { data, error } = await supabase
            .from('SavedProperties')
            .select(`
                *,
                Properties:PropertyId!inner (
                    Title, Description, RentAmount, County, Area, PropertyType,
                    PropertyMedia (MediaUrl, IsPrimary)
                )
            `)
            .eq('UserId', userId)
            .order('CreatedAt', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((item) => {
            const prop = item.Properties;
            let primaryImage = null;
            if (prop && prop.PropertyMedia && Array.isArray(prop.PropertyMedia)) {
                // Find primary or take first
                const primary = prop.PropertyMedia.find((m) => m.IsPrimary) || prop.PropertyMedia[0];
                if (primary)
                    primaryImage = primary.MediaUrl;
            }
            return {
                SavedId: item.SavedId,
                UserId: item.UserId,
                PropertyId: item.PropertyId,
                CreatedAt: item.CreatedAt,
                Title: prop?.Title,
                Description: prop?.Description,
                RentAmount: prop?.RentAmount,
                County: prop?.County,
                Area: prop?.Area,
                PropertyType: prop?.PropertyType,
                PrimaryImageUrl: primaryImage
            };
        });
    }
    async isPropertySaved(userId, propertyId) {
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            return false;
        }
        const { data, error } = await supabase
            .from('SavedProperties')
            .select('SavedId')
            .eq('UserId', userId)
            .eq('PropertyId', propertyId)
            .single();
        if (error || !data)
            return false;
        return true;
    }
}
export const savedPropertiesService = new SavedPropertiesService();
//# sourceMappingURL=savedProperties.service.js.map