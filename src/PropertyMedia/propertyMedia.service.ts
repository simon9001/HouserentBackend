import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface PropertyMedia {
    media_id: string;
    property_id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    media_url: string;
    thumbnail_url: string | null;
    is_primary: boolean;
    created_at: string;
}

export interface CreateMediaInput {
    propertyId: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
}

export interface UpdateMediaInput {
    mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl?: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
}

export class PropertyMediaService {

    // Add media to property
    async addMedia(data: CreateMediaInput): Promise<PropertyMedia> {
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
                created_at: now
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return media as PropertyMedia;
    }

    // Alias for controller compatibility
    async createMedia(data: CreateMediaInput): Promise<PropertyMedia> {
        return this.addMedia(data);
    }

    // Add multiple media
    async addBulkMedia(propertyId: string, mediaList: Omit<CreateMediaInput, 'propertyId'>[]): Promise<PropertyMedia[]> {
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
            created_at: now
        }));

        const { data, error } = await supabase
            .from('property_media')
            .insert(items)
            .select();

        if (error) throw new Error(error.message);

        return data as PropertyMedia[];
    }

    // Alias for controller compatibility
    async createBulkMedia(mediaList: any[]): Promise<PropertyMedia[]> {
        if (!mediaList || mediaList.length === 0) return [];

        const now = new Date().toISOString();
        const insertData = mediaList.map(m => ({
            property_id: m.propertyId,
            media_type: m.mediaType,
            media_url: m.mediaUrl,
            thumbnail_url: m.thumbnailUrl || null,
            is_primary: m.isPrimary || false,
            created_at: now
        }));

        // Check for primary media
        const hasPrimary = mediaList.some(m => m.isPrimary);
        if (hasPrimary) {
            // Get unique property IDs
            const propertyIds = [...new Set(mediaList.map(m => m.propertyId))];
            for (const propertyId of propertyIds) {
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

        if (error) throw new Error(error.message);
        return data as PropertyMedia[];
    }

    // Get media by ID
    async getMediaById(mediaId: string): Promise<PropertyMedia | null> {
        if (!ValidationUtils.isValidUUID(mediaId)) throw new Error('Invalid media ID format');

        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('media_id', mediaId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as PropertyMedia;
    }

    // Update media - FIXED
    async updateMedia(mediaId: string, updates: Partial<UpdateMediaInput>): Promise<PropertyMedia> {
        if (!ValidationUtils.isValidUUID(mediaId)) throw new Error('Invalid media ID format');

        // First, get the existing media to check if it exists and get property_id
        const existingMedia = await this.getMediaById(mediaId);
        if (!existingMedia) {
            throw new Error('Media not found');
        }

        const updateData: any = {};
        if (updates.mediaType !== undefined) updateData.media_type = updates.mediaType;
        if (updates.mediaUrl !== undefined) updateData.media_url = updates.mediaUrl;
        if (updates.thumbnailUrl !== undefined) updateData.thumbnail_url = updates.thumbnailUrl;
        
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

        if (error) throw new Error(error.message);

        return data as PropertyMedia;
    }

    // Get primary media
    async getPrimaryMedia(propertyId: string): Promise<PropertyMedia | null> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('property_id', propertyId)
            .eq('is_primary', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as PropertyMedia;
    }

    // Get media statistics
    async getMediaStatistics(propertyId?: string): Promise<{
        totalMedia: number;
        images: number;
        videos: number;
        documents: number;
        primaryMedia: number;
    }> {
        let query = supabase.from('property_media').select('*');
        
        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

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
    async getMediaByPropertyId(propertyId: string): Promise<PropertyMedia[]> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('property_id', propertyId)
            .order('is_primary', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        return data as PropertyMedia[];
    }

    // Set primary media
    async setPrimaryMedia(mediaId: string, propertyId: string): Promise<void> {
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

        if (error) throw new Error(error.message);
    }

    // Delete media
    async deleteMedia(mediaId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(mediaId)) throw new Error('Invalid media ID format');

        const { error, data } = await supabase
            .from('property_media')
            .delete()
            .eq('media_id', mediaId)
            .select('media_id');

        if (error) throw new Error(error.message);

        return (data?.length || 0) > 0;
    }

    // Delete all media for property
    async deleteMediaByPropertyId(propertyId: string): Promise<number> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { error, data } = await supabase
            .from('property_media')
            .delete()
            .eq('property_id', propertyId)
            .select('media_id');

        if (error) throw new Error(error.message);

        return data?.length || 0;
    }

    // Get media count by property
    async getMediaCountByPropertyId(propertyId: string): Promise<number> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('property_media')
            .select('media_id')
            .eq('property_id', propertyId);

        if (error) throw new Error(error.message);

        return data?.length || 0;
    }

    // Get media by type
    async getMediaByType(propertyId: string, mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT'): Promise<PropertyMedia[]> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('property_id', propertyId)
            .eq('media_type', mediaType)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        return data as PropertyMedia[];
    }

    // Get all media (admin)
    async getAllMedia(limit: number = 100, offset: number = 0): Promise<PropertyMedia[]> {
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        return data as PropertyMedia[];
    }

    // Rotate primary media (set next media as primary) - NEW
    async rotatePrimaryMedia(propertyId: string): Promise<PropertyMedia | null> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const mediaList = await this.getMediaByPropertyId(propertyId);
        if (mediaList.length === 0) return null;

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

    // Check if property has any media - NEW
    async hasMedia(propertyId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('property_media')
            .select('media_id')
            .eq('property_id', propertyId)
            .limit(1);

        if (error) throw new Error(error.message);

        return (data?.length || 0) > 0;
    }
}

export const propertyMediaService = new PropertyMediaService();