import { auditLogsService } from './auditLogs.service.js';
import { ValidationUtils } from '../utils/validators.js';
// Create audit log (typically used internally, not exposed publicly)
export const createAuditLog = async (c) => {
    try {
        const body = await c.req.json();
        // Validate required fields
        if (!body.action || !body.entity) {
            return c.json({
                success: false,
                error: 'Action and entity are required'
            }, 400);
        }
        // Validate user ID if provided
        if (body.userId && !ValidationUtils.isValidUUID(body.userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        // Validate entity ID if provided
        if (body.entityId && !ValidationUtils.isValidUUID(body.entityId)) {
            return c.json({
                success: false,
                error: 'Invalid entity ID format'
            }, 400);
        }
        const logData = {
            userId: body.userId,
            action: body.action,
            entity: body.entity,
            entityId: body.entityId,
            ipAddress: body.ipAddress || c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
            userAgent: body.userAgent || c.req.header('user-agent'),
            metadata: body.metadata
        };
        const log = await auditLogsService.createLog(logData);
        return c.json({
            success: true,
            message: 'Audit log created successfully',
            data: log
        }, 201);
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to create audit log'
        }, 400);
    }
};
// Get log by ID (admin only)
export const getAuditLogById = async (c) => {
    try {
        const logId = c.req.param('logId');
        if (!ValidationUtils.isValidUUID(logId)) {
            return c.json({
                success: false,
                error: 'Invalid log ID format'
            }, 400);
        }
        const log = await auditLogsService.getLogById(logId);
        if (!log) {
            return c.json({
                success: false,
                error: 'Audit log not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: log
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch audit log'
        }, 400);
    }
};
// Get logs by user ID (admin only)
export const getAuditLogsByUserId = async (c) => {
    try {
        const userId = c.req.param('userId');
        const limit = parseInt(c.req.query('limit') || '100');
        const offset = parseInt(c.req.query('offset') || '0');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 500) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 500'
            }, 400);
        }
        if (isNaN(offset) || offset < 0) {
            return c.json({
                success: false,
                error: 'Offset must be 0 or greater'
            }, 400);
        }
        const { logs, total } = await auditLogsService.getLogsByUserId(userId, limit, offset);
        return c.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch audit logs'
        }, 400);
    }
};
// Get logs by entity (admin only)
export const getAuditLogsByEntity = async (c) => {
    try {
        const entity = c.req.param('entity');
        const entityId = c.req.query('entityId');
        const limit = parseInt(c.req.query('limit') || '100');
        const offset = parseInt(c.req.query('offset') || '0');
        if (entityId && !ValidationUtils.isValidUUID(entityId)) {
            return c.json({
                success: false,
                error: 'Invalid entity ID format'
            }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 500) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 500'
            }, 400);
        }
        if (isNaN(offset) || offset < 0) {
            return c.json({
                success: false,
                error: 'Offset must be 0 or greater'
            }, 400);
        }
        const { logs, total } = await auditLogsService.getLogsByEntity(entity, entityId, limit, offset);
        return c.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch audit logs'
        }, 400);
    }
};
// Search logs (admin only)
export const searchAuditLogs = async (c) => {
    try {
        const searchTerm = c.req.query('q');
        const userId = c.req.query('userId');
        const entity = c.req.query('entity');
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined;
        const limit = parseInt(c.req.query('limit') || '100');
        const offset = parseInt(c.req.query('offset') || '0');
        if (!searchTerm || searchTerm.trim().length < 2) {
            return c.json({
                success: false,
                error: 'Search term must be at least 2 characters'
            }, 400);
        }
        if (userId && !ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 500) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 500'
            }, 400);
        }
        if (isNaN(offset) || offset < 0) {
            return c.json({
                success: false,
                error: 'Offset must be 0 or greater'
            }, 400);
        }
        const { logs, total } = await auditLogsService.searchLogs(searchTerm.trim(), userId, entity, startDate, endDate, limit, offset);
        return c.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to search audit logs'
        }, 400);
    }
};
// Get audit statistics (admin only)
export const getAuditStatistics = async (c) => {
    try {
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined;
        const stats = await auditLogsService.getAuditStatistics(startDate, endDate);
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch audit statistics'
        }, 400);
    }
};
// Clean old logs (admin only)
export const cleanOldAuditLogs = async (c) => {
    try {
        const body = await c.req.json();
        const daysToKeep = parseInt(body.daysToKeep || '90');
        if (isNaN(daysToKeep) || daysToKeep < 1 || daysToKeep > 365) {
            return c.json({
                success: false,
                error: 'Days to keep must be between 1 and 365'
            }, 400);
        }
        const deletedCount = await auditLogsService.cleanOldLogs(daysToKeep);
        return c.json({
            success: true,
            message: `Cleaned ${deletedCount} old audit logs`,
            data: { deletedCount }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to clean old audit logs'
        }, 400);
    }
};
//# sourceMappingURL=auditLogs.controller.js.map