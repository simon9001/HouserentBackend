import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyMediaService {
    // Add media to property - UPDATED WITH CLOUDINARY FIELDS
    async addMedia(data) {
        // If this is primary, unset other primaries for this property
        if (data.isPrimary) {
            await supabase
                .from('property_media')
                .update({ is_primary: false })
                .eq('property_id', data.propertyId);
        }
        const now = new Date().toISOString();
        const { data: media, error } = await supabase
            .from('property_media')
            .insert({
            property_id: data.propertyId,
            media_type: data.mediaType,
            media_url: data.mediaUrl,
            thumbnail_url: data.thumbnailUrl || null,
            is_primary: data.isPrimary || false,
            cloudinary_public_id: data.cloudinaryPublicId || null,
            file_size: data.fileSize || null,
            format: data.format || null,
            dimensions: data.dimensions || null,
            created_at: now
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
    // Add multiple media - UPDATED WITH CLOUDINARY FIELDS
    async addBulkMedia(propertyId, mediaList) {
        // Handle primary flag if set in list
        const hasPrimary = mediaList.some(m => m.isPrimary);
        if (hasPrimary) {
            await supabase
                .from('property_media')
                .update({ is_primary: false })
                .eq('property_id', propertyId);
        }
        const now = new Date().toISOString();
        const items = mediaList.map(m => ({
            property_id: propertyId,
            media_type: m.mediaType,
            media_url: m.mediaUrl,
            thumbnail_url: m.thumbnailUrl || null,
            is_primary: m.isPrimary || false,
            cloudinary_public_id: m.cloudinaryPublicId || null,
            file_size: m.fileSize || null,
            format: m.format || null,
            dimensions: m.dimensions || null,
            created_at: now
        }));
        const { data, error } = await supabase
            .from('property_media')
            .insert(items)
            .select();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Alias for controller compatibility - UPDATED WITH CLOUDINARY FIELDS
    async createBulkMedia(mediaList) {
        if (!mediaList || mediaList.length === 0)
            return [];
        const now = new Date().toISOString();
        const insertData = mediaList.map(m => ({
            property_id: m.propertyId,
            media_type: m.mediaType,
            media_url: m.mediaUrl,
            thumbnail_url: m.thumbnailUrl || null,
            is_primary: m.isPrimary || false,
            cloudinary_public_id: m.cloudinaryPublicId || null,
            file_size: m.fileSize || null,
            format: m.format || null,
            dimensions: m.dimensions || null,
            created_at: now
        }));
        // Check for primary media and handle property-wise
        const mediaByProperty = new Map();
        mediaList.forEach(media => {
            if (!mediaByProperty.has(media.propertyId)) {
                mediaByProperty.set(media.propertyId, []);
            }
            mediaByProperty.get(media.propertyId).push(media);
        });
        // Unset existing primaries for each property that has new primary media
        for (const [propertyId, propertyMedia] of mediaByProperty) {
            const hasPrimary = propertyMedia.some(m => m.isPrimary);
            if (hasPrimary) {
                await supabase
                    .from('property_media')
                    .update({ is_primary: false })
                    .eq('property_id', propertyId);
            }
        }
        const { data, error } = await supabase
            .from('property_media')
            .insert(insertData)
            .select();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get media by ID
    async getMediaById(mediaId) {
        if (!ValidationUtils.isValidUUID(mediaId))
            throw new Error('Invalid media ID format');
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('media_id', mediaId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return data;
    }
    // Update media - UPDATED WITH CLOUDINARY FIELDS
    async updateMedia(mediaId, updates) {
        if (!ValidationUtils.isValidUUID(mediaId))
            throw new Error('Invalid media ID format');
        // First, get the existing media to check if it exists and get property_id
        const existingMedia = await this.getMediaById(mediaId);
        if (!existingMedia) {
            throw new Error('Media not found');
        }
        const updateData = {};
        if (updates.mediaType !== undefined)
            updateData.media_type = updates.mediaType;
        if (updates.mediaUrl !== undefined)
            updateData.media_url = updates.mediaUrl;
        if (updates.thumbnailUrl !== undefined)
            updateData.thumbnail_url = updates.thumbnailUrl;
        if (updates.cloudinaryPublicId !== undefined)
            updateData.cloudinary_public_id = updates.cloudinaryPublicId;
        if (updates.fileSize !== undefined)
            updateData.file_size = updates.fileSize;
        if (updates.format !== undefined)
            updateData.format = updates.format;
        if (updates.dimensions !== undefined)
            updateData.dimensions = updates.dimensions;
        // Handle isPrimary update
        if (updates.isPrimary !== undefined) {
            updateData.is_primary = updates.isPrimary;
            if (updates.isPrimary) {
                // Unset all other primaries for this property
                await supabase
                    .from('property_media')
                    .update({ is_primary: false })
                    .eq('property_id', existingMedia.property_id)
                    .neq('media_id', mediaId);
            }
        }
        // Check if there are any updates to make
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update');
        }
        const { data, error } = await supabase
            .from('property_media')
            .update(updateData)
            .eq('media_id', mediaId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get primary media
    async getPrimaryMedia(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('property_id', propertyId)
            .eq('is_primary', true)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return data;
    }
    // Get media statistics
    async getMediaStatistics(propertyId) {
        let query = supabase.from('property_media').select('*');
        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        const mediaList = data || [];
        return {
            totalMedia: mediaList.length,
            images: mediaList.filter(m => m.media_type === 'IMAGE').length,
            videos: mediaList.filter(m => m.media_type === 'VIDEO').length,
            documents: mediaList.filter(m => m.media_type === 'DOCUMENT').length,
            primaryMedia: mediaList.filter(m => m.is_primary).length
        };
    }
    // Get media by property ID
    async getMediaByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('property_id', propertyId)
            .order('is_primary', { ascending: false })
            .order('created_at', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Set primary media
    async setPrimaryMedia(mediaId, propertyId) {
        if (!ValidationUtils.isValidUUID(mediaId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }
        // Verify media exists and belongs to property
        const { data: media, error: mediaError } = await supabase
            .from('property_media')
            .select('media_id')
            .eq('media_id', mediaId)
            .eq('property_id', propertyId)
            .single();
        if (mediaError || !media) {
            throw new Error('Media not found or does not belong to property');
        }
        // Unset all for this property
        await supabase
            .from('property_media')
            .update({ is_primary: false })
            .eq('property_id', propertyId);
        // Set new primary
        const { error } = await supabase
            .from('property_media')
            .update({ is_primary: true })
            .eq('media_id', mediaId);
        if (error)
            throw new Error(error.message);
    }
    // Delete media
    async deleteMedia(mediaId) {
        if (!ValidationUtils.isValidUUID(mediaId))
            throw new Error('Invalid media ID format');
        const { error, data } = await supabase
            .from('property_media')
            .delete()
            .eq('media_id', mediaId)
            .select('media_id');
        if (error)
            throw new Error(error.message);
        return (data?.length || 0) > 0;
    }
    // Delete all media for property
    async deleteMediaByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { error, data } = await supabase
            .from('property_media')
            .delete()
            .eq('property_id', propertyId)
            .select('media_id');
        if (error)
            throw new Error(error.message);
        return data?.length || 0;
    }
    // Get media count by property
    async getMediaCountByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('property_media')
            .select('media_id')
            .eq('property_id', propertyId);
        if (error)
            throw new Error(error.message);
        return data?.length || 0;
    }
    // Get media by type
    async getMediaByType(propertyId, mediaType) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('property_id', propertyId)
            .eq('media_type', mediaType)
            .order('created_at', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get all media (admin)
    async getAllMedia(limit = 100, offset = 0) {
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get media with Cloudinary info
    async getMediaWithCloudinaryInfo(propertyId) {
        let query = supabase.from('property_media').select('*');
        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Update Cloudinary info for media
    async updateCloudinaryInfo(mediaId, cloudinaryData) {
        if (!ValidationUtils.isValidUUID(mediaId))
            throw new Error('Invalid media ID format');
        const updateData = {};
        if (cloudinaryData.publicId !== undefined)
            updateData.cloudinary_public_id = cloudinaryData.publicId;
        if (cloudinaryData.fileSize !== undefined)
            updateData.file_size = cloudinaryData.fileSize;
        if (cloudinaryData.format !== undefined)
            updateData.format = cloudinaryData.format;
        if (cloudinaryData.dimensions !== undefined)
            updateData.dimensions = cloudinaryData.dimensions;
        if (Object.keys(updateData).length === 0) {
            throw new Error('No Cloudinary data to update');
        }
        const { data, error } = await supabase
            .from('property_media')
            .update(updateData)
            .eq('media_id', mediaId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Find media by Cloudinary public ID
    async findMediaByCloudinaryPublicId(publicId) {
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('cloudinary_public_id', publicId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return data;
    }
    // Get media statistics with Cloudinary info
    async getCloudinaryStatistics(propertyId) {
        let query = supabase.from('property_media').select('*');
        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        const mediaList = data || [];
        const withCloudinaryInfo = mediaList.filter(m => m.cloudinary_public_id).length;
        const withoutCloudinaryInfo = mediaList.length - withCloudinaryInfo;
        const totalFileSize = mediaList.reduce((sum, m) => sum + (m.file_size || 0), 0);
        return {
            totalMedia: mediaList.length,
            withCloudinaryInfo,
            withoutCloudinaryInfo,
            byResourceType: {
                images: mediaList.filter(m => m.media_type === 'IMAGE').length,
                videos: mediaList.filter(m => m.media_type === 'VIDEO').length,
                documents: mediaList.filter(m => m.media_type === 'DOCUMENT').length
            },
            totalFileSize,
            averageFileSize: mediaList.length > 0 ? Math.round(totalFileSize / mediaList.length) : 0
        };
    }
    // Rotate primary media (set next media as primary)
    async rotatePrimaryMedia(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const mediaList = await this.getMediaByPropertyId(propertyId);
        if (mediaList.length === 0)
            return null;
        // Find current primary index
        const currentPrimaryIndex = mediaList.findIndex(m => m.is_primary);
        let nextIndex = 0;
        if (currentPrimaryIndex >= 0) {
            // Set next media as primary (circular)
            nextIndex = (currentPrimaryIndex + 1) % mediaList.length;
        }
        const nextMedia = mediaList[nextIndex];
        await this.setPrimaryMedia(nextMedia.media_id, propertyId);
        return await this.getMediaById(nextMedia.media_id);
    }
    // Check if property has any media
    async hasMedia(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('property_media')
            .select('media_id')
            .eq('property_id', propertyId)
            .limit(1);
        if (error)
            throw new Error(error.message);
        return (data?.length || 0) > 0;
    }
    // Clean up orphaned Cloudinary records (media with Cloudinary IDs but invalid URLs)
    async cleanupOrphanedMedia() {
        const errors = [];
        let cleaned = 0;
        try {
            // Find media with cloudinary_public_id but invalid media_url
            const { data: mediaList, error } = await supabase
                .from('property_media')
                .select('*')
                .not('cloudinary_public_id', 'is', null);
            if (error)
                throw error;
            for (const media of mediaList || []) {
                try {
                    // Check if URL is valid (basic check)
                    if (!media.media_url || !media.media_url.startsWith('http')) {
                        // Delete from database
                        await this.deleteMedia(media.media_id);
                        cleaned++;
                    }
                }
                catch (err) {
                    errors.push(`Failed to process media ${media.media_id}: ${err.message}`);
                }
            }
        }
        catch (error) {
            errors.push(`Failed to fetch media: ${error.message}`);
        }
        return { cleaned, errors };
    }
    // Get media grouped by Cloudinary folder
    async getMediaByCloudinaryFolder() {
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .not('cloudinary_public_id', 'is', null);
        if (error)
            throw new Error(error.message);
        const grouped = {};
        (data || []).forEach(media => {
            if (media.cloudinary_public_id) {
                // Extract folder from public_id (format: folder/filename)
                const parts = media.cloudinary_public_id.split('/');
                if (parts.length > 1) {
                    const folder = parts.slice(0, -1).join('/');
                    if (!grouped[folder]) {
                        grouped[folder] = [];
                    }
                    grouped[folder].push(media);
                }
                else {
                    // No folder, put in root
                    if (!grouped['root']) {
                        grouped['root'] = [];
                    }
                    grouped['root'].push(media);
                }
            }
        });
        return grouped;
    }
}
export const propertyMediaService = new PropertyMediaService();
//# sourceMappingURL=propertyMedia.service.js.map