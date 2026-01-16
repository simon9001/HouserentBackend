import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface SavedProperty {
    SavedId: string;
    UserId: string;
    PropertyId: string;
    CreatedAt: string;
    // Joined fields from Properties
    Title?: string;
    Description?: string;
    RentAmount?: number;
    County?: string;
    Area?: string;
    PropertyType?: string;
    PrimaryImageUrl?: string;
}

export class SavedPropertiesService {

    // Helper to map DB result to SavedProperty interface
    private mapDBToSavedProperty(data: any): SavedProperty {
        if (!data) return data;
        const mapped: any = {
            SavedId: data.saved_id,
            UserId: data.user_id,
            PropertyId: data.property_id,
            CreatedAt: data.created_at
        };

        if (data.Properties) {
            mapped.Title = data.Properties.title;
            mapped.Description = data.Properties.description;
            mapped.RentAmount = data.Properties.rent_amount;
            mapped.County = data.Properties.county;
            mapped.Area = data.Properties.area;
            mapped.PropertyType = data.Properties.property_type;

            // Handle Media
            const media = data.Properties.PropertyMedia;
            if (media && Array.isArray(media)) {
                // Find primary or take first. The media table uses snake_case cols based on PropertyMediaService
                // But PropertyMediaService query returns result.
                // PropertyMedia table cols: media_url, is_primary
                const primary = media.find((m: any) => m.is_primary) || media[0];
                if (primary) mapped.PrimaryImageUrl = primary.media_url;
            }
        }

        return mapped as SavedProperty;
    }

    async saveProperty(userId: string, propertyId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }

        // Check if already saved
        const { data: existing, error: checkError } = await supabase
            .from('saved_properties')
            .select('saved_id')
            .eq('user_id', userId)
            .eq('property_id', propertyId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') throw new Error(checkError.message);

        if (existing) {
            return false; // Already saved
        }

        const { error } = await supabase
            .from('saved_properties')
            .insert({
                user_id: userId,
                property_id: propertyId,
                created_at: new Date().toISOString()
            });

        if (error) throw new Error(error.message);

        return true;
    }

    async unsaveProperty(userId: string, propertyId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid ID format');
        }

        const { error, count } = await supabase
            .from('saved_properties')
            .delete({ count: 'exact' })
            .eq('user_id', userId)
            .eq('property_id', propertyId);

        if (error) throw new Error(error.message);

        return (count || 0) > 0;
    }

    async getSavedPropertiesByUserId(userId: string): Promise<SavedProperty[]> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        // We need: saved_properties -> properties -> property_media (limit 1)
        // Join properties on property_id
        // Join property_media on properties.property_id (nested?)
        // Supabase syntax: properties:property_id (..., PropertyMedia:property_media(...))
        // Note: Relation name for property_media might be property_media or inferred.

        const { data, error } = await supabase
            .from('saved_properties')
            .select(`
                *,
                Properties:property_id!inner (
                    title, description, rent_amount, county, area, property_type,
                    PropertyMedia:property_media (media_url, is_primary)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return (data || []).map(item => this.mapDBToSavedProperty(item));
    }

    async isPropertySaved(userId: string, propertyId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId) || !ValidationUtils.isValidUUID(propertyId)) {
            return false;
        }

        const { data, error } = await supabase
            .from('saved_properties')
            .select('saved_id')
            .eq('user_id', userId)
            .eq('property_id', propertyId)
            .single();

        if (error || !data) return false;
        return true;
    }
}

export const savedPropertiesService = new SavedPropertiesService();
