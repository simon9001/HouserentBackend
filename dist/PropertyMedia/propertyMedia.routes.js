import { Hono } from 'hono';
import * as propertyMediaControllers from './propertyMedia.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const propertyMediaRoutes = new Hono();
// Public routes
propertyMediaRoutes.get('/properties/:propertyId/media', propertyMediaControllers.getMediaByPropertyId);
propertyMediaRoutes.get('/properties/:propertyId/media/primary', propertyMediaControllers.getPrimaryMedia);
propertyMediaRoutes.get('/media/:mediaId', propertyMediaControllers.getMediaById);
// Upload signature (public but limited)
propertyMediaRoutes.get('/upload/signature', propertyMediaControllers.getUploadSignature);
// Protected routes (authenticated users)
propertyMediaRoutes.post('/media', authenticate, propertyMediaControllers.createMedia);
propertyMediaRoutes.post('/media/bulk', authenticate, propertyMediaControllers.createBulkMedia);
// File upload routes (authenticated)
propertyMediaRoutes.post('/media/upload', authenticate, propertyMediaControllers.createMediaWithUpload);
propertyMediaRoutes.post('/media/upload/bulk', authenticate, propertyMediaControllers.createBulkMediaWithUpload);
// Update and delete routes (authenticated)
propertyMediaRoutes.put('/media/:mediaId', authenticate, propertyMediaControllers.updateMedia);
propertyMediaRoutes.put('/media/:mediaId/primary', authenticate, propertyMediaControllers.setPrimaryMedia);
propertyMediaRoutes.delete('/media/:mediaId', authenticate, propertyMediaControllers.deleteMediaWithCloudinary);
// Statistics
propertyMediaRoutes.get('/media/stats/overview', authenticate, propertyMediaControllers.getMediaStatistics);
// Additional routes for type filtering and counts
propertyMediaRoutes.get('/properties/:propertyId/media/count', propertyMediaControllers.getMediaCount);
propertyMediaRoutes.get('/properties/:propertyId/media/type', propertyMediaControllers.getMediaByType);
export default propertyMediaRoutes;
//# sourceMappingURL=propertyMedia.routes.js.map