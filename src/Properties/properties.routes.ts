import { Hono } from 'hono';
import * as propertiesControllers from './properties.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { subscriptionGate } from '../middleware/subscription.middleware.js';

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

// Public routes (no authentication)
propertiesRoutes.get('/', propertiesControllers.getAllProperties);
propertiesRoutes.get('/search', propertiesControllers.searchProperties);
propertiesRoutes.get('/:propertyId', propertiesControllers.getPropertyById);

// Protected routes (authentication required)
propertiesRoutes.post('/', 
    authenticate, 
    // subscriptionGate({  // Temporarily disable subscription gate for testing
    //     feature: 'PROPERTY_CREATE',
    //     gateType: 'HARD'
    // }),
    propertiesControllers.createProperty
);

propertiesRoutes.get('/owner/:ownerId', authenticate, propertiesControllers.getPropertiesByOwner);
propertiesRoutes.put('/:propertyId', authenticate, propertiesControllers.updateProperty);
propertiesRoutes.delete('/:propertyId', authenticate, propertiesControllers.deleteProperty);
propertiesRoutes.get('/stats/overview', authenticate, propertiesControllers.getPropertyStatistics);

// Admin only routes
propertiesRoutes.put('/:propertyId/verify', authenticate, authorize('ADMIN'), propertiesControllers.verifyProperty);
propertiesRoutes.put('/:propertyId/boost', authenticate, authorize('ADMIN'), propertiesControllers.boostProperty);

// Debug endpoint to test if route is reachable
// propertiesRoutes.post('/test-auth', authenticate, async (c) => {
//     console.log('✅ /api/properties/test-auth reached! User:', c.user);
//     return c.json({
//         success: true,
//         message: 'Property route with authentication works!',
//         user: c.user,
//         timestamp: new Date().toISOString()
//     });
// });

// Debug endpoint without auth
propertiesRoutes.post('/test-public', async (c) => {
    console.log('✅ /api/properties/test-public reached!');
    return c.json({
        success: true,
        message: 'Property route without auth works!',
        timestamp: new Date().toISOString()
    });
});

export default propertiesRoutes;