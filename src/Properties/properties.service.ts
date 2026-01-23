import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

// --- Interfaces ---
export interface PropertyCosts {
    monthly_rent: number;
    deposit_months?: number;
    deposit_amount: number;
    service_charge?: number;
    garbage_fee?: number;
    security_fee?: number;
    water_included?: boolean;
    electricity_included?: boolean;
    internet_included?: boolean;
    estimated_total_monthly?: number;
    agent_fee?: number;
    agent_fee_description?: string;
    total_move_in_cost?: number;
}

export interface SecurityFeatures {
    has_security_guard?: boolean;
    guard_hours?: string;
    has_cctv?: boolean;
    has_perimeter_wall?: boolean;
    has_gate?: boolean;
    has_electric_fence?: boolean;
    has_security_lights?: boolean;
    requires_visitor_registration?: boolean;
    has_intercom?: boolean;
    police_station_distance_km?: number;
}

export interface UtilityInfo {
    water_source?: 'NAIROBI_WATER' | 'BOREHOLE' | 'BOTH' | 'WATER_VENDOR';
    water_availability?: '24/7' | 'SCHEDULED' | 'IRREGULAR' | 'TANKER_ONLY';
    water_schedule?: string;
    has_water_tank?: boolean;
    tank_capacity_litres?: number;
    water_bill_included?: boolean;
    avg_monthly_water_bill?: number;
    electricity_provider?: string;
    has_prepaid_meter?: boolean;
    has_postpaid_meter?: boolean;
    frequent_power_outages?: boolean;
    outage_frequency?: string;
    has_generator?: boolean;
    has_solar_backup?: boolean;
    electricity_bill_included?: boolean;
    avg_monthly_electricity_bill?: number;
    fiber_available?: boolean;
    fiber_providers?: string;
    garbage_collection_available?: boolean;
    garbage_collection_schedule?: string;
}

export interface HouseRules {
    max_occupants?: number;
    children_allowed?: boolean;
    pets_allowed?: boolean;
    pet_deposit?: number;
    overnight_visitors_allowed?: boolean;
    visitor_curfew_time?: string;
    home_business_allowed?: boolean;
    airbnb_allowed?: boolean;
    smoking_allowed?: boolean;
    loud_music_allowed?: boolean;
    quiet_hours?: string;
    parking_available?: boolean;
    parking_spaces?: number;
    parking_fee?: number;
    visitor_parking?: boolean;
    notice_period_days?: number;
    other_rules?: string;
}

export interface PropertyCondition {
    overall_condition?: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
    year_built?: number;
    last_renovated?: number;
    has_kitchen?: boolean;
    kitchen_has_cabinets?: boolean;
    kitchen_has_sink?: boolean;
    kitchen_has_gas_connection?: boolean;
    number_of_bathrooms?: number;
    bathroom_has_shower?: boolean;
    bathroom_has_bathtub?: boolean;
    bathroom_has_hot_water?: boolean;
    hot_water_type?: string;
    floor_type?: string;
    wall_finish?: string;
    has_ceiling?: boolean;
    has_curtains_rails?: boolean;
    has_light_fixtures?: boolean;
    has_built_in_wardrobe?: boolean;
    has_balcony?: boolean;
    has_backyard?: boolean;
    has_compound?: boolean;
}

export interface TransportAccess {
    nearest_matatu_stage?: string;
    matatu_routes?: string;
    walking_minutes_to_stage?: number;
    nearest_main_road?: string;
    distance_to_main_road_meters?: number;
    road_access_quality?: 'TARMAC' | 'MURRAM' | 'POOR' | 'IMPASSABLE_RAINY';
    nearest_boda_stage?: string;
    boda_fare_to_main_road?: number;
    uber_accessible?: boolean;
}

export interface NearbyPlace {
    place_type: 'SUPERMARKET' | 'HOSPITAL' | 'SCHOOL' | 'CHURCH' | 'MOSQUE' | 'SHOPPING_MALL' | 'BANK' | 'ATM' | 'PETROL_STATION' | 'RESTAURANT' | 'GYM' | 'PHARMACY' | 'POLICE_STATION' | 'BUS_STATION' | 'CBD';
    place_name: string;
    distance_km: number;
    walking_minutes?: number;
    driving_minutes?: number;
}

export interface PropertyMedia {
    media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    media_url: string;
    thumbnail_url?: string;
    is_primary?: boolean;
}

export interface Property {
    property_id: string;
    owner_id: string;
    title: string;
    description: string;
    rent_amount: number;
    deposit_amount: number | null;
    county: string;
    constituency: string | null;
    area: string;
    street_address: string | null;
    latitude: number | null;
    longitude: number | null;
    property_type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
    bedrooms: number | null;
    bathrooms: number | null;
    rules: string | null;
    is_available: boolean;
    is_verified: boolean;
    is_boosted: boolean;
    boost_expiry: string | null;
    created_at: string;
    updated_at: string;
}

export interface PropertyWithRelations extends Property {
    owner?: {
        user_id: string;
        full_name: string;
        email?: string;
        phone_number?: string;
        trust_score?: number;
        agent_status?: string;
        avatar_url?: string;
    };
    costs?: PropertyCosts;
    security?: SecurityFeatures;
    utilities?: UtilityInfo;
    house_rules?: HouseRules;
    condition?: PropertyCondition;
    transport?: TransportAccess;
    nearby_places?: NearbyPlace[];
    media?: PropertyMedia[];
    amenities?: string[];
    primary_image?: string;
    display_rent?: number;
    display_deposit?: number;
    warnings?: string[];
}

export interface CreatePropertyInput {
    owner_id: string;
    title: string;
    description: string;
    rent_amount: number;
    deposit_amount?: number;
    county: string;
    constituency?: string;
    area: string;
    street_address?: string;
    latitude?: number;
    longitude?: number;
    property_type?: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
    bedrooms?: number;
    bathrooms?: number;
    rules?: string;

    // Related data
    costs?: PropertyCosts;
    security?: SecurityFeatures;
    utilities?: UtilityInfo;
    house_rules?: HouseRules;
    condition?: PropertyCondition;
    transport?: TransportAccess;
    nearby_places?: NearbyPlace[];
    media?: PropertyMedia[];
    amenities?: string[];
}

export interface UpdatePropertyInput {
    title?: string;
    description?: string;
    rent_amount?: number;
    deposit_amount?: number | null;
    county?: string;
    constituency?: string | null;
    area?: string;
    street_address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    property_type?: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
    bedrooms?: number | null;
    bathrooms?: number | null;
    rules?: string | null;
    is_available?: boolean;
    is_verified?: boolean;
    is_boosted?: boolean;
    boost_expiry?: string | null;
}

export interface PropertyFilter {
    county?: string;
    area?: string;
    min_rent?: number;
    max_rent?: number;
    property_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    is_available?: boolean;
    is_verified?: boolean;
    is_boosted?: boolean;
    search_term?: string;
}

export class PropertiesService {
    
    // ==================== DATABASE HEALTH CHECK ====================
    async checkDatabaseConnection(): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('properties')
                .select('property_id')
                .limit(1);
            
