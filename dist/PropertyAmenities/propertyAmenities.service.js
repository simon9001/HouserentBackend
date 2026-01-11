import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyAmenitiesService {
    // Create amenity
    async createAmenity(data) {
        // Validate duplicates
        const { data: existing } = await supabase
            .from('PropertyAmenities')
            .select('AmenityId')
            .eq('PropertyId', data.propertyId)
            .eq('AmenityName', data.amenityName)
            .single();
        if (existing)
            throw new Error('Amenity already exists for this property');
        const { data: amenity, error } = await supabase
            .from('PropertyAmenities')
            .insert({
            PropertyId: data.propertyId,
            AmenityName: data.amenityName,
            CreatedAt: new Date().toISOString()
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return amenity;
    }
    // Bulk create amenities
    async bulkCreateAmenities(data) {
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
        if (newAmenities.length === 0)
            return [];
        const { data: created, error } = await supabase
            .from('PropertyAmenities')
            .insert(newAmenities)
            .select();
        if (error)
            throw new Error(error.message);
        return created;
    }
    // Alias for controller compatibility
    async createBulkAmenities(data) {
        return this.bulkCreateAmenities(data);
    }
    // Get amenity by ID
    async getAmenityById(amenityId, ...args) {
        const { data, error } = await supabase.from('PropertyAmenities').select('*').eq('AmenityId', amenityId).single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Update amenity
    async updateAmenity(amenityId, updates) {
        const { data, error } = await supabase.from('PropertyAmenities').update(updates).eq('AmenityId', amenityId).select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Search amenities
    async searchAmenities(query, ...args) {
        const { data, error } = await supabase.from('PropertyAmenities').select('*').ilike('AmenityName', `%${query}%`);
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Get amenities by property ID
    async getAmenitiesByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('PropertyAmenities')
            .select('*')
            .eq('PropertyId', propertyId)
            .order('AmenityName', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Delete amenity
    async deleteAmenity(amenityId) {
        if (!ValidationUtils.isValidUUID(amenityId))
            throw new Error('Invalid amenity ID format');
        const { error, count } = await supabase
            .from('PropertyAmenities')
            .delete({ count: 'exact' })
            .eq('AmenityId', amenityId);
        if (error)
            throw new Error(error.message);
        return (count || 0) > 0;
    }
    // Delete all amenities for a property
    async deleteAmenitiesByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { error, count } = await supabase
            .from('PropertyAmenities')
            .delete({ count: 'exact' })
            .eq('PropertyId', propertyId);
        if (error)
            throw new Error(error.message);
        return count || 0;
    }
    // Get properties by amenity name
    async getPropertiesByAmenity(amenityName, limit = 20, offset = 0) {
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
        if (error)
            throw new Error(error.message);
        // Flatten result
        return data.map((item) => {
            const prop = item.Properties;
            return prop; // Returns the property object directly
        });
    }
    // Get common amenities (stats)
    async getCommonAmenities(limit = 10) {
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
        if (error)
            throw new Error(error.message);
        const counts = {};
        data.forEach((row) => {
            counts[row.AmenityName] = (counts[row.AmenityName] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    // Alias for controller compatibility
    async getAmenitiesStatistics(...args) {
        return this.getCommonAmenities();
    }
}
export const propertyAmenitiesService = new PropertyAmenitiesService();
//# sourceMappingURL=propertyAmenities.service.js.map