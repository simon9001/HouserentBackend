import { Hono } from 'hono';
import * as userSessionsControllers from './userSessions.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const userSessionsRoutes = new Hono();
// Protected routes
userSessionsRoutes.get('/users/:userId/sessions', authenticate, userSessionsControllers.getUserSessions);
userSessionsRoutes.delete('/sessions/:sessionId', authenticate, userSessionsControllers.revokeSession);
userSessionsRoutes.delete('/users/:userId/sessions', authenticate, userSessionsControllers.revokeAllSessions);
userSessionsRoutes.get('/sessions/stats', authenticate, userSessionsControllers.getSessionStatistics);
export default userSessionsRoutes;
//# sourceMappingURL=userSessions.routes.js.map