            if (error) {
                console.error('Database connection test failed:', error);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Database connection error:', error);
            return false;
        }
    }
    
    private mapDBToProperty(data: any): Property {
        if (!data) return data;

        return {
            property_id: data.property_id,
            owner_id: data.owner_id,
            title: data.title,
            description: data.description,
            rent_amount: data.rent_amount,
            deposit_amount: data.deposit_amount,
            county: data.county,
            constituency: data.constituency,
            area: data.area,
            street_address: data.street_address,
            latitude: data.latitude,
            longitude: data.longitude,
            property_type: data.property_type,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            rules: data.rules,
            is_available: data.is_available,
            is_verified: data.is_verified,
            is_boosted: data.is_boosted,
            boost_expiry: data.boost_expiry,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
    }

    private mapDBToPropertyWithRelations(data: any): PropertyWithRelations {
        const property = this.mapDBToProperty(data) as PropertyWithRelations;

        // Add owner info - FIXED: Use correct column names from your schema
        if (data.Users) {
            property.owner = {
                user_id: data.Users.UserId,
                full_name: data.Users.FullName,
                email: data.Users.Email,
                phone_number: data.Users.PhoneNumber,
                trust_score: data.Users.TrustScore,
                agent_status: data.Users.AgentStatus,
                avatar_url: data.Users.AvatarUrl
            };
        }

        // Add related data if tables exist
        if (data.property_costs && data.property_costs.length > 0) {
            property.costs = {
                monthly_rent: data.property_costs[0].monthly_rent,
                deposit_months: data.property_costs[0].deposit_months,
                deposit_amount: data.property_costs[0].deposit_amount,
                service_charge: data.property_costs[0].service_charge,
                garbage_fee: data.property_costs[0].garbage_fee,
                security_fee: data.property_costs[0].security_fee,
                water_included: data.property_costs[0].water_included,
                electricity_included: data.property_costs[0].electricity_included,
                internet_included: data.property_costs[0].internet_included,
                estimated_total_monthly: data.property_costs[0].estimated_total_monthly,
                agent_fee: data.property_costs[0].agent_fee,
                agent_fee_description: data.property_costs[0].agent_fee_description,
                total_move_in_cost: data.property_costs[0].total_move_in_cost
            };
        }

        if (data.security_features && data.security_features.length > 0) {
            property.security = {
                has_security_guard: data.security_features[0].has_security_guard,
                guard_hours: data.security_features[0].guard_hours,
                has_cctv: data.security_features[0].has_cctv,
                has_perimeter_wall: data.security_features[0].has_perimeter_wall,
                has_gate: data.security_features[0].has_gate,
                has_electric_fence: data.security_features[0].has_electric_fence,
                has_security_lights: data.security_features[0].has_security_lights,
                requires_visitor_registration: data.security_features[0].requires_visitor_registration,
                has_intercom: data.security_features[0].has_intercom,
                police_station_distance_km: data.security_features[0].police_station_distance_km
            };
        }

        if (data.utility_info && data.utility_info.length > 0) {
            property.utilities = {
                water_source: data.utility_info[0].water_source,
                water_availability: data.utility_info[0].water_availability,
                water_schedule: data.utility_info[0].water_schedule,
                has_water_tank: data.utility_info[0].has_water_tank,
                tank_capacity_litres: data.utility_info[0].tank_capacity_litres,
                water_bill_included: data.utility_info[0].water_bill_included,
                avg_monthly_water_bill: data.utility_info[0].avg_monthly_water_bill,
                electricity_provider: data.utility_info[0].electricity_provider,
                has_prepaid_meter: data.utility_info[0].has_prepaid_meter,
                has_postpaid_meter: data.utility_info[0].has_postpaid_meter,
                frequent_power_outages: data.utility_info[0].frequent_power_outages,
                outage_frequency: data.utility_info[0].outage_frequency,
                has_generator: data.utility_info[0].has_generator,
                has_solar_backup: data.utility_info[0].has_solar_backup,
                electricity_bill_included: data.utility_info[0].electricity_bill_included,
                avg_monthly_electricity_bill: data.utility_info[0].avg_monthly_electricity_bill,
                fiber_available: data.utility_info[0].fiber_available,
                fiber_providers: data.utility_info[0].fiber_providers,
                garbage_collection_available: data.utility_info[0].garbage_collection_available,
                garbage_collection_schedule: data.utility_info[0].garbage_collection_schedule
            };
        }

        if (data.house_rules && data.house_rules.length > 0) {
            property.house_rules = {
                max_occupants: data.house_rules[0].max_occupants,
                children_allowed: data.house_rules[0].children_allowed,
                pets_allowed: data.house_rules[0].pets_allowed,
                pet_deposit: data.house_rules[0].pet_deposit,
                overnight_visitors_allowed: data.house_rules[0].overnight_visitors_allowed,
                visitor_curfew_time: data.house_rules[0].visitor_curfew_time,
                home_business_allowed: data.house_rules[0].home_business_allowed,
                airbnb_allowed: data.house_rules[0].airbnb_allowed,
                smoking_allowed: data.house_rules[0].smoking_allowed,
                loud_music_allowed: data.house_rules[0].loud_music_allowed,
                quiet_hours: data.house_rules[0].quiet_hours,
                parking_available: data.house_rules[0].parking_available,
                parking_spaces: data.house_rules[0].parking_spaces,
                parking_fee: data.house_rules[0].parking_fee,
                visitor_parking: data.house_rules[0].visitor_parking,
                notice_period_days: data.house_rules[0].notice_period_days,
                other_rules: data.house_rules[0].other_rules
            };
        }

        if (data.property_condition && data.property_condition.length > 0) {
            property.condition = {
                overall_condition: data.property_condition[0].overall_condition,
                year_built: data.property_condition[0].year_built,
                last_renovated: data.property_condition[0].last_renovated,
                has_kitchen: data.property_condition[0].has_kitchen,
                kitchen_has_cabinets: data.property_condition[0].kitchen_has_cabinets,
                kitchen_has_sink: data.property_condition[0].kitchen_has_sink,
                kitchen_has_gas_connection: data.property_condition[0].kitchen_has_gas_connection,
                number_of_bathrooms: data.property_condition[0].number_of_bathrooms,
                bathroom_has_shower: data.property_condition[0].bathroom_has_shower,
                bathroom_has_bathtub: data.property_condition[0].bathroom_has_bathtub,
                bathroom_has_hot_water: data.property_condition[0].bathroom_has_hot_water,
                hot_water_type: data.property_condition[0].hot_water_type,
                floor_type: data.property_condition[0].floor_type,
                wall_finish: data.property_condition[0].wall_finish,
                has_ceiling: data.property_condition[0].has_ceiling,
                has_curtains_rails: data.property_condition[0].has_curtains_rails,
                has_light_fixtures: data.property_condition[0].has_light_fixtures,
                has_built_in_wardrobe: data.property_condition[0].has_built_in_wardrobe,
                has_balcony: data.property_condition[0].has_balcony,
                has_backyard: data.property_condition[0].has_backyard,
                has_compound: data.property_condition[0].has_compound
            };
        }

        if (data.transport_access && data.transport_access.length > 0) {
            property.transport = {
                nearest_matatu_stage: data.transport_access[0].nearest_matatu_stage,
                matatu_routes: data.transport_access[0].matatu_routes,
                walking_minutes_to_stage: data.transport_access[0].walking_minutes_to_stage,
                nearest_main_road: data.transport_access[0].nearest_main_road,
                distance_to_main_road_meters: data.transport_access[0].distance_to_main_road_meters,
                road_access_quality: data.transport_access[0].road_access_quality,
                nearest_boda_stage: data.transport_access[0].nearest_boda_stage,
                boda_fare_to_main_road: data.transport_access[0].boda_fare_to_main_road,
                uber_accessible: data.transport_access[0].uber_accessible
            };
        }

        if (data.property_media && Array.isArray(data.property_media)) {
            property.media = data.property_media.map((m: any) => ({
                media_type: m.media_type,
                media_url: m.media_url,
                thumbnail_url: m.thumbnail_url,
                is_primary: m.is_primary,
                created_at: m.created_at
            }));
        }

        if (data.nearby_places && Array.isArray(data.nearby_places)) {
            property.nearby_places = data.nearby_places.map((p: any) => ({
                place_type: p.place_type,
                place_name: p.place_name,
                distance_km: p.distance_km,
                walking_minutes: p.walking_minutes,
                driving_minutes: p.driving_minutes
            }));
        }

        if (data.property_amenities && Array.isArray(data.property_amenities)) {
            property.amenities = data.property_amenities.map((a: any) => a.amenity_name);
        }

        return property;
    }

    async createProperty(data: CreatePropertyInput): Promise<PropertyWithRelations> {
        try {
            // 1. Check database connection
            const isConnected = await this.checkDatabaseConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }

            // 2. Validate owner exists - FIXED: Use correct table and column names
            const { data: owner, error: ownerError } = await supabase
                .from('"Users"')
                .select('"UserId"')
                .eq('"UserId"', data.owner_id)
                .single();

            if (ownerError || !owner) {
                throw new Error('Owner not found or invalid owner ID');
            }

            // 3. Insert main property
            const propertyId = crypto.randomUUID();
            const now = new Date().toISOString();

            const { error: propertyError } = await supabase
                .from('properties')
                .insert({
                    property_id: propertyId,
                    owner_id: data.owner_id,
                    title: data.title,
                    description: data.description,
                    rent_amount: data.rent_amount,
                    deposit_amount: data.deposit_amount || null,
                    county: data.county,
                    constituency: data.constituency || null,
                    area: data.area,
                    street_address: data.street_address || null,
                    latitude: data.latitude || null,
                    longitude: data.longitude || null,
                    property_type: data.property_type || 'APARTMENT',
                    bedrooms: data.bedrooms || null,
                    bathrooms: data.bathrooms || null,
                    rules: data.rules || null,
                    is_available: true,
                    is_verified: false,
                    is_boosted: false,
                    boost_expiry: null,
                    created_at: now,
                    updated_at: now
                })
                .select()
                .single();

            if (propertyError) {
                console.error('Property creation error:', propertyError);
                throw new Error(`Failed to create property: ${propertyError.message}`);
            }

            // 4. Insert related data if provided
            const relatedDataErrors: string[] = [];

            // Insert costs (if table exists)
            if (data.costs) {
                try {
                    const { error: costError } = await supabase
                        .from('property_costs')
                        .insert({
                            property_id: propertyId,
                            monthly_rent: data.costs.monthly_rent,
                            deposit_months: data.costs.deposit_months || 1,
                            deposit_amount: data.costs.deposit_amount,
                            service_charge: data.costs.service_charge || 0,
                            garbage_fee: data.costs.garbage_fee || 0,
                            security_fee: data.costs.security_fee || 0,
                            water_included: data.costs.water_included || false,
                            electricity_included: data.costs.electricity_included || false,
                            internet_included: data.costs.internet_included || false,
                            estimated_total_monthly: data.costs.estimated_total_monthly,
                            agent_fee: data.costs.agent_fee,
                            agent_fee_description: data.costs.agent_fee_description,
                            total_move_in_cost: data.costs.total_move_in_cost
                        });

                    if (costError) {
                        relatedDataErrors.push(`Costs: ${costError.message}`);
                        console.warn('Cost creation warning:', costError);
                    }
                } catch (error: any) {
                    relatedDataErrors.push(`Costs: ${error.message}`);
                    console.warn('Cost table might not exist:', error.message);
                }
            }

            // Similar try-catch blocks for other related tables...
            // [You should add try-catch for each related table insertion]

            // 5. Return the complete property with relations
            const completeProperty = await this.getPropertyById(propertyId);

            if (!completeProperty) {
                throw new Error('Failed to retrieve created property');
            }

            // Add warnings if there were related data errors
            if (relatedDataErrors.length > 0) {
                completeProperty.warnings = relatedDataErrors;
            }

            return completeProperty;

        } catch (error: any) {
            console.error('Overall property creation error:', error);
            throw new Error(`Failed to create property: ${error.message}`);
        }
    }

    async getPropertyById(propertyId: string): Promise<PropertyWithRelations | null> {
        try {
            if (!ValidationUtils.isValidUUID(propertyId)) {
                throw new Error('Invalid property ID format');
            }

            // Check database connection first
            const isConnected = await this.checkDatabaseConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }

            // FIXED: Use correct column names with quotes
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    "Users":owner_id (
                        "UserId",
                        "FullName",
                        "Email",
                        "PhoneNumber",
                        "TrustScore",
                        "AgentStatus",
                        "AvatarUrl"
                    ),
                    property_media (*),
                    property_amenities (*)
                `)
                .eq('property_id', propertyId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                console.error('Error fetching property:', error);
                throw new Error(`Failed to fetch property: ${error.message}`);
            }

            return this.mapDBToPropertyWithRelations(data);

        } catch (error: any) {
            console.error('Error in getPropertyById:', error);
            throw error;
        }
    }

    async getAllProperties(
        page: number = 1,
        limit: number = 20,
        filters: PropertyFilter = {}
    ): Promise<{
        properties: PropertyWithRelations[];
        total: number;
        page: number;
        total_pages: number;
    }> {
        try {
            console.log('Service: Getting properties with filters:', filters);
            
            // Check database connection first
            const isConnected = await this.checkDatabaseConnection();
            if (!isConnected) {
                throw new Error('Database connection failed');
            }
    
            const offset = (page - 1) * limit;
    
            // SIMPLIFIED QUERY WITHOUT JOINS FIRST
            let query = supabase
                .from('properties')
                .select('*', { count: 'exact' });
    
            // Apply filters
            query = query.eq('is_available', true);
    
            if (filters.county) {
                query = query.ilike('county', `%${filters.county}%`);
            }
    
            if (filters.area) {
                query = query.ilike('area', `%${filters.area}%`);
            }
    
            if (filters.property_type) {
                query = query.eq('property_type', filters.property_type.toUpperCase());
            }
    
            if (filters.min_rent !== undefined) {
                query = query.gte('rent_amount', filters.min_rent);
            }
    
            if (filters.max_rent !== undefined) {
                query = query.lte('rent_amount', filters.max_rent);
            }
    
            if (filters.bedrooms !== undefined) {
                query = query.eq('bedrooms', filters.bedrooms);
            }
    
            if (filters.bathrooms !== undefined) {
                query = query.eq('bathrooms', filters.bathrooms);
            }
    
            if (filters.is_verified !== undefined) {
                query = query.eq('is_verified', filters.is_verified);
            }
    
            if (filters.is_boosted !== undefined) {
                query = query.eq('is_boosted', filters.is_boosted);
            }
    
            if (filters.search_term) {
                const searchTerm = `%${filters.search_term}%`;
                query = query.or(
                    `title.ilike.${searchTerm},` +
                    `description.ilike.${searchTerm},` +
                    `area.ilike.${searchTerm},` +
                    `county.ilike.${searchTerm}`
                );
            }
    
            const { data, count, error } = await query
                .order('is_boosted', { ascending: false })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
    
            if (error) {
                console.error('Error fetching properties:', error);
                throw new Error(`Failed to fetch properties: ${error.message}`);
            }
    
            console.log(`Service: Found ${count || 0} properties`);
    
            // Get owner details separately for each property
            const properties: PropertyWithRelations[] = [];
            
            for (const item of data || []) {
                const property = this.mapDBToProperty(item) as PropertyWithRelations;
                
                // Get owner information
                try {
                    const { data: ownerData, error: ownerError } = await supabase
                        .from('"Users"')
                        .select('"UserId", "FullName", "TrustScore", "AgentStatus", "AvatarUrl"')
                        .eq('"UserId"', item.owner_id)
                        .single();
                    
                    if (!ownerError && ownerData) {
                        property.owner = {
                            user_id: ownerData.UserId,
                            full_name: ownerData.FullName,
                            trust_score: ownerData.TrustScore,
                            agent_status: ownerData.AgentStatus,
                            avatar_url: ownerData.AvatarUrl
                        };
                    }
                } catch (ownerErr) {
                    console.warn(`Could not fetch owner for property ${item.property_id}:`, ownerErr);
                }
                
                // Get primary image
                try {
                    const { data: mediaData } = await supabase
                        .from('property_media')
                        .select('media_url')
                        .eq('property_id', item.property_id)
                        .eq('is_primary', true)
                        .limit(1);
                    
                    if (mediaData && mediaData.length > 0) {
                        property.primary_image = mediaData[0].media_url;
                    }
                } catch (mediaErr) {
                    console.warn(`Could not fetch media for property ${item.property_id}:`, mediaErr);
                }
                
                property.display_rent = item.rent_amount;
                property.display_deposit = item.deposit_amount;
                
                properties.push(property);
            }
    
            return {
                properties,
                total: count || 0,
                page,
                total_pages: Math.ceil((count || 0) / limit)
            };
    
        } catch (error: any) {
            console.error('Error in getAllProperties:', error);
            throw error;
        }
    }

    async getPropertiesByOwner(ownerId: string, page: number = 1, limit: number = 20): Promise<{
        properties: PropertyWithRelations[];
        total: number;
        page: number;
        total_pages: number;
    }> {
        try {
            if (!ValidationUtils.isValidUUID(ownerId)) {
                throw new Error('Invalid owner ID format');
            }

            const offset = (page - 1) * limit;

            const { data, count, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    property_media (media_url, is_primary)
                `, { count: 'exact' })
                .eq('owner_id', ownerId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Error fetching owner properties:', error);
                throw new Error(`Failed to fetch properties: ${error.message}`);
            }

            const properties = (data || []).map(item => {
                const property = this.mapDBToProperty(item) as PropertyWithRelations;

                // Add primary image
                if (item.property_media && item.property_media.length > 0) {
                    const primaryMedia = item.property_media.find((m: any) => m.is_primary) || item.property_media[0];
                    property.primary_image = primaryMedia.media_url;
                }

                property.display_rent = item.rent_amount;
                property.display_deposit = item.deposit_amount;

                return property;
            });

            return {
                properties,
                total: count || 0,
                page,
                total_pages: Math.ceil((count || 0) / limit)
            };

        } catch (error: any) {
            console.error('Error in getPropertiesByOwner:', error);
            throw error;
        }
    }

    async updateProperty(propertyId: string, data: UpdatePropertyInput): Promise<Property | null> {
        try {
            if (!ValidationUtils.isValidUUID(propertyId)) {
                throw new Error('Invalid property ID format');
            }

            // Check if property exists
            const { data: existing, error: checkError } = await supabase
                .from('properties')
                .select('property_id')
                .eq('property_id', propertyId)
                .single();

            if (checkError || !existing) {
                throw new Error('Property not found');
            }

            // Prepare update data
            const updateData: any = {};

            // Map incoming data to database columns
            if (data.title !== undefined) updateData.title = data.title;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.rent_amount !== undefined) updateData.rent_amount = data.rent_amount;
            if (data.deposit_amount !== undefined) updateData.deposit_amount = data.deposit_amount;
            if (data.county !== undefined) updateData.county = data.county;
            if (data.constituency !== undefined) updateData.constituency = data.constituency;
            if (data.area !== undefined) updateData.area = data.area;
            if (data.street_address !== undefined) updateData.street_address = data.street_address;
            if (data.latitude !== undefined) updateData.latitude = data.latitude;
            if (data.longitude !== undefined) updateData.longitude = data.longitude;
            if (data.property_type !== undefined) updateData.property_type = data.property_type;
            if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
            if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
            if (data.rules !== undefined) updateData.rules = data.rules;
            if (data.is_available !== undefined) updateData.is_available = data.is_available;
            if (data.is_verified !== undefined) updateData.is_verified = data.is_verified;
            if (data.is_boosted !== undefined) updateData.is_boosted = data.is_boosted;
            if (data.boost_expiry !== undefined) updateData.boost_expiry = data.boost_expiry;

            updateData.updated_at = new Date().toISOString();

            // Perform update
            const { data: updated, error } = await supabase
                .from('properties')
                .update(updateData)
                .eq('property_id', propertyId)
                .select()
                .single();

            if (error) {
                console.error('Error updating property:', error);
                throw new Error(`Failed to update property: ${error.message}`);
            }

            return this.mapDBToProperty(updated);

        } catch (error: any) {
            console.error('Error in updateProperty:', error);
            throw error;
        }
    }

    async deleteProperty(propertyId: string): Promise<boolean> {
        try {
            if (!ValidationUtils.isValidUUID(propertyId)) {
                throw new Error('Invalid property ID format');
            }

            // Check if property exists
            const { data: existing, error: checkError } = await supabase
                .from('properties')
                .select('property_id')
                .eq('property_id', propertyId)
                .single();

            if (checkError || !existing) {
                throw new Error('Property not found');
            }

            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('property_id', propertyId);

            if (error) {
                console.error('Error deleting property:', error);
                throw new Error(`Failed to delete property: ${error.message}`);
            }

            return true;

        } catch (error: any) {
            console.error('Error in deleteProperty:', error);
            throw error;
        }
    }

    async getPropertyStatistics(ownerId?: string): Promise<any> {
        try {
            let query = supabase
                .from('properties')
                .select('property_type, county, is_available, is_verified, is_boosted', { count: 'exact' });

            if (ownerId) {
                if (!ValidationUtils.isValidUUID(ownerId)) {
                    throw new Error('Invalid owner ID format');
                }
                query = query.eq('owner_id', ownerId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching property statistics:', error);
                throw new Error(`Failed to fetch statistics: ${error.message}`);
            }

            const stats = {
                total: data?.length || 0,
                available: 0,
                rented: 0,
                verified: 0,
                boosted: 0,
                by_type: {} as Record<string, number>,
                by_county: {} as Record<string, number>
            };

            data?.forEach((property: any) => {
                if (property.is_available) stats.available++;
                else stats.rented++;

                if (property.is_verified) stats.verified++;
                if (property.is_boosted) stats.boosted++;

                const type = property.property_type || 'Unknown';
                stats.by_type[type] = (stats.by_type[type] || 0) + 1;

                const county = property.county || 'Unknown';
                stats.by_county[county] = (stats.by_county[county] || 0) + 1;
            });

            return stats;

        } catch (error: any) {
            console.error('Error in getPropertyStatistics:', error);
            throw error;
        }
    }

    async searchProperties(searchTerm: string, page: number = 1, limit: number = 20): Promise<{
        properties: PropertyWithRelations[];
        total: number;
        page: number;
        total_pages: number;
    }> {
        return this.getAllProperties(page, limit, { search_term: searchTerm });
    }

    async verifyProperty(propertyId: string): Promise<Property | null> {
        return this.updateProperty(propertyId, { is_verified: true });
    }

    async boostProperty(propertyId: string, days: number = 7): Promise<Property | null> {
        const boostExpiry = new Date();
        boostExpiry.setDate(boostExpiry.getDate() + days);

        return this.updateProperty(propertyId, {
            is_boosted: true,
            boost_expiry: boostExpiry.toISOString()
        });
    }
}

