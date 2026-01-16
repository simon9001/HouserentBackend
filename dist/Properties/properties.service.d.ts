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
export declare class PropertiesService {
    private mapDBToProperty;
    private mapDBToPropertyWithRelations;
    createProperty(data: CreatePropertyInput): Promise<PropertyWithRelations>;
    getPropertyById(propertyId: string): Promise<PropertyWithRelations | null>;
    getPropertiesByOwner(ownerId: string, page?: number, limit?: number): Promise<{
        properties: PropertyWithRelations[];
        total: number;
        page: number;
        total_pages: number;
    }>;
    getAllProperties(page?: number, limit?: number, filters?: PropertyFilter): Promise<{
        properties: PropertyWithRelations[];
        total: number;
        page: number;
        total_pages: number;
    }>;
    updateProperty(propertyId: string, data: UpdatePropertyInput): Promise<Property | null>;
    deleteProperty(propertyId: string): Promise<boolean>;
    getPropertyStatistics(ownerId?: string): Promise<any>;
    searchProperties(searchTerm: string, page?: number, limit?: number): Promise<{
        properties: PropertyWithRelations[];
        total: number;
        page: number;
        total_pages: number;
    }>;
    verifyProperty(propertyId: string): Promise<Property | null>;
    boostProperty(propertyId: string, days?: number): Promise<Property | null>;
}
export declare const propertiesService: PropertiesService;
//# sourceMappingURL=properties.service.d.ts.map