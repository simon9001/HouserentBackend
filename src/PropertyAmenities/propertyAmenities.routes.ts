import { Hono } from 'hono';
import * as propertyAmenitiesControllers from './propertyAmenities.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const propertyAmenitiesRoutes = new Hono();

// Public routes
propertyAmenitiesRoutes.get('/amenities/common', propertyAmenitiesControllers.getCommonAmenities);
propertyAmenitiesRoutes.get('/amenities/search', propertyAmenitiesControllers.searchAmenities);
propertyAmenitiesRoutes.get('/amenities/:amenityId', propertyAmenitiesControllers.getAmenityById);
propertyAmenitiesRoutes.get('/properties/:propertyId/amenities', propertyAmenitiesControllers.getAmenitiesByPropertyId);

// Protected routes (authenticated users)
propertyAmenitiesRoutes.post('/amenities', authenticate, propertyAmenitiesControllers.createAmenity);
propertyAmenitiesRoutes.post('/amenities/bulk', authenticate, propertyAmenitiesControllers.createBulkAmenities);
propertyAmenitiesRoutes.put('/amenities/:amenityId', authenticate, propertyAmenitiesControllers.updateAmenity);
propertyAmenitiesRoutes.delete('/amenities/:amenityId', authenticate, propertyAmenitiesControllers.deleteAmenity);
propertyAmenitiesRoutes.delete('/properties/:propertyId/amenities', authenticate, propertyAmenitiesControllers.deleteAmenitiesByPropertyId);

// Statistics (authenticated)
propertyAmenitiesRoutes.get('/amenities/stats/overview', authenticate, propertyAmenitiesControllers.getAmenitiesStatistics);

export default propertyAmenitiesRoutes;