export const propertiesService = new PropertiesService();
// import { supabase } from '../Database/config.js';
// import { ValidationUtils } from '../utils/validators.js';

// // --- Interfaces ---
// export interface PropertyCosts {
//     monthly_rent: number;
//     deposit_months?: number;
//     deposit_amount: number;
//     service_charge?: number;
//     garbage_fee?: number;
//     security_fee?: number;
//     water_included?: boolean;
//     electricity_included?: boolean;
//     internet_included?: boolean;
//     estimated_total_monthly?: number;
//     agent_fee?: number;
//     agent_fee_description?: string;
//     total_move_in_cost?: number;
// }

// export interface SecurityFeatures {
//     has_security_guard?: boolean;
//     guard_hours?: string;
//     has_cctv?: boolean;
//     has_perimeter_wall?: boolean;
//     has_gate?: boolean;
//     has_electric_fence?: boolean;
//     has_security_lights?: boolean;
//     requires_visitor_registration?: boolean;
//     has_intercom?: boolean;
//     police_station_distance_km?: number;
// }

// export interface UtilityInfo {
//     water_source?: 'NAIROBI_WATER' | 'BOREHOLE' | 'BOTH' | 'WATER_VENDOR';
//     water_availability?: '24/7' | 'SCHEDULED' | 'IRREGULAR' | 'TANKER_ONLY';
//     water_schedule?: string;
//     has_water_tank?: boolean;
//     tank_capacity_litres?: number;
//     water_bill_included?: boolean;
//     avg_monthly_water_bill?: number;
//     electricity_provider?: string;
//     has_prepaid_meter?: boolean;
//     has_postpaid_meter?: boolean;
//     frequent_power_outages?: boolean;
//     outage_frequency?: string;
//     has_generator?: boolean;
//     has_solar_backup?: boolean;
//     electricity_bill_included?: boolean;
//     avg_monthly_electricity_bill?: number;
//     fiber_available?: boolean;
//     fiber_providers?: string;
//     garbage_collection_available?: boolean;
//     garbage_collection_schedule?: string;
// }

