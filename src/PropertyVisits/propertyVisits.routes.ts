import { Hono } from 'hono';
import * as propertyVisitsControllers from './propertyVisits.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const propertyVisitsRoutes = new Hono();

// Public routes
propertyVisitsRoutes.get('/visits/upcoming', propertyVisitsControllers.getUpcomingVisits);

// Protected routes
propertyVisitsRoutes.post('/visits', authenticate, propertyVisitsControllers.createVisit);
propertyVisitsRoutes.get('/visits/:visitId', authenticate, propertyVisitsControllers.getVisitById);
propertyVisitsRoutes.get('/properties/:propertyId/visits', authenticate, propertyVisitsControllers.getVisitsByPropertyId);
propertyVisitsRoutes.get('/users/:userId/visits', authenticate, propertyVisitsControllers.getVisitsByUserId);
propertyVisitsRoutes.put('/visits/:visitId', authenticate, propertyVisitsControllers.updateVisit);
propertyVisitsRoutes.post('/visits/:visitId/cancel', authenticate, propertyVisitsControllers.cancelVisit);
propertyVisitsRoutes.post('/visits/:visitId/checkin', authenticate, propertyVisitsControllers.checkIn);
propertyVisitsRoutes.post('/visits/:visitId/checkout', authenticate, propertyVisitsControllers.checkOut);

// Statistics
propertyVisitsRoutes.get('/visits/stats', authenticate, propertyVisitsControllers.getVisitStatistics);

export default propertyVisitsRoutes;