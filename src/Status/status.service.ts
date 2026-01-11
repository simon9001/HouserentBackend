import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export class StatusService {
    async createStatus(statusData: any) {
        if (!ValidationUtils.isValidUUID(statusData.UserId)) throw new Error('Invalid User ID');

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

        const { data, error } = await supabase
            .from('UserStatus')
            .insert({
                UserId: statusData.UserId,
                MediaUrl: statusData.MediaUrl,
                TextContent: statusData.TextContent,
                BackgroundColor: statusData.BackgroundColor,
                Type: statusData.Type,
                ExpiresAt: expiresAt,
                CreatedAt: new Date().toISOString(),
                IsActive: true
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        return data;
    }

    async getActiveStatuses() {
        // Fetch active statuses that haven't expired

        const { data, error } = await supabase
            .from('UserStatus')
            .select(`
                *,
                Users:UserId (Username, FullName, Role)
            `)
            .eq('IsActive', true)
            .gt('ExpiresAt', new Date().toISOString())
            .order('CreatedAt', { ascending: false });

        if (error) throw new Error(error.message);

        return data.map((item: any) => {
            const res = { ...item };
            if (res.Users) {
                res.Username = res.Users.Username;
                res.FullName = res.Users.FullName;
                res.Role = res.Users.Role;
                delete res.Users;
            }
            return res;
        });
    }

    async deleteStatus(statusId: string, userId: string) {
        if (!ValidationUtils.isValidUUID(statusId) || !ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid ID format');
        }

        const { error } = await supabase
            .from('UserStatus')
            .update({ IsActive: false })
            .eq('StatusId', statusId)
            .eq('UserId', userId);

        if (error) throw new Error(error.message);
    }
}
