import { Hono } from 'hono';
import * as propertiesControllers from './properties.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
// import { subscriptionGate } from '../middleware/subscription.middleware.js';
const propertiesRoutes = new Hono();
// 🔴 REMOVE THIS DUPLICATE or fix it:
// propertiesRoutes.post(
//     '/properties',
//     authenticate,
//     subscriptionGate({
//         feature: 'PROPERTY_CREATE',
//         gateType: 'HARD' // Hard gate - deny if limit reached
//     }),
//     propertiesControllers.createProperty
// );
// ============================================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================================
// Get all properties with optional filters
propertiesRoutes.get('/', propertiesControllers.getAllProperties);
// Search properties
propertiesRoutes.get('/search', propertiesControllers.searchProperties);
// Get property by ID
propertiesRoutes.get('/:propertyId', propertiesControllers.getPropertyById);
// Get featured properties (boosted and verified)
propertiesRoutes.get('/featured/featured', propertiesControllers.getFeaturedProperties);
// Get similar properties to a specific property
propertiesRoutes.get('/:propertyId/similar', propertiesControllers.getSimilarProperties);
// Debug endpoint without auth
propertiesRoutes.post('/test-public', async (c) => {
    console.log('✅ /api/properties/test-public reached!');
    return c.json({
        success: true,
        message: 'Property route without auth works!',
        timestamp: new Date().toISOString()
    });
});
// ============================================================================
// PROTECTED ROUTES (authentication required)
// ============================================================================
// Create new property
propertiesRoutes.post('/', authenticate, 
// subscriptionGate({  // Temporarily disable subscription gate for testing
//     feature: 'PROPERTY_CREATE',
//     gateType: 'HARD'
// }),
propertiesControllers.createProperty);
// Get properties by owner (authenticated user can view their own properties)
propertiesRoutes.get('/owner/:ownerId', authenticate, propertiesControllers.getPropertiesByOwner);
// Update property (owner or admin only - check in controller/middleware)
propertiesRoutes.put('/:propertyId', authenticate, propertiesControllers.updateProperty);
// Delete property (owner or admin only - check in controller/middleware)
propertiesRoutes.delete('/:propertyId', authenticate, propertiesControllers.deleteProperty);
// Get property statistics (for authenticated user)
propertiesRoutes.get('/stats/overview', authenticate, propertiesControllers.getPropertyStatistics);
// ============================================================================
// ADMIN ONLY ROUTES (admin authorization required)
// ============================================================================
// Admin verify property
propertiesRoutes.put('/:propertyId/verify', authenticate, authorize('ADMIN'), propertiesControllers.verifyProperty);
// Admin boost property
propertiesRoutes.put('/:propertyId/boost', authenticate, authorize('ADMIN'), propertiesControllers.boostProperty);
// ============================================================================
// DEBUG/TEST ROUTES
// ============================================================================
// Debug endpoint to test if route is reachable
propertiesRoutes.post('/test-auth', authenticate, async (c) => {
    console.log('✅ /api/properties/test-auth reached! User:', c.user);
    return c.json({
        success: true,
        message: 'Property route with authentication works!',
        user: c.user,
        timestamp: new Date().toISOString()
    });
});
// Test route for debugging (no auth required)
propertiesRoutes.get('/test/health', async (c) => {
    return c.json({
        success: true,
        message: 'Properties API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
export default propertiesRoutes;
//# sourceMappingURL=properties.routes.js.map