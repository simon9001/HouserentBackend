import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyMediaService {
    // Add media to property
    async addMedia(data) {
        // If this is primary, unset other primaries for this property
        if (data.isPrimary) {
            await supabase
                .from('PropertyMedia')
                .update({ IsPrimary: false })
                .eq('PropertyId', data.propertyId);
        }
        const { data: media, error } = await supabase
            .from('PropertyMedia')
            .insert({
            PropertyId: data.propertyId,
            MediaType: data.mediaType,
            MediaUrl: data.mediaUrl,
            ThumbnailUrl: data.thumbnailUrl || null,
            IsPrimary: data.isPrimary || false,
            CreatedAt: new Date().toISOString()
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return media;
    }
    // Alias for controller compatibility
    async createMedia(data) {
        return this.addMedia(data);
    }
    // Add multiple media
    async addBulkMedia(propertyId, mediaList) {
        // Handle primary flag if set in list
        const hasPrimary = mediaList.some(m => m.isPrimary);
        if (hasPrimary) {
            await supabase
                .from('PropertyMedia')
                .update({ IsPrimary: false })
                .eq('PropertyId', propertyId);
        }
        const items = mediaList.map(m => ({
            PropertyId: propertyId,
            MediaType: m.mediaType,
            MediaUrl: m.mediaUrl,
            ThumbnailUrl: m.thumbnailUrl || null,
            IsPrimary: m.isPrimary || false,
            CreatedAt: new Date().toISOString()
        }));
        const { data, error } = await supabase
            .from('PropertyMedia')
            .insert(items)
            .select();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Alias for controller compatibility
    async createBulkMedia(propertyId, mediaList) {
        return this.addBulkMedia(propertyId, mediaList);
    }
    // Get media by ID
    async getMediaById(mediaId) {
        const { data, error } = await supabase.from('PropertyMedia').select('*').eq('MediaId', mediaId).single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Update media
    async updateMedia(mediaId, updates) {
        const { data, error } = await supabase.from('PropertyMedia').update({
            MediaType: updates.mediaType,
            MediaUrl: updates.mediaUrl,
            ThumbnailUrl: updates.thumbnailUrl,
            IsPrimary: updates.isPrimary
        }).eq('MediaId', mediaId).select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get primary media
    async getPrimaryMedia(propertyId) {
        const { data } = await supabase.from('PropertyMedia').select('*').eq('PropertyId', propertyId).eq('IsPrimary', true).single();
        return data;
    }
    // Get stats
    async getMediaStatistics(...args) {
        const { count } = await supabase.from('PropertyMedia').select('*', { count: 'exact', head: true });
        return { totalMedia: count || 0 };
    }
    // Get media by property ID
    async getMediaByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('PropertyMedia')
            .select('*')
            .eq('PropertyId', propertyId)
            .order('IsPrimary', { ascending: false })
            .order('CreatedAt', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Set primary media
    async setPrimaryMedia(mediaId, propertyId) {
        if (!ValidationUtils.isValidUUID(mediaId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }
        // Unset all for this property
        await supabase
            .from('PropertyMedia')
            .update({ IsPrimary: false })
            .eq('PropertyId', propertyId);
        // Set new primary
        const { error } = await supabase
            .from('PropertyMedia')
            .update({ IsPrimary: true })
            .eq('MediaId', mediaId)
            .eq('PropertyId', propertyId); // Safety check to ensure media belongs to property
        if (error)
            throw new Error(error.message);
    }
    // Delete media
    async deleteMedia(mediaId) {
        if (!ValidationUtils.isValidUUID(mediaId))
            throw new Error('Invalid media ID format');
        const { error, count } = await supabase
            .from('PropertyMedia')
            .delete({ count: 'exact' })
            .eq('MediaId', mediaId);
        if (error)
            throw new Error(error.message);
        return (count || 0) > 0;
    }
    // Delete all media for property
    async deleteMediaByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { error, count } = await supabase
            .from('PropertyMedia')
            .delete({ count: 'exact' })
            .eq('PropertyId', propertyId);
        if (error)
            throw new Error(error.message);
        return count || 0;
    }
}
export const propertyMediaService = new PropertyMediaService();
//# sourceMappingURL=propertyMedia.service.js.map