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
    // Add Cloudinary fields
    cloudinary_public_id?: string | null;
    file_size?: number | null;
    format?: string | null;
    dimensions?: string | null;
}

export interface CreateMediaInput {
    propertyId: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
    // Add Cloudinary fields
    cloudinaryPublicId?: string | null;
    fileSize?: number | null;
    format?: string | null;
    dimensions?: string | null;
}

export interface UpdateMediaInput {
    mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    mediaUrl?: string;
    thumbnailUrl?: string;
    isPrimary?: boolean;
    cloudinaryPublicId?: string | null;
    fileSize?: number | null;
    format?: string | null;
    dimensions?: string | null;
}

export class PropertyMediaService {

    // Add media to property - UPDATED WITH CLOUDINARY FIELDS
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
                cloudinary_public_id: data.cloudinaryPublicId || null,
                file_size: data.fileSize || null,
                format: data.format || null,
                dimensions: data.dimensions || null,
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

    // Add multiple media - UPDATED WITH CLOUDINARY FIELDS
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

        if (error) throw new Error(error.message);

        return data as PropertyMedia[];
    }

    // Alias for controller compatibility - UPDATED WITH CLOUDINARY FIELDS
    async createBulkMedia(mediaList: CreateMediaInput[]): Promise<PropertyMedia[]> {
        if (!mediaList || mediaList.length === 0) return [];

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
        const mediaByProperty = new Map<string, CreateMediaInput[]>();
        mediaList.forEach(media => {
            if (!mediaByProperty.has(media.propertyId)) {
                mediaByProperty.set(media.propertyId, []);
            }
            mediaByProperty.get(media.propertyId)!.push(media);
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

    // Update media - UPDATED WITH CLOUDINARY FIELDS
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
        if (updates.cloudinaryPublicId !== undefined) updateData.cloudinary_public_id = updates.cloudinaryPublicId;
        if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
        if (updates.format !== undefined) updateData.format = updates.format;
        if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions;
        
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

    // Get media with Cloudinary info
    async getMediaWithCloudinaryInfo(propertyId?: string): Promise<PropertyMedia[]> {
        let query = supabase.from('property_media').select('*');
        
        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return data as PropertyMedia[];
    }

    // Update Cloudinary info for media
    async updateCloudinaryInfo(mediaId: string, cloudinaryData: {
        publicId?: string;
        fileSize?: number;
        format?: string;
        dimensions?: string;
    }): Promise<PropertyMedia> {
        if (!ValidationUtils.isValidUUID(mediaId)) throw new Error('Invalid media ID format');

        const updateData: any = {};
        if (cloudinaryData.publicId !== undefined) updateData.cloudinary_public_id = cloudinaryData.publicId;
        if (cloudinaryData.fileSize !== undefined) updateData.file_size = cloudinaryData.fileSize;
        if (cloudinaryData.format !== undefined) updateData.format = cloudinaryData.format;
        if (cloudinaryData.dimensions !== undefined) updateData.dimensions = cloudinaryData.dimensions;

        if (Object.keys(updateData).length === 0) {
            throw new Error('No Cloudinary data to update');
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

    // Find media by Cloudinary public ID
    async findMediaByCloudinaryPublicId(publicId: string): Promise<PropertyMedia | null> {
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .eq('cloudinary_public_id', publicId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data as PropertyMedia;
    }

    // Get media statistics with Cloudinary info
    async getCloudinaryStatistics(propertyId?: string): Promise<{
        totalMedia: number;
        withCloudinaryInfo: number;
        withoutCloudinaryInfo: number;
        byResourceType: {
            images: number;
            videos: number;
            documents: number;
        };
        totalFileSize: number;
        averageFileSize: number;
    }> {
        let query = supabase.from('property_media').select('*');
        
        if (propertyId) {
            query = query.eq('property_id', propertyId);
        }

        const { data, error } = await query;
        if (error) throw new Error(error.message);

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

    // Check if property has any media
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

    // Clean up orphaned Cloudinary records (media with Cloudinary IDs but invalid URLs)
    async cleanupOrphanedMedia(): Promise<{ cleaned: number; errors: string[] }> {
        const errors: string[] = [];
        let cleaned = 0;

        try {
            // Find media with cloudinary_public_id but invalid media_url
            const { data: mediaList, error } = await supabase
                .from('property_media')
                .select('*')
                .not('cloudinary_public_id', 'is', null);

            if (error) throw error;

            for (const media of mediaList || []) {
                try {
                    // Check if URL is valid (basic check)
                    if (!media.media_url || !media.media_url.startsWith('http')) {
                        // Delete from database
                        await this.deleteMedia(media.media_id);
                        cleaned++;
                    }
                } catch (err: any) {
                    errors.push(`Failed to process media ${media.media_id}: ${err.message}`);
                }
            }
        } catch (error: any) {
            errors.push(`Failed to fetch media: ${error.message}`);
        }

        return { cleaned, errors };
    }

    // Get media grouped by Cloudinary folder
    async getMediaByCloudinaryFolder(): Promise<Record<string, PropertyMedia[]>> {
        const { data, error } = await supabase
            .from('property_media')
            .select('*')
            .not('cloudinary_public_id', 'is', null);

        if (error) throw new Error(error.message);

        const grouped: Record<string, PropertyMedia[]> = {};

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
                } else {
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