// export interface HouseRules {
//     max_occupants?: number;
//     children_allowed?: boolean;
//     pets_allowed?: boolean;
//     pet_deposit?: number;
//     overnight_visitors_allowed?: boolean;
//     visitor_curfew_time?: string;
//     home_business_allowed?: boolean;
//     airbnb_allowed?: boolean;
//     smoking_allowed?: boolean;
//     loud_music_allowed?: boolean;
//     quiet_hours?: string;
//     parking_available?: boolean;
//     parking_spaces?: number;
//     parking_fee?: number;
//     visitor_parking?: boolean;
//     notice_period_days?: number;
//     other_rules?: string;
// }

// export interface PropertyCondition {
//     overall_condition?: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
//     year_built?: number;
//     last_renovated?: number;
//     has_kitchen?: boolean;
//     kitchen_has_cabinets?: boolean;
//     kitchen_has_sink?: boolean;
//     kitchen_has_gas_connection?: boolean;
//     number_of_bathrooms?: number;
//     bathroom_has_shower?: boolean;
//     bathroom_has_bathtub?: boolean;
//     bathroom_has_hot_water?: boolean;
//     hot_water_type?: string;
//     floor_type?: string;
//     wall_finish?: string;
//     has_ceiling?: boolean;
//     has_curtains_rails?: boolean;
//     has_light_fixtures?: boolean;
//     has_built_in_wardrobe?: boolean;
//     has_balcony?: boolean;
//     has_backyard?: boolean;
//     has_compound?: boolean;
// }

// export interface TransportAccess {
//     nearest_matatu_stage?: string;
//     matatu_routes?: string;
//     walking_minutes_to_stage?: number;
//     nearest_main_road?: string;
//     distance_to_main_road_meters?: number;
//     road_access_quality?: 'TARMAC' | 'MURRAM' | 'POOR' | 'IMPASSABLE_RAINY';
//     nearest_boda_stage?: string;
//     boda_fare_to_main_road?: number;
//     uber_accessible?: boolean;
// }

// export interface NearbyPlace {
//     place_type: 'SUPERMARKET' | 'HOSPITAL' | 'SCHOOL' | 'CHURCH' | 'MOSQUE' | 'SHOPPING_MALL' | 'BANK' | 'ATM' | 'PETROL_STATION' | 'RESTAURANT' | 'GYM' | 'PHARMACY' | 'POLICE_STATION' | 'BUS_STATION' | 'CBD';
//     place_name: string;
//     distance_km: number;
//     walking_minutes?: number;
//     driving_minutes?: number;
// }

// export interface PropertyMedia {
//     media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
//     media_url: string;
//     thumbnail_url?: string;
//     is_primary?: boolean;
// }

// export interface Property {
//     property_id: string;
//     owner_id: string;
//     title: string;
//     description: string;
//     rent_amount: number;
//     deposit_amount: number | null;
//     county: string;
//     constituency: string | null;
//     area: string;
//     street_address: string | null;
//     latitude: number | null;
//     longitude: number | null;
//     property_type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
//     bedrooms: number | null;
//     bathrooms: number | null;
//     rules: string | null;
//     is_available: boolean;
//     is_verified: boolean;
//     is_boosted: boolean;
//     boost_expiry: string | null;
//     created_at: string;
//     updated_at: string;
// }

