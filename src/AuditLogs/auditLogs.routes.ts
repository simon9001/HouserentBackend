import { Hono } from 'hono';
import * as auditLogsControllers from './auditLogs.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const auditLogsRoutes = new Hono();

// Protected routes (admin only)
auditLogsRoutes.get('/audit-logs/:logId', authenticate, authorize('ADMIN'), auditLogsControllers.getAuditLogById);
auditLogsRoutes.get('/users/:userId/audit-logs', authenticate, authorize('ADMIN'), auditLogsControllers.getAuditLogsByUserId);
auditLogsRoutes.get('/entities/:entity/audit-logs', authenticate, authorize('ADMIN'), auditLogsControllers.getAuditLogsByEntity);
auditLogsRoutes.get('/audit-logs/search', authenticate, authorize('ADMIN'), auditLogsControllers.searchAuditLogs);
auditLogsRoutes.get('/audit-logs/stats', authenticate, authorize('ADMIN'), auditLogsControllers.getAuditStatistics);
auditLogsRoutes.post('/audit-logs/clean', authenticate, authorize('ADMIN'), auditLogsControllers.cleanOldAuditLogs);

// Internal use only (not exposed in public API)
// auditLogsRoutes.post('/audit-logs', auditLogsControllers.createAuditLog);

export default auditLogsRoutes;