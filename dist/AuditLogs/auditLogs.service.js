import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class AuditLogsService {
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
                throw new Error('User not found');
            }
        }
        const { data: newLog, error } = await supabase
            .from('AuditLogs')
            .insert({
            UserId: data.userId || null,
            Action: data.action,
            Entity: data.entity,
            EntityId: data.entityId || null,
            IpAddress: data.ipAddress || null,
            UserAgent: data.userAgent || null,
            Metadata: data.metadata ? JSON.stringify(data.metadata) : null
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return newLog;
    }
    // Get log by ID
    async getLogById(logId) {
        if (!ValidationUtils.isValidUUID(logId))
            throw new Error('Invalid log ID format');
        const { data, error } = await supabase
            .from('AuditLogs')
            .select(`
                *,
                Users:UserId (FullName)
            `)
            .eq('LogId', logId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        const result = { ...data };
        if (data.Users) {
            result.UserName = data.Users.FullName;
            delete result.Users;
        }
        return result;
    }
    // Get logs by user ID
    async getLogsByUserId(userId, limit = 100, offset = 0) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        const { data, count, error } = await supabase
            .from('AuditLogs')
            .select('*', { count: 'exact' })
            .eq('UserId', userId)
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        return {
            logs: data,
            total: count || 0
        };
    }
    // Get logs by entity
    async getLogsByEntity(entity, entityId, limit = 100, offset = 0) {
        let query = supabase
            .from('AuditLogs')
            .select(`
                *,
                Users:UserId (FullName)
            `, { count: 'exact' })
            .eq('Entity', entity);
        if (entityId) {
            query = query.eq('EntityId', entityId);
        }
        const { data, count, error } = await query
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const logs = data?.map((log) => {
            const result = { ...log };
            if (log.Users) {
                result.UserName = log.Users.FullName;
                delete log.Users;
            }
            return result;
        }) || [];
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
            .from('AuditLogs')
            .select(`
                *,
                Users:UserId (FullName)
            `, { count: 'exact' });
        // Supabase OR filter with foreign table search is tricky.
        // We will search on local fields mainly. Searching Users.FullName via OR in Supabase JS is hard if not joined.
        // We can use the text search syntax if enabled, but simple OR is safer: Action, Entity.
        // For User Name, we might depend on joins filters which are stricter (AND). 
        // Let's implement OR for local fields.
        query = query.or(`Action.ilike.%${searchTerm}%,Entity.ilike.%${searchTerm}%`);
        if (userId)
            query = query.eq('UserId', userId);
        if (entity)
            query = query.eq('Entity', entity);
        if (startDate)
            query = query.gte('CreatedAt', startDate.toISOString());
        if (endDate)
            query = query.lte('CreatedAt', endDate.toISOString());
        const { data, count, error } = await query
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const logs = data?.map((log) => {
            const result = { ...log };
            if (log.Users) {
                result.UserName = log.Users.FullName;
                delete log.Users;
            }
            return result;
        }) || [];
        return {
            logs,
            total: count || 0
        };
    }
    // Get audit statistics
    async getAuditStatistics(startDate, endDate) {
        try {
            // 1. Total Logs
            let baseQuery = supabase.from('AuditLogs').select('*', { count: 'exact', head: true });
            if (startDate)
                baseQuery = baseQuery.gte('CreatedAt', startDate.toISOString());
            if (endDate)
                baseQuery = baseQuery.lte('CreatedAt', endDate.toISOString());
            const { count: totalLogs } = await baseQuery;
            // For aggregation, since we can't do GROUP BY easily with JS client without downloading data,
            // we will sample the recent data (e.g. last 1000 logs) to provide "Trends". works for small to medium apps.
            // A better way would be creating Database Views (rpc) for stats.
            let statsQuery = supabase
                .from('AuditLogs')
                .select(`
                    UserId,
                    Action,
                    Entity,
                    CreatedAt,
                    Users:UserId (FullName)
                `)
                .order('CreatedAt', { ascending: false })
                .limit(1000); // Analyze last 1000 logs for stats
            if (startDate)
                statsQuery = statsQuery.gte('CreatedAt', startDate.toISOString());
            if (endDate)
                statsQuery = statsQuery.lte('CreatedAt', endDate.toISOString());
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
                if (log.UserId) {
                    const userName = log.Users?.FullName || 'Unknown';
                    const key = log.UserId;
                    const existing = userMap.get(key) || { userId: key, userName, count: 0 };
                    existing.count++;
                    userMap.set(key, existing);
                }
                // By Entity
                if (log.Entity) {
                    entityMap.set(log.Entity, (entityMap.get(log.Entity) || 0) + 1);
                }
                // By Action
                if (log.Action) {
                    actionMap.set(log.Action, (actionMap.get(log.Action) || 0) + 1);
                }
                // Daily Activity
                const dateKey = new Date(log.CreatedAt).toISOString().split('T')[0];
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
                .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending usually, but charts often want asc or desc. Original was desc.
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
            .from('AuditLogs')
            .delete()
            .lt('CreatedAt', dateThreshold.toISOString())
            .select('LogId'); // Select ID to count rows
        if (error)
            throw new Error(error.message);
        return data?.length || 0;
    }
}
export const auditLogsService = new AuditLogsService();
//# sourceMappingURL=auditLogs.service.js.map