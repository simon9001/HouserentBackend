import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface Notification {
    NotificationId: string;
    UserId: string;
    Title: string;
    Message: string;
    Type: 'BOOKING' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'ALERT';
    ReferenceId?: string;
    IsRead: boolean;
    CreatedAt: Date;
    UpdatedAt: Date;
}

export interface CreateNotificationInput {
    userId: string;
    title: string;
    message: string;
    type: 'BOOKING' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'ALERT';
    referenceId?: string;
}

export class NotificationService {

    async getNotificationsByUser(userId: string): Promise<Notification[]> {
        if (!ValidationUtils.isValidUUID(userId)) return [];

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
                throw new Error(error.message);
            }

            // Map snake_case to camelCase for interface compatibility
            return (data || []).map(item => this.mapToCamelCase(item)) as Notification[];
        } catch (error: any) {
            console.error('Error in getNotificationsByUser:', error);
            throw error;
        }
    }

    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(notificationId) || !ValidationUtils.isValidUUID(userId)) return false;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    updated_at: new Date().toISOString()
                })
                .eq('notification_id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error marking notification as read:', error);
                throw new Error(error.message);
            }

            return true;
        } catch (error: any) {
            console.error('Error in markAsRead:', error);
            throw error;
        }
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId)) return false;

        try {
            const { error } = await supabase
                .from('notifications')
                .update({
                    is_read: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error marking all notifications as read:', error);
                throw new Error(error.message);
            }

            return true;
        } catch (error: any) {
            console.error('Error in markAllAsRead:', error);
            throw error;
        }
    }

    async createNotification(input: CreateNotificationInput): Promise<Notification> {
        try {
            const notificationData = {
                user_id: input.userId,
                title: input.title,
                message: input.message,
                type: input.type,
                reference_id: input.referenceId || null,
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('Creating notification:', notificationData);

            const { data, error } = await supabase
                .from('notifications')
                .insert(notificationData)
                .select()
                .single();

            if (error) {
                console.error('Error creating notification:', error);
                throw new Error(error.message);
            }

            console.log('Notification created:', data);

            return this.mapToCamelCase(data) as Notification;
        } catch (error: any) {
            console.error('Error in createNotification:', error);
            throw error;
        }
    }

    // Helper to get unread count
    async getUnreadCount(userId: string): Promise<number> {
        if (!ValidationUtils.isValidUUID(userId)) return 0;

        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error getting unread count:', error);
                throw new Error(error.message);
            }

            return count || 0;
        } catch (error: any) {
            console.error('Error in getUnreadCount:', error);
            throw error;
        }
    }

    // Broadcast to all users
    async createBroadcastNotification(title: string, message: string, type: 'SYSTEM' | 'ALERT' = 'SYSTEM'): Promise<number> {
        try {
            // Fetch all active users from "Users" table (PascalCase)
            const { data: users, error: userError } = await supabase
                .from('"Users"')  // ✅ Double quotes for PascalCase table
                .select('"UserId"')  // ✅ PascalCase column name
                .eq('"IsActive"', true);  // ✅ PascalCase column name

            if (userError) {
                console.error('Error fetching users for broadcast:', userError);
                throw new Error(userError.message);
            }

            if (!users || users.length === 0) return 0;

            console.log(`Creating broadcast notification for ${users.length} users`);

            const notifications = users.map(user => ({
                user_id: user.UserId,  // ✅ snake_case column name in notifications table
                title: title,
                message: message,
                type: type,
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            // Insert in batches to avoid timeout for large user bases
            const batchSize = 100;
            let totalInserted = 0;

            for (let i = 0; i < notifications.length; i += batchSize) {
                const batch = notifications.slice(i, i + batchSize);
                
                const { error: insertError } = await supabase
                    .from('notifications')
                    .insert(batch);

                if (insertError) {
                    console.error(`Error inserting batch ${i/batchSize + 1}:`, insertError);
                    throw new Error(insertError.message);
                }

                totalInserted += batch.length;
                console.log(`Inserted batch ${i/batchSize + 1}: ${batch.length} notifications`);
            }

            console.log(`Total notifications created: ${totalInserted}`);
            return totalInserted;
        } catch (error: any) {
            console.error('Error in createBroadcastNotification:', error);
            throw error;
        }
    }

    // Send to clients (users who have visited agent's properties)
    async createClientNotification(agentId: string, title: string, message: string): Promise<number> {
        try {
            // Find distinct tenants who have visits with this agent
            const { data: visits, error: visitError } = await supabase
                .from('property_visits')
                .select('tenant_id')
                .eq('agent_id', agentId);

            if (visitError) {
                console.error('Error fetching visits:', visitError);
                throw new Error(visitError.message);
            }

            if (!visits || visits.length === 0) return 0;

            // Dedup
            const distinctTenantIds = [...new Set(visits.map(v => v.tenant_id))];
            
            console.log(`Found ${distinctTenantIds.length} distinct clients for agent ${agentId}`);

            const notifications = distinctTenantIds.map(tenantId => ({
                user_id: tenantId,
                title: title,
                message: message,
                type: 'ALERT',
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            if (notifications.length === 0) return 0;

            const { error: insertError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (insertError) {
                console.error('Error creating client notifications:', insertError);
                throw new Error(insertError.message);
            }

            console.log(`Created ${notifications.length} client notifications`);
            return notifications.length;
        } catch (error: any) {
            console.error('Error in createClientNotification:', error);
            throw error;
        }
    }

    // Delete notification
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(notificationId) || !ValidationUtils.isValidUUID(userId)) return false;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('notification_id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting notification:', error);
                throw new Error(error.message);
            }

            return true;
        } catch (error: any) {
            console.error('Error in deleteNotification:', error);
            throw error;
        }
    }

    // Clear all notifications for user
    async clearAllNotifications(userId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(userId)) return false;

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error clearing notifications:', error);
                throw new Error(error.message);
            }

            return true;
        } catch (error: any) {
            console.error('Error in clearAllNotifications:', error);
            throw error;
        }
    }

    // Helper method to map snake_case to camelCase
    private mapToCamelCase(data: any): any {
        if (!data) return data;
        
        const result: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // Convert snake_case to camelCase
                const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                result[camelKey] = data[key];
            }
        }
        return result;
    }

}

export const notificationService = new NotificationService();