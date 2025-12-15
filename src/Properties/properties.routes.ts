import { Hono } from 'hono';
import * as propertiesControllers from './properties.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { subscriptionGate } from '../middleware/subscription.middleware.js';

const propertiesRoutes = new Hono();

propertiesRoutes.post(
    '/properties',
    authenticate,
    subscriptionGate({
        feature: 'PROPERTY_CREATE',
        gateType: 'HARD' // Hard gate - deny if limit reached
    }),
    propertiesControllers.createProperty
);

// Public routes
propertiesRoutes.get('/properties', propertiesControllers.getAllProperties);
propertiesRoutes.get('/properties/search', propertiesControllers.searchProperties);
propertiesRoutes.get('/properties/:propertyId', propertiesControllers.getPropertyById);

// Protected routes
// propertiesRoutes.post('/properties', authenticate, propertiesControllers.createProperty);
propertiesRoutes.get('/properties/owner/:ownerId', authenticate, propertiesControllers.getPropertiesByOwner);
propertiesRoutes.put('/properties/:propertyId', authenticate, propertiesControllers.updateProperty);
propertiesRoutes.delete('/properties/:propertyId', authenticate, propertiesControllers.deleteProperty);
propertiesRoutes.get('/properties/stats/overview', authenticate, propertiesControllers.getPropertyStatistics);

// Admin only routes
propertiesRoutes.put('/properties/:propertyId/verify', authenticate, authorize('ADMIN'), propertiesControllers.verifyProperty);
propertiesRoutes.put('/properties/:propertyId/boost', authenticate, authorize('ADMIN'), propertiesControllers.boostProperty);


propertiesRoutes.post(
    '/properties/:propertyId/boost',
    authenticate,
    subscriptionGate({
        feature: 'BOOST_PROPERTY',
        gateType: 'SOFT', // Soft gate - allow but show upsell
        upsellPlanId: 'premium-plan-id'
    }),
    propertiesControllers.boostProperty
);

export default propertiesRoutes;