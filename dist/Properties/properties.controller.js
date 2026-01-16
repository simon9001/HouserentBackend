import { propertiesService } from './properties.service.js';
import { ValidationUtils } from '../utils/validators.js';
import { transformKeysToCamel } from '../utils/transformers.js';
// Create new property
export const createProperty = async (c) => {
    try {
        const body = await c.req.json();
        // Convert camelCase to snake_case for service compatibility
        const transformedBody = {
            owner_id: body.ownerId || body.owner_id,
            title: body.title,
            description: body.description,
            rent_amount: body.rentAmount || body.rent_amount,
            deposit_amount: body.depositAmount || body.deposit_amount,
            county: body.county,
            constituency: body.constituency,
            area: body.area,
            street_address: body.streetAddress || body.street_address,
            latitude: body.latitude,
            longitude: body.longitude,
            property_type: body.propertyType || body.property_type,
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            rules: body.rules,
            // Related data - transform nested objects too
            costs: body.costs ? {
                monthly_rent: body.costs.monthlyRent || body.costs.monthly_rent,
                deposit_months: body.costs.depositMonths || body.costs.deposit_months,
                deposit_amount: body.costs.depositAmount || body.costs.deposit_amount,
                service_charge: body.costs.serviceCharge || body.costs.service_charge,
                garbage_fee: body.costs.garbageFee || body.costs.garbage_fee,
                security_fee: body.costs.securityFee || body.costs.security_fee,
                water_included: body.costs.waterIncluded || body.costs.water_included,
                electricity_included: body.costs.electricityIncluded || body.costs.electricity_included,
                internet_included: body.costs.internetIncluded || body.costs.internet_included,
                estimated_total_monthly: body.costs.estimatedTotalMonthly || body.costs.estimated_total_monthly,
                agent_fee: body.costs.agentFee || body.costs.agent_fee,
                agent_fee_description: body.costs.agentFeeDescription || body.costs.agent_fee_description,
                total_move_in_cost: body.costs.totalMoveInCost || body.costs.total_move_in_cost
            } : body.costs,
            security: body.security ? {
                has_security_guard: body.security.hasSecurityGuard || body.security.has_security_guard,
                guard_hours: body.security.guardHours || body.security.guard_hours,
                has_cctv: body.security.hasCCTV || body.security.has_cctv,
                has_perimeter_wall: body.security.hasPerimeterWall || body.security.has_perimeter_wall,
                has_gate: body.security.hasGate || body.security.has_gate,
                has_electric_fence: body.security.hasElectricFence || body.security.has_electric_fence,
                has_security_lights: body.security.hasSecurityLights || body.security.has_security_lights,
                requires_visitor_registration: body.security.requiresVisitorRegistration || body.security.requires_visitor_registration,
                has_intercom: body.security.hasIntercom || body.security.has_intercom,
                police_station_distance_km: body.security.policeStationDistanceKm || body.security.police_station_distance_km
            } : body.security,
            utilities: body.utilities ? {
                water_source: body.utilities.waterSource || body.utilities.water_source,
                water_availability: body.utilities.waterAvailability || body.utilities.water_availability,
                water_schedule: body.utilities.waterSchedule || body.utilities.water_schedule,
                has_water_tank: body.utilities.hasWaterTank || body.utilities.has_water_tank,
                tank_capacity_litres: body.utilities.tankCapacityLitres || body.utilities.tank_capacity_litres,
                water_bill_included: body.utilities.waterBillIncluded || body.utilities.water_bill_included,
                avg_monthly_water_bill: body.utilities.avgMonthlyWaterBill || body.utilities.avg_monthly_water_bill,
                electricity_provider: body.utilities.electricityProvider || body.utilities.electricity_provider,
                has_prepaid_meter: body.utilities.hasPrepaidMeter || body.utilities.has_prepaid_meter,
                has_postpaid_meter: body.utilities.hasPostpaidMeter || body.utilities.has_postpaid_meter,
                frequent_power_outages: body.utilities.frequentPowerOutages || body.utilities.frequent_power_outages,
                outage_frequency: body.utilities.outageFrequency || body.utilities.outage_frequency,
                has_generator: body.utilities.hasGenerator || body.utilities.has_generator,
                has_solar_backup: body.utilities.hasSolarBackup || body.utilities.has_solar_backup,
                electricity_bill_included: body.utilities.electricityBillIncluded || body.utilities.electricity_bill_included,
                avg_monthly_electricity_bill: body.utilities.avgMonthlyElectricityBill || body.utilities.avg_monthly_electricity_bill,
                fiber_available: body.utilities.fiberAvailable || body.utilities.fiber_available,
                fiber_providers: body.utilities.fiberProviders || body.utilities.fiber_providers,
                garbage_collection_available: body.utilities.garbageCollectionAvailable || body.utilities.garbage_collection_available,
                garbage_collection_schedule: body.utilities.garbageCollectionSchedule || body.utilities.garbage_collection_schedule
            } : body.utilities,
            house_rules: body.houseRules ? {
                max_occupants: body.houseRules.maxOccupants || body.houseRules.max_occupants,
                children_allowed: body.houseRules.childrenAllowed || body.houseRules.children_allowed,
                pets_allowed: body.houseRules.petsAllowed || body.houseRules.pets_allowed,
                pet_deposit: body.houseRules.petDeposit || body.houseRules.pet_deposit,
                overnight_visitors_allowed: body.houseRules.overnightVisitorsAllowed || body.houseRules.overnight_visitors_allowed,
                visitor_curfew_time: body.houseRules.visitorCurfewTime || body.houseRules.visitor_curfew_time,
                home_business_allowed: body.houseRules.homeBusinessAllowed || body.houseRules.home_business_allowed,
                airbnb_allowed: body.houseRules.airbnbAllowed || body.houseRules.airbnb_allowed,
                smoking_allowed: body.houseRules.smokingAllowed || body.houseRules.smoking_allowed,
                loud_music_allowed: body.houseRules.loudMusicAllowed || body.houseRules.loud_music_allowed,
                quiet_hours: body.houseRules.quietHours || body.houseRules.quiet_hours,
                parking_available: body.houseRules.parkingAvailable || body.houseRules.parking_available,
                parking_spaces: body.houseRules.parkingSpaces || body.houseRules.parking_spaces,
                parking_fee: body.houseRules.parkingFee || body.houseRules.parking_fee,
                visitor_parking: body.houseRules.visitorParking || body.houseRules.visitor_parking,
                notice_period_days: body.houseRules.noticePeriodDays || body.houseRules.notice_period_days,
                other_rules: body.houseRules.otherRules || body.houseRules.other_rules
            } : body.houseRules,
            condition: body.condition ? {
                overall_condition: body.condition.overallCondition || body.condition.overall_condition,
                year_built: body.condition.yearBuilt || body.condition.year_built,
                last_renovated: body.condition.lastRenovated || body.condition.last_renovated,
                has_kitchen: body.condition.hasKitchen || body.condition.has_kitchen,
                kitchen_has_cabinets: body.condition.kitchenHasCabinets || body.condition.kitchen_has_cabinets,
                kitchen_has_sink: body.condition.kitchenHasSink || body.condition.kitchen_has_sink,
                kitchen_has_gas_connection: body.condition.kitchenHasGasConnection || body.condition.kitchen_has_gas_connection,
                number_of_bathrooms: body.condition.numberOfBathrooms || body.condition.number_of_bathrooms,
                bathroom_has_shower: body.condition.bathroomHasShower || body.condition.bathroom_has_shower,
                bathroom_has_bathtub: body.condition.bathroomHasBathtub || body.condition.bathroom_has_bathtub,
                bathroom_has_hot_water: body.condition.bathroomHasHotWater || body.condition.bathroom_has_hot_water,
                hot_water_type: body.condition.hotWaterType || body.condition.hot_water_type,
                floor_type: body.condition.floorType || body.condition.floor_type,
                wall_finish: body.condition.wallFinish || body.condition.wall_finish,
                has_ceiling: body.condition.hasCeiling || body.condition.has_ceiling,
                has_curtains_rails: body.condition.hasCurtainsRails || body.condition.has_curtains_rails,
                has_light_fixtures: body.condition.hasLightFixtures || body.condition.has_light_fixtures,
                has_built_in_wardrobe: body.condition.hasBuiltInWardrobe || body.condition.has_built_in_wardrobe,
                has_balcony: body.condition.hasBalcony || body.condition.has_balcony,
                has_backyard: body.condition.hasBackyard || body.condition.has_backyard,
                has_compound: body.condition.hasCompound || body.condition.has_compound
            } : body.condition,
            transport: body.transport ? {
                nearest_matatu_stage: body.transport.nearestMatatuStage || body.transport.nearest_matatu_stage,
                matatu_routes: body.transport.matatuRoutes || body.transport.matatu_routes,
                walking_minutes_to_stage: body.transport.walkingMinutesToStage || body.transport.walking_minutes_to_stage,
                nearest_main_road: body.transport.nearestMainRoad || body.transport.nearest_main_road,
                distance_to_main_road_meters: body.transport.distanceToMainRoadMeters || body.transport.distance_to_main_road_meters,
                road_access_quality: body.transport.roadAccessQuality || body.transport.road_access_quality,
                nearest_boda_stage: body.transport.nearestBodaStage || body.transport.nearest_boda_stage,
                boda_fare_to_main_road: body.transport.bodaFareToMainRoad || body.transport.boda_fare_to_main_road,
                uber_accessible: body.transport.uberAccessible || body.transport.uber_accessible
            } : body.transport,
            nearby_places: body.nearbyPlaces || body.nearby_places,
            media: body.media,
            amenities: body.amenities
        };
        // Validate required basic fields using snake_case
        const requiredFields = ['owner_id', 'title', 'description', 'rent_amount', 'county', 'area'];
        const missingFields = requiredFields.filter(field => !transformedBody[field]);
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        // Validate UUID
        if (!ValidationUtils.isValidUUID(transformedBody.owner_id)) {
            return c.json({
                success: false,
                error: 'Invalid owner ID format'
            }, 400);
        }
        // Validate rent amount
        if (transformedBody.rent_amount <= 0) {
            return c.json({
                success: false,
                error: 'Rent amount must be greater than 0'
            }, 400);
        }
        // Validate property type if provided
        if (transformedBody.property_type) {
            const validTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
            if (!validTypes.includes(transformedBody.property_type.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid property type. Must be one of: APARTMENT, HOUSE, COMMERCIAL, LAND, OTHER'
                }, 400);
            }
            transformedBody.property_type = transformedBody.property_type.toUpperCase();
        }
        // Validate deposit amount if provided
        if (transformedBody.deposit_amount !== undefined && transformedBody.deposit_amount < 0) {
            return c.json({
                success: false,
                error: 'Deposit amount cannot be negative'
            }, 400);
        }
        const property = await propertiesService.createProperty(transformedBody);
        return c.json({
            success: true,
            message: 'Property created successfully',
            data: transformKeysToCamel(property)
        }, 201);
    }
    catch (error) {
        console.error('Error creating property:', error.message);
        // Handle specific error cases
        if (error.message.includes('not found') ||
            error.message.includes('Missing required') ||
            error.message.includes('Invalid') ||
            error.message.includes('must be greater') ||
            error.message.includes('cannot be negative')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to create property'
        }, 500);
    }
};
// Get property by ID
export const getPropertyById = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const property = await propertiesService.getPropertyById(propertyId);
        if (!property) {
            return c.json({
                success: false,
                error: 'Property not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: transformKeysToCamel(property)
        });
    }
    catch (error) {
        console.error('Error fetching property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to fetch property'
        }, 500);
    }
};
// Get properties by owner
export const getPropertiesByOwner = async (c) => {
    try {
        const ownerId = c.req.param('ownerId');
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        if (!ValidationUtils.isValidUUID(ownerId)) {
            return c.json({
                success: false,
                error: 'Invalid owner ID format'
            }, 400);
        }
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        const result = await propertiesService.getPropertiesByOwner(ownerId, page, limit);
        return c.json({
            success: true,
            data: transformKeysToCamel({
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    total_pages: result.total_pages,
                    limit
                }
            })
        });
    }
    catch (error) {
        console.error('Error fetching owner properties:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to fetch properties'
        }, 500);
    }
};
// Get all properties with filters
export const getAllProperties = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        // Parse filters from query params - convert to snake_case
        const filters = {
            county: c.req.query('county'),
            area: c.req.query('area'),
            min_rent: c.req.query('minRent') ? parseFloat(c.req.query('minRent')) :
                c.req.query('min_rent') ? parseFloat(c.req.query('min_rent')) : undefined,
            max_rent: c.req.query('maxRent') ? parseFloat(c.req.query('maxRent')) :
                c.req.query('max_rent') ? parseFloat(c.req.query('max_rent')) : undefined,
            property_type: c.req.query('propertyType') || c.req.query('property_type'),
            bedrooms: c.req.query('bedrooms') ? parseInt(c.req.query('bedrooms')) : undefined,
            bathrooms: c.req.query('bathrooms') ? parseInt(c.req.query('bathrooms')) : undefined,
            is_available: c.req.query('isAvailable') ? c.req.query('isAvailable') === 'true' :
                c.req.query('is_available') ? c.req.query('is_available') === 'true' : true,
            is_verified: c.req.query('isVerified') ? c.req.query('isVerified') === 'true' :
                c.req.query('is_verified') ? c.req.query('is_verified') === 'true' : undefined,
            is_boosted: c.req.query('isBoosted') ? c.req.query('isBoosted') === 'true' :
                c.req.query('is_boosted') ? c.req.query('is_boosted') === 'true' : undefined,
            search_term: c.req.query('search') || c.req.query('searchTerm') || c.req.query('q')
        };
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        // Validate property type if provided
        if (filters.property_type) {
            const validTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
            if (!validTypes.includes(filters.property_type.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid property type. Must be one of: APARTMENT, HOUSE, COMMERCIAL, LAND, OTHER'
                }, 400);
            }
            filters.property_type = filters.property_type.toUpperCase();
        }
        const result = await propertiesService.getAllProperties(page, limit, filters);
        return c.json({
            success: true,
            data: transformKeysToCamel({
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    total_pages: result.total_pages,
                    limit
                }
            })
        });
    }
    catch (error) {
        console.error('Error fetching properties:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to fetch properties'
        }, 500);
    }
};
// Update property
export const updateProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Convert camelCase to snake_case for service compatibility
        const updateData = {
            title: body.title,
            description: body.description,
            rent_amount: body.rentAmount || body.rent_amount,
            deposit_amount: body.depositAmount || body.deposit_amount,
            county: body.county,
            constituency: body.constituency,
            area: body.area,
            street_address: body.streetAddress || body.street_address,
            latitude: body.latitude,
            longitude: body.longitude,
            property_type: body.propertyType || body.property_type,
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            rules: body.rules,
            is_available: body.isAvailable || body.is_available,
            is_verified: body.isVerified || body.is_verified,
            is_boosted: body.isBoosted || body.is_boosted,
            boost_expiry: body.boostExpiry || body.boost_expiry
        };
        // Clean up undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        // Validate rent amount if provided
        if (updateData.rent_amount !== undefined && updateData.rent_amount <= 0) {
            return c.json({
                success: false,
                error: 'Rent amount must be greater than 0'
            }, 400);
        }
        if (updateData.deposit_amount !== undefined && updateData.deposit_amount !== null && updateData.deposit_amount < 0) {
            return c.json({
                success: false,
                error: 'Deposit amount cannot be negative'
            }, 400);
        }
        // Validate property type if provided
        if (updateData.property_type) {
            const validTypes = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER'];
            if (!validTypes.includes(updateData.property_type.toUpperCase())) {
                return c.json({
                    success: false,
                    error: 'Invalid property type'
                }, 400);
            }
            updateData.property_type = updateData.property_type.toUpperCase();
        }
        const updatedProperty = await propertiesService.updateProperty(propertyId, updateData);
        if (!updatedProperty) {
            return c.json({
                success: false,
                error: 'Failed to update property'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Property updated successfully',
            data: transformKeysToCamel(updatedProperty)
        });
    }
    catch (error) {
        console.error('Error updating property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update property'
        }, 500);
    }
};
// Delete property
export const deleteProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const success = await propertiesService.deleteProperty(propertyId);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to delete property'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Property deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to delete property'
        }, 500);
    }
};
// Get property statistics
export const getPropertyStatistics = async (c) => {
    try {
        const ownerId = c.req.query('ownerId');
        if (ownerId && !ValidationUtils.isValidUUID(ownerId)) {
            return c.json({
                success: false,
                error: 'Invalid owner ID format'
            }, 400);
        }
        const stats = await propertiesService.getPropertyStatistics(ownerId || undefined);
        return c.json({
            success: true,
            data: transformKeysToCamel(stats)
        });
    }
    catch (error) {
        console.error('Error fetching property statistics:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to fetch statistics'
        }, 500);
    }
};
// Search properties
export const searchProperties = async (c) => {
    try {
        const searchTerm = c.req.query('q') || c.req.query('search') || c.req.query('searchTerm') || '';
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        if (searchTerm.length < 2) {
            return c.json({
                success: false,
                error: 'Search term must be at least 2 characters long'
            }, 400);
        }
        const result = await propertiesService.searchProperties(searchTerm, page, limit);
        return c.json({
            success: true,
            data: transformKeysToCamel({
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    total_pages: result.total_pages,
                    limit
                }
            })
        });
    }
    catch (error) {
        console.error('Error searching properties:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to search properties'
        }, 500);
    }
};
// Admin verify property
export const verifyProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const updatedProperty = await propertiesService.verifyProperty(propertyId);
        if (!updatedProperty) {
            return c.json({
                success: false,
                error: 'Failed to verify property'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Property verified successfully',
            data: transformKeysToCamel(updatedProperty)
        });
    }
    catch (error) {
        console.error('Error verifying property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to verify property'
        }, 500);
    }
};
// Admin boost property
export const boostProperty = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // Calculate boost expiry (default 7 days from now)
        const boostDays = body.days || 7;
        const updatedProperty = await propertiesService.boostProperty(propertyId, boostDays);
        if (!updatedProperty) {
            return c.json({
                success: false,
                error: 'Failed to boost property'
            }, 500);
        }
        return c.json({
            success: true,
            message: `Property boosted for ${boostDays} days`,
            data: transformKeysToCamel(updatedProperty)
        });
    }
    catch (error) {
        console.error('Error boosting property:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to boost property'
        }, 500);
    }
};
// Additional helper endpoints
// Get featured properties (boosted and verified)
export const getFeaturedProperties = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '10');
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        const filters = {
            is_boosted: true,
            is_verified: true,
            is_available: true
        };
        const result = await propertiesService.getAllProperties(page, limit, filters);
        return c.json({
            success: true,
            data: transformKeysToCamel({
                properties: result.properties,
                pagination: {
                    total: result.total,
                    page: result.page,
                    total_pages: result.total_pages,
                    limit
                }
            })
        });
    }
    catch (error) {
        console.error('Error fetching featured properties:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch featured properties'
        }, 500);
    }
};
// Get similar properties
export const getSimilarProperties = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const limit = parseInt(c.req.query('limit') || '5');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        // First get the property to find similar ones
        const property = await propertiesService.getPropertyById(propertyId);
        if (!property) {
            return c.json({
                success: false,
                error: 'Property not found'
            }, 404);
        }
        const filters = {
            county: property.county,
            area: property.area,
            property_type: property.property_type,
            bedrooms: property.bedrooms || undefined,
            is_available: true,
            is_verified: true
        };
        // Exclude current property
        const result = await propertiesService.getAllProperties(1, limit, filters);
        // Filter out the current property
        const similarProperties = result.properties.filter((p) => p.property_id !== propertyId);
        return c.json({
            success: true,
            data: transformKeysToCamel({
                properties: similarProperties,
                total: similarProperties.length
            })
        });
    }
    catch (error) {
        console.error('Error fetching similar properties:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to fetch similar properties'
        }, 500);
    }
};
//# sourceMappingURL=properties.controller.js.map