// export interface PropertyWithRelations extends Property {
//     owner?: {
//         user_id: string;
//         full_name: string;
//         email?: string;
//         phone_number?: string;
//         trust_score?: number;
//         agent_status?: string;
//         avatar_url?: string;
//     };
//     costs?: PropertyCosts;
//     security?: SecurityFeatures;
//     utilities?: UtilityInfo;
//     house_rules?: HouseRules;
//     condition?: PropertyCondition;
//     transport?: TransportAccess;
//     nearby_places?: NearbyPlace[];
//     media?: PropertyMedia[];
//     amenities?: string[];
//     primary_image?: string;
//     display_rent?: number;
//     display_deposit?: number;
//     warnings?: string[];
// }

// export interface CreatePropertyInput {
//     owner_id: string;
//     title: string;
//     description: string;
//     rent_amount: number;
//     deposit_amount?: number;
//     county: string;
//     constituency?: string;
//     area: string;
//     street_address?: string;
//     latitude?: number;
//     longitude?: number;
//     property_type?: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
//     bedrooms?: number;
//     bathrooms?: number;
//     rules?: string;

//     // Related data
//     costs?: PropertyCosts;
//     security?: SecurityFeatures;
//     utilities?: UtilityInfo;
//     house_rules?: HouseRules;
//     condition?: PropertyCondition;
//     transport?: TransportAccess;
//     nearby_places?: NearbyPlace[];
//     media?: PropertyMedia[];
//     amenities?: string[];
// }

// export interface UpdatePropertyInput {
//     title?: string;
//     description?: string;
//     rent_amount?: number;
//     deposit_amount?: number | null;
//     county?: string;
//     constituency?: string | null;
//     area?: string;
//     street_address?: string | null;
//     latitude?: number | null;
//     longitude?: number | null;
//     property_type?: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'LAND' | 'OTHER';
//     bedrooms?: number | null;
//     bathrooms?: number | null;
//     rules?: string | null;
//     is_available?: boolean;
//     is_verified?: boolean;
//     is_boosted?: boolean;
//     boost_expiry?: string | null;
// }

// export interface PropertyFilter {
//     county?: string;
//     area?: string;
//     min_rent?: number;
//     max_rent?: number;
//     property_type?: string;
//     bedrooms?: number;
//     bathrooms?: number;
//     is_available?: boolean;
//     is_verified?: boolean;
//     is_boosted?: boolean;
//     search_term?: string;
// }

// export class PropertiesService {
//     private mapDBToProperty(data: any): Property {
//         if (!data) return data;

//         return {
//             property_id: data.property_id,
//             owner_id: data.owner_id,
//             title: data.title,
//             description: data.description,
//             rent_amount: data.rent_amount,
//             deposit_amount: data.deposit_amount,
//             county: data.county,
//             constituency: data.constituency,
//             area: data.area,
//             street_address: data.street_address,
//             latitude: data.latitude,
//             longitude: data.longitude,
//             property_type: data.property_type,
//             bedrooms: data.bedrooms,
//             bathrooms: data.bathrooms,
//             rules: data.rules,
//             is_available: data.is_available,
//             is_verified: data.is_verified,
//             is_boosted: data.is_boosted,
//             boost_expiry: data.boost_expiry,
//             created_at: data.created_at,
//             updated_at: data.updated_at
//         };
//     }

//     private mapDBToPropertyWithRelations(data: any): PropertyWithRelations {
//         const property = this.mapDBToProperty(data) as PropertyWithRelations;

//         // Add owner info
//         if (data.Users) {
//             property.owner = {
//                 user_id: data.Users.user_id,
//                 full_name: data.Users.full_name,
//                 email: data.Users.email,
//                 phone_number: data.Users.phone_number,
//                 trust_score: data.Users.trust_score,
//                 agent_status: data.Users.agent_status
//             };
//         }

//         // Add related data
//         if (data.property_costs && data.property_costs.length > 0) {
//             property.costs = {
//                 monthly_rent: data.property_costs[0].monthly_rent,
//                 deposit_months: data.property_costs[0].deposit_months,
//                 deposit_amount: data.property_costs[0].deposit_amount,
//                 service_charge: data.property_costs[0].service_charge,
//                 garbage_fee: data.property_costs[0].garbage_fee,
//                 security_fee: data.property_costs[0].security_fee,
//                 water_included: data.property_costs[0].water_included,
//                 electricity_included: data.property_costs[0].electricity_included,
//                 internet_included: data.property_costs[0].internet_included,
//                 estimated_total_monthly: data.property_costs[0].estimated_total_monthly,
//                 agent_fee: data.property_costs[0].agent_fee,
//                 agent_fee_description: data.property_costs[0].agent_fee_description,
//                 total_move_in_cost: data.property_costs[0].total_move_in_cost
//             };
//         }

//         if (data.security_features && data.security_features.length > 0) {
//             property.security = {
//                 has_security_guard: data.security_features[0].has_security_guard,
//                 guard_hours: data.security_features[0].guard_hours,
//                 has_cctv: data.security_features[0].has_cctv,
//                 has_perimeter_wall: data.security_features[0].has_perimeter_wall,
//                 has_gate: data.security_features[0].has_gate,
//                 has_electric_fence: data.security_features[0].has_electric_fence,
//                 has_security_lights: data.security_features[0].has_security_lights,
//                 requires_visitor_registration: data.security_features[0].requires_visitor_registration,
//                 has_intercom: data.security_features[0].has_intercom,
//                 police_station_distance_km: data.security_features[0].police_station_distance_km
//             };
//         }

//         if (data.utility_info && data.utility_info.length > 0) {
//             property.utilities = {
//                 water_source: data.utility_info[0].water_source,
//                 water_availability: data.utility_info[0].water_availability,
//                 water_schedule: data.utility_info[0].water_schedule,
//                 has_water_tank: data.utility_info[0].has_water_tank,
//                 tank_capacity_litres: data.utility_info[0].tank_capacity_litres,
//                 water_bill_included: data.utility_info[0].water_bill_included,
//                 avg_monthly_water_bill: data.utility_info[0].avg_monthly_water_bill,
//                 electricity_provider: data.utility_info[0].electricity_provider,
//                 has_prepaid_meter: data.utility_info[0].has_prepaid_meter,
//                 has_postpaid_meter: data.utility_info[0].has_postpaid_meter,
//                 frequent_power_outages: data.utility_info[0].frequent_power_outages,
//                 outage_frequency: data.utility_info[0].outage_frequency,
//                 has_generator: data.utility_info[0].has_generator,
//                 has_solar_backup: data.utility_info[0].has_solar_backup,
//                 electricity_bill_included: data.utility_info[0].electricity_bill_included,
//                 avg_monthly_electricity_bill: data.utility_info[0].avg_monthly_electricity_bill,
//                 fiber_available: data.utility_info[0].fiber_available,
//                 fiber_providers: data.utility_info[0].fiber_providers,
//                 garbage_collection_available: data.utility_info[0].garbage_collection_available,
//                 garbage_collection_schedule: data.utility_info[0].garbage_collection_schedule
//             };
//         }

//         if (data.house_rules && data.house_rules.length > 0) {
//             property.house_rules = {
//                 max_occupants: data.house_rules[0].max_occupants,
//                 children_allowed: data.house_rules[0].children_allowed,
//                 pets_allowed: data.house_rules[0].pets_allowed,
//                 pet_deposit: data.house_rules[0].pet_deposit,
//                 overnight_visitors_allowed: data.house_rules[0].overnight_visitors_allowed,
//                 visitor_curfew_time: data.house_rules[0].visitor_curfew_time,
//                 home_business_allowed: data.house_rules[0].home_business_allowed,
//                 airbnb_allowed: data.house_rules[0].airbnb_allowed,
//                 smoking_allowed: data.house_rules[0].smoking_allowed,
//                 loud_music_allowed: data.house_rules[0].loud_music_allowed,
//                 quiet_hours: data.house_rules[0].quiet_hours,
//                 parking_available: data.house_rules[0].parking_available,
//                 parking_spaces: data.house_rules[0].parking_spaces,
//                 parking_fee: data.house_rules[0].parking_fee,
//                 visitor_parking: data.house_rules[0].visitor_parking,
//                 notice_period_days: data.house_rules[0].notice_period_days,
//                 other_rules: data.house_rules[0].other_rules
//             };
//         }

