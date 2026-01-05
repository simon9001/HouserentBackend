import { notificationService } from './notifications.service.js';
export const getNotifications = async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.userId;
        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }
        const notifications = await notificationService.getNotificationsByUser(userId);
        return c.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        return c.json({ message: 'Failed to fetch notifications' }, 500);
    }
};
export const markAsRead = async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.userId;
        const id = c.req.param('id');
        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }
        const success = await notificationService.markAsRead(id, userId);
        if (!success) {
            return c.json({ message: 'Notification not found' }, 404);
        }
        return c.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        return c.json({ message: 'Failed to update notification' }, 500);
    }
};
export const markAllAsRead = async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.userId;
        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }
        await notificationService.markAllAsRead(userId);
        return c.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        return c.json({ message: 'Failed to update notifications' }, 500);
    }
};
export const getUnreadCount = async (c) => {
    try {
        const user = c.get('user');
        const userId = user?.userId;
        if (!userId) {
            return c.json({ message: 'Unauthorized' }, 401);
        }
        const count = await notificationService.getUnreadCount(userId);
        return c.json({ count });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        return c.json({ message: 'Failed to fetch unread count' }, 500);
    }
};
export const sendBroadcast = async (c) => {
    try {
        const user = c.get('user');
        // Only Admin can broadcast ideally
        if (user?.role !== 'ADMIN') {
            return c.json({ message: 'Unauthorized: Only Admins can broadcast' }, 403);
        }
        const { title, message, type } = await c.req.json();
        if (!title || !message) {
            return c.json({ message: 'Title and Message are required' }, 400);
        }
        const count = await notificationService.createBroadcastNotification(title, message, type);
        return c.json({ message: `Broadcast sent to ${count} users` });
    }
    catch (error) {
        console.error('Broadcast error:', error);
        return c.json({ message: 'Failed to send broadcast' }, 500);
    }
};
export const sendToClients = async (c) => {
    try {
        const user = c.get('user');
        if (user?.role !== 'AGENT') {
            return c.json({ message: 'Unauthorized: Only Agents can message clients' }, 403);
        }
        const { title, message } = await c.req.json();
        if (!title || !message) {
            return c.json({ message: 'Title and Message are required' }, 400);
        }
        const count = await notificationService.createClientNotification(user.userId, title, message);
        return c.json({ message: `Notification sent to ${count} interested clients` });
    }
    catch (error) {
        console.error('Client notification error:', error);
        return c.json({ message: 'Failed to send notification' }, 500);
    }
};
//# sourceMappingURL=notifications.controller.js.map