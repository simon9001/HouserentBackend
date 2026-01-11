import { Hono } from 'hono';
import * as userSessionsControllers from './userSessions.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
const userSessionsRoutes = new Hono();
// Protected routes
userSessionsRoutes.get('/users/:userId/sessions', authenticate, userSessionsControllers.getUserSessions);
userSessionsRoutes.delete('/sessions/:sessionId', authenticate, userSessionsControllers.revokeSession);
userSessionsRoutes.delete('/users/:userId/sessions', authenticate, userSessionsControllers.revokeAllSessions);
userSessionsRoutes.get('/sessions/stats', authenticate, userSessionsControllers.getSessionStatistics);
userSessionsRoutes.delete('/users/:userId/sessions/device', authenticate, userSessionsControllers.revokeSessionsByDevice);
userSessionsRoutes.get('/sessions/:sessionId', authenticate, userSessionsControllers.getSession);
userSessionsRoutes.get('/sessions/:sessionId/with-user', authenticate, userSessionsControllers.getSessionWithUser);
userSessionsRoutes.patch('/sessions/:sessionId/renew', authenticate, userSessionsControllers.renewSession);
userSessionsRoutes.get('/users/:userId/sessions/device/check', authenticate, userSessionsControllers.checkDeviceSession);
userSessionsRoutes.get('/users/:userId/sessions/device', authenticate, userSessionsControllers.getSessionByDevice);
// Public route (for refresh token validation)
userSessionsRoutes.post('/sessions/validate', userSessionsControllers.validateSession);
// Admin-only routes
userSessionsRoutes.post('/sessions/cleanup/expired', authenticate, authorize('ADMIN'), userSessionsControllers.cleanExpiredSessions);
userSessionsRoutes.post('/sessions/cleanup/old', authenticate, authorize('ADMIN'), userSessionsControllers.cleanupOldSessions);
export default userSessionsRoutes;
//# sourceMappingURL=userSessions.routes.js.map