//         if (data.property_condition && data.property_condition.length > 0) {
//             property.condition = {
//                 overall_condition: data.property_condition[0].overall_condition,
//                 year_built: data.property_condition[0].year_built,
//                 last_renovated: data.property_condition[0].last_renovated,
//                 has_kitchen: data.property_condition[0].has_kitchen,
//                 kitchen_has_cabinets: data.property_condition[0].kitchen_has_cabinets,
//                 kitchen_has_sink: data.property_condition[0].kitchen_has_sink,
//                 kitchen_has_gas_connection: data.property_condition[0].kitchen_has_gas_connection,
//                 number_of_bathrooms: data.property_condition[0].number_of_bathrooms,
//                 bathroom_has_shower: data.property_condition[0].bathroom_has_shower,
//                 bathroom_has_bathtub: data.property_condition[0].bathroom_has_bathtub,
//                 bathroom_has_hot_water: data.property_condition[0].bathroom_has_hot_water,
//                 hot_water_type: data.property_condition[0].hot_water_type,
//                 floor_type: data.property_condition[0].floor_type,
//                 wall_finish: data.property_condition[0].wall_finish,
//                 has_ceiling: data.property_condition[0].has_ceiling,
//                 has_curtains_rails: data.property_condition[0].has_curtains_rails,
//                 has_light_fixtures: data.property_condition[0].has_light_fixtures,
//                 has_built_in_wardrobe: data.property_condition[0].has_built_in_wardrobe,
//                 has_balcony: data.property_condition[0].has_balcony,
//                 has_backyard: data.property_condition[0].has_backyard,
//                 has_compound: data.property_condition[0].has_compound
//             };
//         }

//         if (data.transport_access && data.transport_access.length > 0) {
//             property.transport = {
//                 nearest_matatu_stage: data.transport_access[0].nearest_matatu_stage,
//                 matatu_routes: data.transport_access[0].matatu_routes,
//                 walking_minutes_to_stage: data.transport_access[0].walking_minutes_to_stage,
//                 nearest_main_road: data.transport_access[0].nearest_main_road,
//                 distance_to_main_road_meters: data.transport_access[0].distance_to_main_road_meters,
//                 road_access_quality: data.transport_access[0].road_access_quality,
//                 nearest_boda_stage: data.transport_access[0].nearest_boda_stage,
//                 boda_fare_to_main_road: data.transport_access[0].boda_fare_to_main_road,
//                 uber_accessible: data.transport_access[0].uber_accessible
//             };
//         }

//         if (data.property_media && Array.isArray(data.property_media)) {
//             property.media = data.property_media.map((m: any) => ({
//                 media_type: m.media_type,
//                 media_url: m.media_url,
//                 thumbnail_url: m.thumbnail_url,
//                 is_primary: m.is_primary,
//                 created_at: m.created_at
//             }));
//         }

//         if (data.nearby_places && Array.isArray(data.nearby_places)) {
//             property.nearby_places = data.nearby_places.map((p: any) => ({
//                 place_type: p.place_type,
//                 place_name: p.place_name,
//                 distance_km: p.distance_km,
//                 walking_minutes: p.walking_minutes,
//                 driving_minutes: p.driving_minutes
//             }));
//         }

//         if (data.property_amenities && Array.isArray(data.property_amenities)) {
//             property.amenities = data.property_amenities.map((a: any) => a.amenity_name);
//         }

//         return property;
//     }

//     async createProperty(data: CreatePropertyInput): Promise<PropertyWithRelations> {
//         try {
//             // 1. Validate owner exists
//             const { data: owner, error: ownerError } = await supabase
//             .from('"Users"')  
//             .select('"UserId"') 
//             .eq('"UserId"', data.owner_id) 
//             .single();

//             if (ownerError || !owner) {
//                 throw new Error('Owner not found or invalid owner ID');
//             }

//             // 2. Insert main property
//             const propertyId = crypto.randomUUID();
//             const now = new Date().toISOString();

//             const { error: propertyError } = await supabase
//                 .from('properties')
//                 .insert({
//                     property_id: propertyId,
//                     owner_id: data.owner_id,
//                     title: data.title,
//                     description: data.description,
//                     rent_amount: data.rent_amount,
//                     deposit_amount: data.deposit_amount || null,
//                     county: data.county,
//                     constituency: data.constituency || null,
//                     area: data.area,
//                     street_address: data.street_address || null,
//                     latitude: data.latitude || null,
//                     longitude: data.longitude || null,
//                     property_type: data.property_type || 'APARTMENT',
//                     bedrooms: data.bedrooms || null,
//                     bathrooms: data.bathrooms || null,
//                     rules: data.rules || null,
//                     is_available: true,
//                     is_verified: false,
//                     is_boosted: false,
//                     boost_expiry: null,
//                     created_at: now,
//                     updated_at: now
//                 })
//                 .select()
//                 .single();

//             if (propertyError) {
//                 console.error('Property creation error:', propertyError);
//                 throw new Error(`Failed to create property: ${propertyError.message}`);
//             }

//             // 3. Insert related data if provided
//             const relatedDataErrors: string[] = [];

//             // Insert costs
//             if (data.costs) {
//                 const { error: costError } = await supabase
//                     .from('property_costs')
//                     .insert({
//                         property_id: propertyId,
//                         monthly_rent: data.costs.monthly_rent,
//                         deposit_months: data.costs.deposit_months || 1,
//                         deposit_amount: data.costs.deposit_amount,
//                         service_charge: data.costs.service_charge || 0,
//                         garbage_fee: data.costs.garbage_fee || 0,
//                         security_fee: data.costs.security_fee || 0,
//                         water_included: data.costs.water_included || false,
//                         electricity_included: data.costs.electricity_included || false,
//                         internet_included: data.costs.internet_included || false,
//                         estimated_total_monthly: data.costs.estimated_total_monthly,
//                         agent_fee: data.costs.agent_fee,
//                         agent_fee_description: data.costs.agent_fee_description,
//                         total_move_in_cost: data.costs.total_move_in_cost
//                     });

//                 if (costError) {
//                     relatedDataErrors.push(`Costs: ${costError.message}`);
//                     console.error('Cost creation error:', costError);
//                 }
//             }

//             // Insert security features
//             if (data.security) {
//                 const { error: securityError } = await supabase
//                     .from('security_features')
//                     .insert({
//                         property_id: propertyId,
//                         has_security_guard: data.security.has_security_guard,
//                         guard_hours: data.security.guard_hours,
//                         has_cctv: data.security.has_cctv,
//                         has_perimeter_wall: data.security.has_perimeter_wall,
//                         has_gate: data.security.has_gate,
//                         has_electric_fence: data.security.has_electric_fence,
//                         has_security_lights: data.security.has_security_lights,
//                         requires_visitor_registration: data.security.requires_visitor_registration,
//                         has_intercom: data.security.has_intercom,
//                         police_station_distance_km: data.security.police_station_distance_km
//                     });

//                 if (securityError) {
//                     relatedDataErrors.push(`Security: ${securityError.message}`);
//                     console.error('Security creation error:', securityError);
//                 }
//             }

//             // Insert utilities
//             if (data.utilities) {
//                 const { error: utilityError } = await supabase
//                     .from('utility_info')
//                     .insert({
//                         property_id: propertyId,
//                         water_source: data.utilities.water_source,
//                         water_availability: data.utilities.water_availability,
//                         water_schedule: data.utilities.water_schedule,
//                         has_water_tank: data.utilities.has_water_tank,
//                         tank_capacity_litres: data.utilities.tank_capacity_litres,
//                         water_bill_included: data.utilities.water_bill_included,
//                         avg_monthly_water_bill: data.utilities.avg_monthly_water_bill,
//                         electricity_provider: data.utilities.electricity_provider || 'KPLC',
//                         has_prepaid_meter: data.utilities.has_prepaid_meter,
//                         has_postpaid_meter: data.utilities.has_postpaid_meter,
//                         frequent_power_outages: data.utilities.frequent_power_outages,
//                         outage_frequency: data.utilities.outage_frequency,
//                         has_generator: data.utilities.has_generator,
//                         has_solar_backup: data.utilities.has_solar_backup,
//                         electricity_bill_included: data.utilities.electricity_bill_included,
//                         avg_monthly_electricity_bill: data.utilities.avg_monthly_electricity_bill,
//                         fiber_available: data.utilities.fiber_available,
//                         fiber_providers: data.utilities.fiber_providers,
//                         garbage_collection_available: data.utilities.garbage_collection_available,
//                         garbage_collection_schedule: data.utilities.garbage_collection_schedule
//                     });

//                 if (utilityError) {
//                     relatedDataErrors.push(`Utilities: ${utilityError.message}`);
//                     console.error('Utility creation error:', utilityError);
//                 }
//             }

