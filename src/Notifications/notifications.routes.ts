// notification.routes.js
import { Hono } from 'hono';
import { authenticateEnhanced } from '../middleware/auth.middleware.js';
import * as notificationController from './notifications.controller.js';

const notificationRoutes = new Hono();

// Add debug logging
notificationRoutes.use('*', async (c, next) => {
    console.log('📡 Notification route:', {
        method: c.req.method,
        path: c.req.path,
        time: new Date().toISOString()
    });
    await next();
});

// Use enhanced authentication
notificationRoutes.use('*', authenticateEnhanced);

// Basic CRUD operations
notificationRoutes.get('/', notificationController.getNotifications);
notificationRoutes.get('/unread-count', notificationController.getUnreadCount);
notificationRoutes.get('/:id', notificationController.getNotificationById);
notificationRoutes.post('/', notificationController.createNotification);
notificationRoutes.put('/:id/read', notificationController.markAsRead);
notificationRoutes.put('/read-all', notificationController.markAllAsRead);

// Special operations
notificationRoutes.post('/broadcast', notificationController.sendBroadcast);
notificationRoutes.post('/clients', notificationController.sendToClients);

// Debug endpoint (optional, remove in production)
notificationRoutes.get('/debug/context', notificationController.debugContext);

export default notificationRoutes;