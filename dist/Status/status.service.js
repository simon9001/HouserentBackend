import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class StatusService {
    async createStatus(statusData) {
        if (!ValidationUtils.isValidUUID(statusData.UserId))
            throw new Error('Invalid User ID');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
        const { data, error } = await supabase
            .from('user_status')
            .insert({
            user_id: statusData.UserId,
            media_url: statusData.MediaUrl,
            text_content: statusData.TextContent,
            background_color: statusData.BackgroundColor,
            type: statusData.Type,
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
            is_active: true
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        // Map back if needed, but return raw is usually fine for create
        return data;
    }
    async getActiveStatuses() {
        // Fetch active statuses that haven't expired
        const { data, error } = await supabase
            .from('user_status')
            .select(`
                *,
                Users:user_id (Username, FullName, Role)
            `)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((item) => {
            const res = {
                StatusId: item.status_id,
                UserId: item.user_id,
                MediaUrl: item.media_url,
                TextContent: item.text_content,
                BackgroundColor: item.background_color,
                Type: item.type,
                ExpiresAt: item.expires_at,
                CreatedAt: item.created_at,
                IsActive: item.is_active
            };
            if (item.Users) {
                res.Username = item.Users.Username;
                res.FullName = item.Users.FullName;
                res.Role = item.Users.Role;
            }
            return res;
        });
    }
    async deleteStatus(statusId, userId) {
        if (!ValidationUtils.isValidUUID(statusId) || !ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid ID format');
        }
        const { error } = await supabase
            .from('user_status')
            .update({ is_active: false })
            .eq('status_id', statusId)
            .eq('user_id', userId);
        if (error)
            throw new Error(error.message);
    }
}
export const statusService = new StatusService();
//# sourceMappingURL=status.service.js.map