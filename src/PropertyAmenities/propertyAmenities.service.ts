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

    // Create amenity
    async createAmenity(data: CreateAmenityInput): Promise<PropertyAmenity> {
        // Validate duplicates
        const { data: existing } = await supabase
            .from('PropertyAmenities')
            .select('AmenityId')
            .eq('PropertyId', data.propertyId)
            .eq('AmenityName', data.amenityName)
            .single();

        if (existing) throw new Error('Amenity already exists for this property');

        const { data: amenity, error } = await supabase
            .from('PropertyAmenities')
            .insert({
                PropertyId: data.propertyId,
                AmenityName: data.amenityName,
                CreatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return amenity as PropertyAmenity;
    }

    // Bulk create amenities
    async bulkCreateAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]> {
        if (!data.amenities || data.amenities.length === 0) {
            return [];
        }

        // Fetch existing amenitites for this property to avoid duplicates
        const { data: existing } = await supabase
            .from('PropertyAmenities')
            .select('AmenityName')
            .eq('PropertyId', data.propertyId);

        const existingNames = new Set((existing || []).map(a => a.AmenityName));

        const newAmenities = data.amenities
            .filter(name => !existingNames.has(name))
            .map(name => ({
                PropertyId: data.propertyId,
                AmenityName: name,
                CreatedAt: new Date().toISOString()
            }));

        if (newAmenities.length === 0) return [];

        const { data: created, error } = await supabase
            .from('PropertyAmenities')
            .insert(newAmenities)
            .select();

        if (error) throw new Error(error.message);

        return created as PropertyAmenity[];
    }

    // Alias for controller compatibility
    async createBulkAmenities(data: BulkAmenityInput): Promise<PropertyAmenity[]> {
        return this.bulkCreateAmenities(data);
    }

    // Get amenity by ID
    async getAmenityById(amenityId: string): Promise<PropertyAmenity> {
        const { data, error } = await supabase.from('PropertyAmenities').select('*').eq('AmenityId', amenityId).single();
        if (error) throw new Error(error.message);
        return data as PropertyAmenity;
    }

    // Update amenity
    async updateAmenity(amenityId: string, updates: any): Promise<PropertyAmenity> {
        const { data, error } = await supabase.from('PropertyAmenities').update(updates).eq('AmenityId', amenityId).select().single();
        if (error) throw new Error(error.message);
        return data as PropertyAmenity;
    }

    // Search amenities
    async searchAmenities(query: string, ..._args: any[]): Promise<PropertyAmenity[]> {
        const { data, error } = await supabase.from('PropertyAmenities').select('*').ilike('AmenityName', `%${query}%`);
        if (error) throw new Error(error.message);
        return data as PropertyAmenity[];
    }

    // Get amenities by property ID
    async getAmenitiesByPropertyId(propertyId: string): Promise<PropertyAmenity[]> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('PropertyAmenities')
            .select('*')
            .eq('PropertyId', propertyId)
            .order('AmenityName', { ascending: true });

        if (error) throw new Error(error.message);

        return data as PropertyAmenity[];
    }

    // Delete amenity
    async deleteAmenity(amenityId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(amenityId)) throw new Error('Invalid amenity ID format');

        const { error, count } = await supabase
            .from('PropertyAmenities')
            .delete({ count: 'exact' })
            .eq('AmenityId', amenityId);

        if (error) throw new Error(error.message);

        return (count || 0) > 0;
    }

    // Delete all amenities for a property
    async deleteAmenitiesByPropertyId(propertyId: string): Promise<number> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { error, count } = await supabase
            .from('PropertyAmenities')
            .delete({ count: 'exact' })
            .eq('PropertyId', propertyId);

        if (error) throw new Error(error.message);

        return count || 0;
    }

    // Get properties by amenity name
    async getPropertiesByAmenity(amenityName: string, limit: number = 20, offset: number = 0): Promise<any[]> {
        const { data, error } = await supabase
            .from('PropertyAmenities')
            .select(`
                PropertyId,
                Properties:PropertyId (
                    *,
                    PropertyMedia (MediaUrl, IsPrimary)
                )
            `)
            .eq('AmenityName', amenityName)
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        // Flatten result
        return data.map((item: any) => {
            const prop = item.Properties;
            return prop; // Returns the property object directly
        });
    }

    // Get common amenities (stats)
    async getCommonAmenities(limit: number = 10): Promise<{ name: string; count: number }[]> {
        // Supabase client doesn't support aggregation well.
        // Fetch all amenities names and count in JS (expensive but standard for migration without RPC)
        // Or if table is large, this will be slow/fail.
        // Assuming we can select AmenityName from all rows?
        // Warning: This is not scalable. 
        // Better: Use a dedicated RPC or View. 
        // For now: Fetch top 1000 and approximate, or fetch all if small.
        // Let's assume reasonable size or just return empty if too risky.
        // I'll implementing a safe limit fetch.

        const { data, error } = await supabase
            .from('PropertyAmenities')
            .select('AmenityName')
            .limit(5000); // Sample limit

        if (error) throw new Error(error.message);

        const counts: Record<string, number> = {};
        data.forEach((row: any) => {
            counts[row.AmenityName] = (counts[row.AmenityName] || 0) + 1;
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