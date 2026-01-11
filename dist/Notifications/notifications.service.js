import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class NotificationService {
    async getNotificationsByUser(userId) {
        if (!ValidationUtils.isValidUUID(userId))
            return [];
        const { data, error } = await supabase
            .from('Notifications')
            .select('*')
            .eq('UserId', userId)
            .order('CreatedAt', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async markAsRead(notificationId, userId) {
        if (!ValidationUtils.isValidUUID(notificationId) || !ValidationUtils.isValidUUID(userId))
            return false;
        const { error } = await supabase
            .from('Notifications')
            .update({
            IsRead: true,
            UpdatedAt: new Date().toISOString()
        })
            .eq('NotificationId', notificationId)
            .eq('UserId', userId);
        if (error)
            throw new Error(error.message);
        return true;
    }
    async markAllAsRead(userId) {
        if (!ValidationUtils.isValidUUID(userId))
            return false;
        const { error } = await supabase
            .from('Notifications')
            .update({
            IsRead: true,
            UpdatedAt: new Date().toISOString()
        })
            .eq('UserId', userId)
            .eq('IsRead', false);
        if (error)
            throw new Error(error.message);
        return true;
    }
    async createNotification(input) {
        const { data, error } = await supabase
            .from('Notifications')
            .insert({
            UserId: input.userId,
            Title: input.title,
            Message: input.message,
            Type: input.type,
            ReferenceId: input.referenceId || null,
            IsRead: false,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    // Helper to get unread count
    async getUnreadCount(userId) {
        if (!ValidationUtils.isValidUUID(userId))
            return 0;
        const { count, error } = await supabase
            .from('Notifications')
            .select('*', { count: 'exact', head: true })
            .eq('UserId', userId)
            .eq('IsRead', false);
        if (error)
            throw new Error(error.message);
        return count || 0;
    }
    // Broadcast to all users
    async createBroadcastNotification(title, message, type = 'SYSTEM') {
        // Fetch all active users
        // Note: For very large user bases, this should be an RPC call or a batched job.
        // Assuming manageable size for now.
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('UserId')
            .eq('IsActive', true);
        if (userError)
            throw new Error(userError.message);
        if (!users || users.length === 0)
            return 0;
        const notifications = users.map(user => ({
            UserId: user.UserId,
            Title: title,
            Message: message,
            Type: type,
            IsRead: false,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        }));
        // Insert in batches of 1000 if needed, supabase js client handles batching to some extent but good to be safe.
        // If list is huge we might timeout.
        const { error: insertError } = await supabase
            .from('Notifications')
            .insert(notifications);
        if (insertError)
            throw new Error(insertError.message);
        return notifications.length;
    }
    // Send to clients (users who have visited agent's properties)
    async createClientNotification(agentId, title, message) {
        // Find distinct tenants who have visits with this agent
        const { data: visits, error: visitError } = await supabase
            .from('PropertyVisits')
            .select('TenantId')
            .eq('AgentId', agentId);
        if (visitError)
            throw new Error(visitError.message);
        if (!visits || visits.length === 0)
            return 0;
        // Dedup
        const distinctTenantIds = [...new Set(visits.map(v => v.TenantId))];
        const notifications = distinctTenantIds.map(tenantId => ({
            UserId: tenantId,
            Title: title,
            Message: message,
            Type: 'ALERT',
            IsRead: false,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        }));
        if (notifications.length === 0)
            return 0;
        const { error: insertError } = await supabase
            .from('Notifications')
            .insert(notifications);
        if (insertError)
            throw new Error(insertError.message);
        return notifications.length;
    }
}
export const notificationService = new NotificationService();
//# sourceMappingURL=notifications.service.js.map