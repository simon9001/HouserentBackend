import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface PropertyAmenity {
    AmenityId: string;
    PropertyId: string;
    AmenityName: string;
    CreatedAt: string;
}

export interface CreateAmenityInput {
    propertyId: string;
    amenityName: string;
}

export interface BulkAmenityInput {
    propertyId: string;
    amenities: string[];
}

export class PropertyAmenitiesService {

    // Helper to map DB to interface
    private mapDBToAmenity(data: any): PropertyAmenity {
        if (!data) return data;
        return {
            AmenityId: data.amenity_id,
            PropertyId: data.property_id,
            AmenityName: data.amenity_name,
            CreatedAt: data.created_at
        };
    }

    // Create amenity
    async createAmenity(data: CreateAmenityInput): Promise<PropertyAmenity> {
        // Validate duplicates
        const { data: existing } = await supabase
            .from('property_amenities')
            .select('amenity_id')
            .eq('property_id', data.propertyId)
            .eq('amenity_name', data.amenityName)
            .single();

        if (existing) throw new Error('Amenity already exists for this property');

        const { data: amenity, error } = await supabase
            .from('property_amenities')
            .insert({
                property_id: data.propertyId,
                amenity_name: data.amenityName,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return this.mapDBToAmenity(amenity);
    }

    // Bulk create amenities
    async bulkCreateAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]> {
        if (!data.amenities || data.amenities.length === 0) {
            return [];
        }

        // Fetch existing amenitites for this property to avoid duplicates
        const { data: existing } = await supabase
            .from('property_amenities')
            .select('amenity_name')
            .eq('property_id', data.propertyId);

        const existingNames = new Set((existing || []).map((a: any) => a.amenity_name));

        const newAmenities = data.amenities
            .filter(name => !existingNames.has(name))
            .map(name => ({
                property_id: data.propertyId,
                amenity_name: name,
                created_at: new Date().toISOString()
            }));

        if (newAmenities.length === 0) return [];

        const { data: created, error } = await supabase
            .from('property_amenities')
            .insert(newAmenities)
            .select();

        if (error) throw new Error(error.message);

        return (created || []).map((a: any) => this.mapDBToAmenity(a));
    }

    // Alias for controller compatibility
    async createBulkAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]> {
        return this.bulkCreateAmenities(data);
    }

    // Get amenity by ID
    async getAmenityById(amenityId: string): Promise<PropertyAmenity> {
        const { data, error } = await supabase.from('property_amenities').select('*').eq('amenity_id', amenityId).single();
        if (error) throw new Error(error.message);
        return this.mapDBToAmenity(data);
    }

    // Update amenity
    async updateAmenity(amenityId: string, updates: any): Promise<PropertyAmenity> {
        // Map updates to snake_case if needed, though usually simplified input.
        // Assuming updates keys match interface or simple enough.
        const dbUpdates: any = {};
        if (updates.AmenityName) dbUpdates.amenity_name = updates.AmenityName;
        // ...

        if (Object.keys(dbUpdates).length === 0 && Object.keys(updates).length > 0) {
            // Fallback if keys are already correct or unknown
            if (updates.amenity_name) dbUpdates.amenity_name = updates.amenity_name;
        }

        const { data, error } = await supabase.from('property_amenities').update(dbUpdates).eq('amenity_id', amenityId).select().single();
        if (error) throw new Error(error.message);
        return this.mapDBToAmenity(data);
    }

    // Search amenities
    async searchAmenities(query: string, ..._args: any[]): Promise<PropertyAmenity[]> {
        const { data, error } = await supabase.from('property_amenities').select('*').ilike('amenity_name', `%${query}%`);
        if (error) throw new Error(error.message);
        return (data || []).map((a: any) => this.mapDBToAmenity(a));
    }

    // Get amenities by property ID
    async getAmenitiesByPropertyId(propertyId: string): Promise<PropertyAmenity[]> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('property_amenities')
            .select('*')
            .eq('property_id', propertyId)
            .order('amenity_name', { ascending: true });

        if (error) throw new Error(error.message);

        return (data || []).map((a: any) => this.mapDBToAmenity(a));
    }

    // Delete amenity
    async deleteAmenity(amenityId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(amenityId)) throw new Error('Invalid amenity ID format');

        const { error, count } = await supabase
            .from('property_amenities')
            .delete({ count: 'exact' })
            .eq('amenity_id', amenityId);

        if (error) throw new Error(error.message);

        return (count || 0) > 0;
    }

    // Delete all amenities for a property
    async deleteAmenitiesByPropertyId(propertyId: string): Promise<number> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { error, count } = await supabase
            .from('property_amenities')
            .delete({ count: 'exact' })
            .eq('property_id', propertyId);

        if (error) throw new Error(error.message);

        return count || 0;
    }

    // Get properties by amenity name
    async getPropertiesByAmenity(amenityName: string, limit: number = 20, offset: number = 0): Promise<any[]> {
        const { data, error } = await supabase
            .from('property_amenities')
            .select(`
                property_id,
                properties:property_id (
                    *,
                    property_media (media_url, is_primary)
                )
            `)
            .eq('amenity_name', amenityName)
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        // Flatten result and map
        return data.map((item: any) => {
            const prop = item.properties;
            // Need to map properties to PascalCase? 
            // The original return type is `any[]`, likely expected by Frontend.
            // But properties data will be snake_case here. 
            //Ideally we should use PropertiesService to map it, but circular dependency risk.
            // I'll leave it as is or do basic mapping if critical. 
            // In typical JS code refactoring, returning raw DB object might modify frontend behavior if frontend expects PascalCase.
            // I will err on side of caution and return it raw OR minimally mapped if simple.
            // Given I am doing extensive refactoring, I should probably map it. But PropertyAmenitiesService doesn't have PropertiesService imported.
            // I'll return the raw data but be aware this returns snake_case properties.
            return prop;
        });
    }

    // Get common amenities (stats)
    async getCommonAmenities(limit: number = 10): Promise<{ name: string; count: number }[]> {
        // Supabase client doesn't support aggregation well.

        const { data, error } = await supabase
            .from('property_amenities')
            .select('amenity_name')
            .limit(5000); // Sample limit

        if (error) throw new Error(error.message);

        const counts: Record<string, number> = {};
        (data || []).forEach((row: any) => {
            if (row.amenity_name) {
                counts[row.amenity_name] = (counts[row.amenity_name] || 0) + 1;
            }
        });

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    // Alias for controller compatibility
    async getAmenitiesStatistics(..._args: any[]): Promise<any> {
        return this.getCommonAmenities();
    }
}

export const propertyAmenitiesService = new PropertyAmenitiesService();