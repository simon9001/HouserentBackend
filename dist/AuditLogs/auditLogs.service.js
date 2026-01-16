import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class AuditLogsService {
    mapDBToAuditLog(data) {
        if (!data)
            return data;
        return {
            LogId: data.log_id,
            UserId: data.user_id,
            Action: data.action,
            Entity: data.entity,
            EntityId: data.entity_id,
            IpAddress: data.ip_address,
            UserAgent: data.user_agent,
            Metadata: data.metadata,
            CreatedAt: data.created_at,
            UserName: data.Users?.FullName
        };
    }
    // Create audit log
    async createLog(data) {
        // Validate user exists if provided
        if (data.userId) {
            const { data: user, error } = await supabase
                .from('Users')
                .select('UserId')
                .eq('UserId', data.userId)
                .single();
            if (error || !user) {
                console.warn('User not found for audit log, logging without user');
            }
        }
        const { data: newLog, error } = await supabase
            .from('audit_logs')
            .insert({
            user_id: data.userId || null,
            action: data.action,
            entity: data.entity,
            entity_id: data.entityId || null,
            ip_address: data.ipAddress || null,
            user_agent: data.userAgent || null,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapDBToAuditLog(newLog);
    }
    // Get log by ID
    async getLogById(logId) {
        if (!ValidationUtils.isValidUUID(logId))
            throw new Error('Invalid log ID format');
        const { data, error } = await supabase
            .from('audit_logs')
            .select(`
                *,
                Users:user_id (FullName)
            `)
            .eq('log_id', logId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        return this.mapDBToAuditLog(data);
    }
    // Get logs by user ID
    async getLogsByUserId(userId, limit = 100, offset = 0) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        const { data, count, error } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        return {
            logs: (data || []).map((l) => this.mapDBToAuditLog(l)),
            total: count || 0
        };
    }
    // Get logs by entity
    async getLogsByEntity(entity, entityId, limit = 100, offset = 0) {
        let query = supabase
            .from('audit_logs')
            .select(`
                *,
                Users:user_id (FullName)
            `, { count: 'exact' })
            .eq('entity', entity);
        if (entityId) {
            query = query.eq('entity_id', entityId);
        }
        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const logs = (data || []).map((l) => this.mapDBToAuditLog(l));
        return {
            logs,
            total: count || 0
        };
    }
    // Search logs
    async searchLogs(searchTerm, userId, entity, startDate, endDate, limit = 100, offset = 0) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }
        let query = supabase
            .from('audit_logs')
            .select(`
                *,
                Users:user_id (FullName)
            `, { count: 'exact' });
        query = query.or(`action.ilike.%${searchTerm}%,entity.ilike.%${searchTerm}%`);
        if (userId)
            query = query.eq('user_id', userId);
        if (entity)
            query = query.eq('entity', entity);
        if (startDate)
            query = query.gte('created_at', startDate.toISOString());
        if (endDate)
            query = query.lte('created_at', endDate.toISOString());
        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const logs = (data || []).map((l) => this.mapDBToAuditLog(l));
        return {
            logs,
            total: count || 0
        };
    }
    // Get audit statistics
    async getAuditStatistics(startDate, endDate) {
        try {
            // 1. Total Logs
            let baseQuery = supabase.from('audit_logs').select('*', { count: 'exact', head: true });
            if (startDate)
                baseQuery = baseQuery.gte('created_at', startDate.toISOString());
            if (endDate)
                baseQuery = baseQuery.lte('created_at', endDate.toISOString());
            const { count: totalLogs } = await baseQuery;
            let statsQuery = supabase
                .from('audit_logs')
                .select(`
                    user_id,
                    action,
                    entity,
                    created_at,
                    Users:user_id (FullName)
                `)
                .order('created_at', { ascending: false })
                .limit(1000); // Analyze last 1000 logs for stats
            if (startDate)
                statsQuery = statsQuery.gte('created_at', startDate.toISOString());
            if (endDate)
                statsQuery = statsQuery.lte('created_at', endDate.toISOString());
            const { data: logs } = await statsQuery;
            if (!logs) {
                return { totalLogs: 0, logsByUser: [], logsByEntity: [], logsByAction: [], dailyActivity: [] };
            }
            // Client-side aggregation
            const userMap = new Map();
            const entityMap = new Map();
            const actionMap = new Map();
            const dateMap = new Map();
            logs.forEach((log) => {
                // By User
                if (log.user_id) {
                    const userName = log.Users?.FullName || 'Unknown';
                    const key = log.user_id;
                    const existing = userMap.get(key) || { userId: key, userName, count: 0 };
                    existing.count++;
                    userMap.set(key, existing);
                }
                // By Entity
                if (log.entity) {
                    entityMap.set(log.entity, (entityMap.get(log.entity) || 0) + 1);
                }
                // By Action
                if (log.action) {
                    actionMap.set(log.action, (actionMap.get(log.action) || 0) + 1);
                }
                // Daily Activity
                const dateKey = new Date(log.created_at).toISOString().split('T')[0];
                dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
            });
            // Format results
            const logsByUser = Array.from(userMap.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const logsByEntity = Array.from(entityMap.entries())
                .map(([entity, count]) => ({ entity, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const logsByAction = Array.from(actionMap.entries())
                .map(([action, count]) => ({ action, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            const dailyActivity = Array.from(dateMap.entries())
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => b.date.localeCompare(a.date));
            return {
                totalLogs: totalLogs || 0,
                logsByUser,
                logsByEntity,
                logsByAction,
                dailyActivity
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    // Clean old logs (admin only)
    async cleanOldLogs(daysToKeep = 90) {
        if (daysToKeep < 1 || daysToKeep > 365) {
            throw new Error('Days to keep must be between 1 and 365');
        }
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysToKeep);
        const { data, error } = await supabase
            .from('audit_logs')
            .delete()
            .lt('created_at', dateThreshold.toISOString())
            .select('log_id'); // Select ID to count rows
        if (error)
            throw new Error(error.message);
        return data?.length || 0;
    }
}
export const auditLogsService = new AuditLogsService();
//# sourceMappingURL=auditLogs.service.js.map