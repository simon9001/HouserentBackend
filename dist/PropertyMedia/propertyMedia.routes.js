import { Hono } from 'hono';
import * as propertyMediaControllers from './propertyMedia.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const propertyMediaRoutes = new Hono();
// Public routes
propertyMediaRoutes.get('/properties/:propertyId/media', propertyMediaControllers.getMediaByPropertyId);
propertyMediaRoutes.get('/properties/:propertyId/media/primary', propertyMediaControllers.getPrimaryMedia);
propertyMediaRoutes.get('/media/:mediaId', propertyMediaControllers.getMediaById);
// Protected routes (authenticated users)
propertyMediaRoutes.post('/media', authenticate, propertyMediaControllers.createMedia);
propertyMediaRoutes.post('/media/bulk', authenticate, propertyMediaControllers.createBulkMedia);
propertyMediaRoutes.put('/media/:mediaId', authenticate, propertyMediaControllers.updateMedia);
propertyMediaRoutes.put('/media/:mediaId/primary', authenticate, propertyMediaControllers.setPrimaryMedia);
propertyMediaRoutes.delete('/media/:mediaId', authenticate, propertyMediaControllers.deleteMedia);
// Statistics
propertyMediaRoutes.get('/media/stats/overview', authenticate, propertyMediaControllers.getMediaStatistics);
export default propertyMediaRoutes;
//# sourceMappingURL=propertyMedia.routes.js.map