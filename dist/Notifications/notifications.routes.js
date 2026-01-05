import { Hono } from 'hono';
import { authenticate } from '../middleware/auth.middleware.js';
import * as notificationController from './notifications.controller.js';
const notificationRoutes = new Hono();
// all routes require authentication
notificationRoutes.use('*', authenticate);
notificationRoutes.get('/', notificationController.getNotifications);
notificationRoutes.get('/unread-count', notificationController.getUnreadCount);
notificationRoutes.put('/:id/read', notificationController.markAsRead);
notificationRoutes.put('/read-all', notificationController.markAllAsRead);
notificationRoutes.post('/broadcast', notificationController.sendBroadcast);
notificationRoutes.post('/clients', notificationController.sendToClients);
export default notificationRoutes;
//# sourceMappingURL=notifications.routes.js.map