//             // Insert house rules
//             if (data.house_rules) {
//                 const { error: rulesError } = await supabase
//                     .from('house_rules')
//                     .insert({
//                         property_id: propertyId,
//                         max_occupants: data.house_rules.max_occupants,
//                         children_allowed: data.house_rules.children_allowed,
//                         pets_allowed: data.house_rules.pets_allowed,
//                         pet_deposit: data.house_rules.pet_deposit,
//                         overnight_visitors_allowed: data.house_rules.overnight_visitors_allowed,
//                         visitor_curfew_time: data.house_rules.visitor_curfew_time,
//                         home_business_allowed: data.house_rules.home_business_allowed,
//                         airbnb_allowed: data.house_rules.airbnb_allowed,
//                         smoking_allowed: data.house_rules.smoking_allowed,
//                         loud_music_allowed: data.house_rules.loud_music_allowed,
//                         quiet_hours: data.house_rules.quiet_hours,
//                         parking_available: data.house_rules.parking_available,
//                         parking_spaces: data.house_rules.parking_spaces,
//                         parking_fee: data.house_rules.parking_fee,
//                         visitor_parking: data.house_rules.visitor_parking,
//                         notice_period_days: data.house_rules.notice_period_days,
//                         other_rules: data.house_rules.other_rules
//                     });

//                 if (rulesError) {
//                     relatedDataErrors.push(`House rules: ${rulesError.message}`);
//                     console.error('House rules creation error:', rulesError);
//                 }
//             }

//             // Insert property condition
//             if (data.condition) {
//                 const { error: conditionError } = await supabase
//                     .from('property_condition')
//                     .insert({
//                         property_id: propertyId,
//                         overall_condition: data.condition.overall_condition,
//                         year_built: data.condition.year_built,
//                         last_renovated: data.condition.last_renovated,
//                         has_kitchen: data.condition.has_kitchen,
//                         kitchen_has_cabinets: data.condition.kitchen_has_cabinets,
//                         kitchen_has_sink: data.condition.kitchen_has_sink,
//                         kitchen_has_gas_connection: data.condition.kitchen_has_gas_connection,
//                         number_of_bathrooms: data.condition.number_of_bathrooms,
//                         bathroom_has_shower: data.condition.bathroom_has_shower,
//                         bathroom_has_bathtub: data.condition.bathroom_has_bathtub,
//                         bathroom_has_hot_water: data.condition.bathroom_has_hot_water,
//                         hot_water_type: data.condition.hot_water_type,
//                         floor_type: data.condition.floor_type,
//                         wall_finish: data.condition.wall_finish,
//                         has_ceiling: data.condition.has_ceiling,
//                         has_curtains_rails: data.condition.has_curtains_rails,
//                         has_light_fixtures: data.condition.has_light_fixtures,
//                         has_built_in_wardrobe: data.condition.has_built_in_wardrobe,
//                         has_balcony: data.condition.has_balcony,
//                         has_backyard: data.condition.has_backyard,
//                         has_compound: data.condition.has_compound
//                     });

//                 if (conditionError) {
//                     relatedDataErrors.push(`Condition: ${conditionError.message}`);
//                     console.error('Condition creation error:', conditionError);
//                 }
//             }

//             // Insert transport access
//             if (data.transport) {
//                 const { error: transportError } = await supabase
//                     .from('transport_access')
//                     .insert({
//                         property_id: propertyId,
//                         nearest_matatu_stage: data.transport.nearest_matatu_stage,
//                         matatu_routes: data.transport.matatu_routes,
//                         walking_minutes_to_stage: data.transport.walking_minutes_to_stage,
//                         nearest_main_road: data.transport.nearest_main_road,
//                         distance_to_main_road_meters: data.transport.distance_to_main_road_meters,
//                         road_access_quality: data.transport.road_access_quality,
//                         nearest_boda_stage: data.transport.nearest_boda_stage,
//                         boda_fare_to_main_road: data.transport.boda_fare_to_main_road,
//                         uber_accessible: data.transport.uber_accessible
//                     });

//                 if (transportError) {
//                     relatedDataErrors.push(`Transport: ${transportError.message}`);
//                     console.error('Transport creation error:', transportError);
//                 }
//             }

//             // Insert amenities
//             if (data.amenities && data.amenities.length > 0) {
//                 const amenityInserts = data.amenities.map(amenity => ({
//                     property_id: propertyId,
//                     amenity_name: amenity.trim(),
//                     created_at: now
//                 }));

//                 const { error: amenityError } = await supabase
//                     .from('property_amenities')
//                     .insert(amenityInserts);

//                 if (amenityError) {
//                     relatedDataErrors.push(`Amenities: ${amenityError.message}`);
//                     console.error('Amenity creation error:', amenityError);
//                 }
//             }

//             // Insert media
//             if (data.media && data.media.length > 0) {
//                 const mediaInserts = data.media.map((media, index) => ({
//                     property_id: propertyId,
//                     media_type: media.media_type,
//                     media_url: media.media_url,
//                     thumbnail_url: media.thumbnail_url,
//                     is_primary: media.is_primary || index === 0,
//                     created_at: now
//                 }));

//                 const { error: mediaError } = await supabase
//                     .from('property_media')
//                     .insert(mediaInserts);

//                 if (mediaError) {
//                     relatedDataErrors.push(`Media: ${mediaError.message}`);
//                     console.error('Media creation error:', mediaError);
//                 }
//             }

//             // Insert nearby places
//             if (data.nearby_places && data.nearby_places.length > 0) {
//                 const placesInserts = data.nearby_places.map(place => ({
//                     property_id: propertyId,
//                     place_type: place.place_type,
//                     place_name: place.place_name,
//                     distance_km: place.distance_km,
//                     walking_minutes: place.walking_minutes,
//                     driving_minutes: place.driving_minutes,
//                     created_at: now
//                 }));

//                 const { error: placesError } = await supabase
//                     .from('nearby_places')
//                     .insert(placesInserts);

//                 if (placesError) {
//                     relatedDataErrors.push(`Nearby places: ${placesError.message}`);
//                     console.error('Nearby places creation error:', placesError);
//                 }
//             }

//             // 4. Return the complete property with relations
//             const completeProperty = await this.getPropertyById(propertyId);

//             if (!completeProperty) {
//                 throw new Error('Failed to retrieve created property');
//             }

//             // Add warnings if there were related data errors
//             if (relatedDataErrors.length > 0) {
//                 completeProperty.warnings = relatedDataErrors;
//             }

//             return completeProperty;

//         } catch (error: any) {
//             console.error('Overall property creation error:', error);
//             throw new Error(`Failed to create property: ${error.message}`);
//         }
//     }

//     async getPropertyById(propertyId: string): Promise<PropertyWithRelations | null> {
//         try {
//             if (!ValidationUtils.isValidUUID(propertyId)) {
//                 throw new Error('Invalid property ID format');
//             }

//             const { data, error } = await supabase
//                 .from('properties')
//                 .select(`
//           *,
//           Users!owner_id (
//             user_id,
//             full_name,
//             email,
//             phone_number,
//             trust_score,
//             agent_status,
//             avatar_url
//           ),
//           property_costs (*),
//           security_features (*),
//           utility_info (*),
//           house_rules (*),
//           property_condition (*),
//           transport_access (*),
//           property_media (*),
//           nearby_places (*),
//           property_amenities (*)
//         `)
//                 .eq('property_id', propertyId)
//                 .single();

//             if (error) {
//                 if (error.code === 'PGRST116') return null;
//                 console.error('Error fetching property:', error);
//                 throw new Error(`Failed to fetch property: ${error.message}`);
//             }

//             return this.mapDBToPropertyWithRelations(data);

//         } catch (error: any) {
//             console.error('Error in getPropertyById:', error);
//             throw error;
//         }
//     }

//     async getPropertiesByOwner(ownerId: string, page: number = 1, limit: number = 20): Promise<{
//         properties: PropertyWithRelations[];
//         total: number;
//         page: number;
//         total_pages: number;
//     }> {
//         try {
//             if (!ValidationUtils.isValidUUID(ownerId)) {
//                 throw new Error('Invalid owner ID format');
//             }

//             const offset = (page - 1) * limit;

//             const { data, count, error } = await supabase
//                 .from('properties')
//                 .select(`
//           *,
//           property_media (media_url, is_primary),
//           property_costs (monthly_rent, deposit_amount)
//         `, { count: 'exact' })
//                 .eq('owner_id', ownerId)
//                 .order('created_at', { ascending: false })
//                 .range(offset, offset + limit - 1);

//             if (error) {
//                 console.error('Error fetching owner properties:', error);
//                 throw new Error(`Failed to fetch properties: ${error.message}`);
//             }

//             return {
//                 properties: (data || []).map(p => this.mapDBToProperty(p) as PropertyWithRelations),
//                 total: count || 0,
//                 page,
//                 total_pages: Math.ceil((count || 0) / limit)
//             };

//         } catch (error: any) {
//             console.error('Error in getPropertiesByOwner:', error);
//             throw error;
//         }
//     }

//     async getAllProperties(
//         page: number = 1,
//         limit: number = 20,
//         filters: PropertyFilter = {}
//     ): Promise<{
//         properties: PropertyWithRelations[];
//         total: number;
//         page: number;
//         total_pages: number;
//     }> {
//         try {
//             const offset = (page - 1) * limit;

