import { notificationService } from './notifications.service.js';
// Helper function to get user from context (handles both methods)
const getUserFromContext = (c) => {
    // Try both methods: c.get('user') and c.user
    const userFromGet = c.get('user');
    const userFromProperty = c.user;
    console.log('👤 getUserFromContext:', {
        fromGet: userFromGet ? 'Found' : 'Not found',
        fromProperty: userFromProperty ? 'Found' : 'Not found',
        hasGetMethod: typeof c.get === 'function',
        hasUserProperty: 'user' in c
    });
    return userFromGet || userFromProperty;
};
// Error handling utility
const handleError = (error, defaultMessage) => {
    if (error instanceof Error) {
        console.error('Error:', error.message);
        return error.message;
    }
    else if (typeof error === 'string') {
        console.error('Error:', error);
        return error;
    }
    else {
        console.error('Unknown error:', error);
        return defaultMessage;
    }
};
// Validate notification type
const isValidNotificationType = (type) => {
    const validTypes = ['BOOKING', 'PAYMENT', 'REVIEW', 'SYSTEM', 'ALERT'];
    return validTypes.includes(type);
};
export const getNotifications = async (c) => {
    try {
        console.log('🔔 getNotifications - Request received');
        const user = getUserFromContext(c);
        console.log('🔔 Retrieved user:', user);
        const userId = user?.userId;
        if (!userId) {
            console.log('🔔 No userId found in user object');
            return c.json({
                success: false,
                message: 'Unauthorized: No user ID found'
            }, 401);
        }
        console.log('🔔 Fetching notifications for userId:', userId);
        const notifications = await notificationService.getNotificationsByUser(userId);
        console.log('🔔 Found notifications:', notifications.length);
        return c.json({
            success: true,
            data: notifications,
            message: `Found ${notifications.length} notifications`
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to fetch notifications');
        console.error('🔔 Get notifications error:', error);
        return c.json({
            success: false,
            message: 'Failed to fetch notifications',
            error: errorMessage
        }, 500);
    }
};
export const markAsRead = async (c) => {
    try {
        console.log('📝 markAsRead - Request received');
        const user = getUserFromContext(c);
        const userId = user?.userId;
        const id = c.req.param('id');
        console.log('📝 Parameters:', { id, userId });
        if (!userId) {
            console.log('📝 No userId found');
            return c.json({
                success: false,
                message: 'Unauthorized'
            }, 401);
        }
        if (!id) {
            return c.json({
                success: false,
                message: 'Notification ID is required'
            }, 400);
        }
        const success = await notificationService.markAsRead(id, userId);
        if (!success) {
            return c.json({
                success: false,
                message: 'Notification not found or already read'
            }, 404);
        }
        return c.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to update notification');
        console.error('📝 Mark as read error:', error);
        return c.json({
            success: false,
            message: 'Failed to update notification',
            error: errorMessage
        }, 500);
    }
};
export const markAllAsRead = async (c) => {
    try {
        console.log('📝 markAllAsRead - Request received');
        const user = getUserFromContext(c);
        const userId = user?.userId;
        console.log('📝 UserId:', userId);
        if (!userId) {
            return c.json({
                success: false,
                message: 'Unauthorized'
            }, 401);
        }
        const success = await notificationService.markAllAsRead(userId);
        return c.json({
            success: true,
            message: success
                ? 'All notifications marked as read'
                : 'No unread notifications found'
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to update notifications');
        console.error('📝 Mark all as read error:', error);
        return c.json({
            success: false,
            message: 'Failed to update notifications',
            error: errorMessage
        }, 500);
    }
};
export const getUnreadCount = async (c) => {
    try {
        console.log('🔢 getUnreadCount - Request received');
        const user = getUserFromContext(c);
        const userId = user?.userId;
        console.log('🔢 UserId:', userId);
        if (!userId) {
            return c.json({
                success: false,
                message: 'Unauthorized'
            }, 401);
        }
        const count = await notificationService.getUnreadCount(userId);
        console.log('🔢 Unread count:', count);
        return c.json({
            success: true,
            data: { count },
            message: `You have ${count} unread notification${count !== 1 ? 's' : ''}`
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to fetch unread count');
        console.error('🔢 Get unread count error:', error);
        return c.json({
            success: false,
            message: 'Failed to fetch unread count',
            error: errorMessage
        }, 500);
    }
};
export const sendBroadcast = async (c) => {
    try {
        console.log('📢 sendBroadcast - Request received');
        const user = getUserFromContext(c);
        console.log('📢 User role:', user?.role);
        // Only Admin can broadcast
        if (user?.role !== 'ADMIN') {
            return c.json({
                success: false,
                message: 'Unauthorized: Only Admins can broadcast'
            }, 403);
        }
        const body = await c.req.json();
        const { title, message, type = 'SYSTEM' } = body;
        console.log('📢 Broadcast data:', { title, message, type });
        if (!title || !message) {
            return c.json({
                success: false,
                message: 'Title and Message are required'
            }, 400);
        }
        if (!isValidNotificationType(type)) {
            return c.json({
                success: false,
                message: 'Invalid notification type. Must be one of: BOOKING, PAYMENT, REVIEW, SYSTEM, ALERT'
            }, 400);
        }
        const broadcastType = type === 'SYSTEM' || type === 'ALERT' ? type : 'SYSTEM';
        const count = await notificationService.createBroadcastNotification(title, message, broadcastType);
        console.log('📢 Broadcast sent to:', count, 'users');
        return c.json({
            success: true,
            data: { count },
            message: `Broadcast sent to ${count} users`
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to send broadcast');
        console.error('📢 Broadcast error:', error);
        return c.json({
            success: false,
            message: 'Failed to send broadcast',
            error: errorMessage
        }, 500);
    }
};
export const sendToClients = async (c) => {
    try {
        console.log('👥 sendToClients - Request received');
        const user = getUserFromContext(c);
        console.log('👥 User role:', user?.role);
        if (user?.role !== 'AGENT') {
            return c.json({
                success: false,
                message: 'Unauthorized: Only Agents can message clients'
            }, 403);
        }
        const { title, message } = await c.req.json();
        console.log('👥 Client notification data:', { title, message });
        if (!title || !message) {
            return c.json({
                success: false,
                message: 'Title and Message are required'
            }, 400);
        }
        const count = await notificationService.createClientNotification(user.userId, title, message);
        console.log('👥 Sent to:', count, 'clients');
        return c.json({
            success: true,
            data: { count },
            message: `Notification sent to ${count} interested clients`
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to send notification');
        console.error('👥 Client notification error:', error);
        return c.json({
            success: false,
            message: 'Failed to send notification',
            error: errorMessage
        }, 500);
    }
};
// Create a new notification (for internal use or admin)
export const createNotification = async (c) => {
    try {
        console.log('➕ createNotification - Request received');
        const user = getUserFromContext(c);
        console.log('➕ Request user role:', user?.role);
        // Only allow admin or the user themselves to create notifications
        const body = await c.req.json();
        if (!body.userId || !body.title || !body.message || !body.type) {
            return c.json({
                success: false,
                message: 'Missing required fields: userId, title, message, type'
            }, 400);
        }
        if (!isValidNotificationType(body.type)) {
            return c.json({
                success: false,
                message: 'Invalid notification type'
            }, 400);
        }
        // Check permissions: admin can create for anyone, users can only create for themselves
        if (user?.role !== 'ADMIN' && user?.userId !== body.userId) {
            return c.json({
                success: false,
                message: 'Unauthorized: You can only create notifications for yourself'
            }, 403);
        }
        const notification = await notificationService.createNotification(body);
        console.log('➕ Created notification:', notification.NotificationId);
        return c.json({
            success: true,
            data: notification,
            message: 'Notification created successfully'
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to create notification');
        console.error('➕ Create notification error:', error);
        return c.json({
            success: false,
            message: 'Failed to create notification',
            error: errorMessage
        }, 500);
    }
};
// Get notification by ID
export const getNotificationById = async (c) => {
    try {
        console.log('🔍 getNotificationById - Request received');
        const user = getUserFromContext(c);
        const userId = user?.userId;
        const id = c.req.param('id');
        if (!userId) {
            return c.json({
                success: false,
                message: 'Unauthorized'
            }, 401);
        }
        // Get all notifications and filter by ID
        const notifications = await notificationService.getNotificationsByUser(userId);
        const notification = notifications.find(n => n.NotificationId === id);
        if (!notification) {
            return c.json({
                success: false,
                message: 'Notification not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: notification,
            message: 'Notification retrieved successfully'
        });
    }
    catch (error) {
        const errorMessage = handleError(error, 'Failed to fetch notification');
        console.error('🔍 Get notification by ID error:', error);
        return c.json({
            success: false,
            message: 'Failed to fetch notification',
            error: errorMessage
        }, 500);
    }
};
// Add a debug endpoint
export const debugContext = async (c) => {
    console.log('🔧 Debug context request');
    const user = getUserFromContext(c);
    const allHeaders = c.req.header();
    return c.json({
        success: true,
        data: {
            user: user ? {
                userId: user.userId,
                username: user.username,
                role: user.role,
                email: user.email
            } : null,
            headers: {
                authorization: allHeaders.authorization ? 'Present (hidden for security)' : 'Missing',
                contentType: allHeaders['content-type']
            },
            contextInfo: {
                hasGetMethod: typeof c.get === 'function',
                hasSetMethod: typeof c.set === 'function',
                hasUserProperty: 'user' in c,
                contextType: c.constructor.name
            }
        },
        message: 'Context debug information'
    });
};
//# sourceMappingURL=notifications.controller.js.map