//             let query = supabase
//                 .from('properties')
//                 .select(`
//           *,
//           Users!owner_id!inner (user_id, full_name, trust_score, agent_status, is_active),
//           property_media (media_url, is_primary),
//           property_costs (monthly_rent, deposit_amount)
//         `, { count: 'exact' });

//             // Apply filters
//             query = query.eq('is_available', true);
//             query = query.eq('Users.is_active', true);

//             if (filters.county) {
//                 query = query.ilike('county', `%${filters.county}%`);
//             }

//             if (filters.area) {
//                 query = query.ilike('area', `%${filters.area}%`);
//             }

//             if (filters.property_type) {
//                 query = query.eq('property_type', filters.property_type.toUpperCase());
//             }

//             if (filters.min_rent !== undefined) {
//                 query = query.gte('rent_amount', filters.min_rent);
//             }

//             if (filters.max_rent !== undefined) {
//                 query = query.lte('rent_amount', filters.max_rent);
//             }

//             if (filters.bedrooms !== undefined) {
//                 query = query.eq('bedrooms', filters.bedrooms);
//             }

//             if (filters.bathrooms !== undefined) {
//                 query = query.eq('bathrooms', filters.bathrooms);
//             }

//             if (filters.is_verified !== undefined) {
//                 query = query.eq('is_verified', filters.is_verified);
//             }

//             if (filters.is_boosted !== undefined) {
//                 query = query.eq('is_boosted', filters.is_boosted);
//             }

//             if (filters.search_term) {
//                 query = query.or(
//                     `title.ilike.%${filters.search_term}%,` +
//                     `description.ilike.%${filters.search_term}%,` +
//                     `area.ilike.%${filters.search_term}%,` +
//                     `county.ilike.%${filters.search_term}%`
//                 );
//             }

//             const { data, count, error } = await query
//                 .order('is_boosted', { ascending: false })
//                 .order('created_at', { ascending: false })
//                 .range(offset, offset + limit - 1);

//             if (error) {
//                 console.error('Error fetching properties:', error);
//                 throw new Error(`Failed to fetch properties: ${error.message}`);
//             }

//             const properties = (data || []).map(item => {
//                 const property = this.mapDBToProperty(item) as PropertyWithRelations;

//                 // Add owner info
//                 if (item.Users) {
//                     property.owner = {
//                         user_id: item.Users.user_id,
//                         full_name: item.Users.full_name,
//                         trust_score: item.Users.trust_score,
//                         agent_status: item.Users.agent_status
//                     };
//                 }

//                 // Add primary image
//                 if (item.property_media && item.property_media.length > 0) {
//                     const primaryMedia = item.property_media.find((m: any) => m.is_primary) || item.property_media[0];
//                     property.primary_image = primaryMedia.media_url;
//                 }

//                 // Add costs
//                 if (item.property_costs && item.property_costs.length > 0) {
//                     property.display_rent = item.property_costs[0].monthly_rent;
//                     property.display_deposit = item.property_costs[0].deposit_amount;
//                 }

//                 return property;
//             });

//             return {
//                 properties,
//                 total: count || 0,
//                 page,
//                 total_pages: Math.ceil((count || 0) / limit)
//             };

//         } catch (error: any) {
//             console.error('Error in getAllProperties:', error);
//             throw error;
//         }
//     }

//     async updateProperty(propertyId: string, data: UpdatePropertyInput): Promise<Property | null> {
//         try {
//             if (!ValidationUtils.isValidUUID(propertyId)) {
//                 throw new Error('Invalid property ID format');
//             }

//             // Check if property exists
//             const { data: existing, error: checkError } = await supabase
//                 .from('properties')
//                 .select('property_id')
//                 .eq('property_id', propertyId)
//                 .single();

//             if (checkError || !existing) {
//                 throw new Error('Property not found');
//             }

//             // Prepare update data
//             const updateData: any = {};

//             // Map incoming data to database columns
//             if (data.title !== undefined) updateData.title = data.title;
//             if (data.description !== undefined) updateData.description = data.description;
//             if (data.rent_amount !== undefined) updateData.rent_amount = data.rent_amount;
//             if (data.deposit_amount !== undefined) updateData.deposit_amount = data.deposit_amount;
//             if (data.county !== undefined) updateData.county = data.county;
//             if (data.constituency !== undefined) updateData.constituency = data.constituency;
//             if (data.area !== undefined) updateData.area = data.area;
//             if (data.street_address !== undefined) updateData.street_address = data.street_address;
//             if (data.latitude !== undefined) updateData.latitude = data.latitude;
//             if (data.longitude !== undefined) updateData.longitude = data.longitude;
//             if (data.property_type !== undefined) updateData.property_type = data.property_type;
//             if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
//             if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
//             if (data.rules !== undefined) updateData.rules = data.rules;
//             if (data.is_available !== undefined) updateData.is_available = data.is_available;
//             if (data.is_verified !== undefined) updateData.is_verified = data.is_verified;
//             if (data.is_boosted !== undefined) updateData.is_boosted = data.is_boosted;
//             if (data.boost_expiry !== undefined) updateData.boost_expiry = data.boost_expiry;

//             updateData.updated_at = new Date().toISOString();

//             // Perform update
//             const { data: updated, error } = await supabase
//                 .from('properties')
//                 .update(updateData)
//                 .eq('property_id', propertyId)
//                 .select()
//                 .single();

//             if (error) {
//                 console.error('Error updating property:', error);
//                 throw new Error(`Failed to update property: ${error.message}`);
//             }

//             return this.mapDBToProperty(updated);

//         } catch (error: any) {
//             console.error('Error in updateProperty:', error);
//             throw error;
//         }
//     }

//     async deleteProperty(propertyId: string): Promise<boolean> {
//         try {
//             if (!ValidationUtils.isValidUUID(propertyId)) {
//                 throw new Error('Invalid property ID format');
//             }

//             // Check if property exists
//             const { data: existing, error: checkError } = await supabase
//                 .from('properties')
//                 .select('property_id')
//                 .eq('property_id', propertyId)
//                 .single();

//             if (checkError || !existing) {
//                 throw new Error('Property not found');
//             }

//             const { error } = await supabase
//                 .from('properties')
//                 .delete()
//                 .eq('property_id', propertyId);

//             if (error) {
//                 console.error('Error deleting property:', error);
//                 throw new Error(`Failed to delete property: ${error.message}`);
//             }

//             return true;

//         } catch (error: any) {
//             console.error('Error in deleteProperty:', error);
//             throw error;
//         }
//     }

//     async getPropertyStatistics(ownerId?: string): Promise<any> {
//         try {
//             let query = supabase
//                 .from('properties')
//                 .select('property_type, county, is_available, is_verified, is_boosted', { count: 'exact' });

//             if (ownerId) {
//                 if (!ValidationUtils.isValidUUID(ownerId)) {
//                     throw new Error('Invalid owner ID format');
//                 }
//                 query = query.eq('owner_id', ownerId);
//             }

//             const { data, error } = await query;

//             if (error) {
//                 console.error('Error fetching property statistics:', error);
//                 throw new Error(`Failed to fetch statistics: ${error.message}`);
//             }

//             const stats = {
//                 total: data?.length || 0,
//                 available: 0,
//                 rented: 0,
//                 verified: 0,
//                 boosted: 0,
//                 by_type: {} as Record<string, number>,
//                 by_county: {} as Record<string, number>
//             };

//             data?.forEach((property: any) => {
//                 if (property.is_available) stats.available++;
//                 else stats.rented++;

//                 if (property.is_verified) stats.verified++;
//                 if (property.is_boosted) stats.boosted++;

//                 const type = property.property_type || 'Unknown';
//                 stats.by_type[type] = (stats.by_type[type] || 0) + 1;

//                 const county = property.county || 'Unknown';
//                 stats.by_county[county] = (stats.by_county[county] || 0) + 1;
//             });

//             return stats;

//         } catch (error: any) {
//             console.error('Error in getPropertyStatistics:', error);
//             throw error;
//         }
//     }

//     async searchProperties(searchTerm: string, page: number = 1, limit: number = 20): Promise<{
//         properties: PropertyWithRelations[];
//         total: number;
//         page: number;
//         total_pages: number;
//     }> {
//         return this.getAllProperties(page, limit, { search_term: searchTerm });
//     }

//     async verifyProperty(propertyId: string): Promise<Property | null> {
//         return this.updateProperty(propertyId, { is_verified: true });
//     }

//     async boostProperty(propertyId: string, days: number = 7): Promise<Property | null> {
//         const boostExpiry = new Date();
//         boostExpiry.setDate(boostExpiry.getDate() + days);

//         return this.updateProperty(propertyId, {
//             is_boosted: true,
//             boost_expiry: boostExpiry.toISOString()
//         });
//     }
// }

// export const propertiesService = new PropertiesService();