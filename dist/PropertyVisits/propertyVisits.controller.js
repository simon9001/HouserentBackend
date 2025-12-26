import { propertyVisitsService } from './propertyVisits.service.js';
import { ValidationUtils } from '../utils/validators.js';
// Create new visit
export const createVisit = async (c) => {
    try {
        const body = await c.req.json();
        // Validate required fields
        if (!body.propertyId || !body.tenantId || !body.agentId || !body.visitDate) {
            return c.json({
                success: false,
                error: 'Property ID, tenant ID, agent ID, and visit date are required'
            }, 400);
        }
        // Validate UUIDs
        ['propertyId', 'tenantId', 'agentId'].forEach(field => {
            if (!ValidationUtils.isValidUUID(body[field])) {
                throw new Error(`Invalid ${field} format`);
            }
        });
        // Validate visit date is in the future
        const visitDate = new Date(body.visitDate);
        if (visitDate <= new Date()) {
            return c.json({
                success: false,
                error: 'Visit date must be in the future'
            }, 400);
        }
        const visitData = {
            propertyId: body.propertyId,
            tenantId: body.tenantId,
            agentId: body.agentId,
            visitDate,
            visitPurpose: body.visitPurpose,
            tenantNotes: body.tenantNotes
        };
        const visit = await propertyVisitsService.createVisit(visitData);
        return c.json({
            success: true,
            message: 'Visit scheduled successfully',
            data: visit
        }, 201);
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to schedule visit'
        }, 400);
    }
};
// Get visit by ID
export const getVisitById = async (c) => {
    try {
        const visitId = c.req.param('visitId');
        if (!ValidationUtils.isValidUUID(visitId)) {
            return c.json({
                success: false,
                error: 'Invalid visit ID format'
            }, 400);
        }
        const visit = await propertyVisitsService.getVisitById(visitId);
        if (!visit) {
            return c.json({
                success: false,
                error: 'Visit not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: visit
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch visit'
        }, 400);
    }
};
// Get visits by property ID
export const getVisitsByPropertyId = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        const status = c.req.query('status');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const visits = await propertyVisitsService.getVisitsByPropertyId(propertyId, status);
        return c.json({
            success: true,
            data: visits
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch visits'
        }, 400);
    }
};
// Get visits by user ID
export const getVisitsByUserId = async (c) => {
    try {
        const userId = c.req.param('userId');
        const role = c.req.query('role') || 'tenant';
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (!['tenant', 'agent'].includes(role)) {
            return c.json({
                success: false,
                error: 'Role must be either "tenant" or "agent"'
            }, 400);
        }
        const visits = await propertyVisitsService.getVisitsByUserId(userId, role);
        return c.json({
            success: true,
            data: visits
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch visits'
        }, 400);
    }
};
// Update visit
export const updateVisit = async (c) => {
    try {
        const visitId = c.req.param('visitId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(visitId)) {
            return c.json({
                success: false,
                error: 'Invalid visit ID format'
            }, 400);
        }
        const updateData = {};
        if (body.visitPurpose !== undefined)
            updateData.visitPurpose = body.visitPurpose;
        if (body.tenantNotes !== undefined)
            updateData.tenantNotes = body.tenantNotes;
        if (body.agentNotes !== undefined)
            updateData.agentNotes = body.agentNotes;
        if (body.status !== undefined)
            updateData.status = body.status;
        if (body.checkInTime !== undefined)
            updateData.checkInTime = new Date(body.checkInTime);
        if (body.checkOutTime !== undefined)
            updateData.checkOutTime = new Date(body.checkOutTime);
        if (Object.keys(updateData).length === 0) {
            return c.json({
                success: false,
                error: 'No fields to update'
            }, 400);
        }
        const updatedVisit = await propertyVisitsService.updateVisit(visitId, updateData);
        return c.json({
            success: true,
            message: 'Visit updated successfully',
            data: updatedVisit
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to update visit'
        }, 400);
    }
};
// Cancel visit
export const cancelVisit = async (c) => {
    try {
        const visitId = c.req.param('visitId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(visitId)) {
            return c.json({
                success: false,
                error: 'Invalid visit ID format'
            }, 400);
        }
        const cancelled = await propertyVisitsService.cancelVisit(visitId, body.reason);
        if (!cancelled) {
            return c.json({
                success: false,
                error: 'Visit not found or cannot be cancelled'
            }, 404);
        }
        return c.json({
            success: true,
            message: 'Visit cancelled successfully'
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to cancel visit'
        }, 400);
    }
};
// Check in
export const checkIn = async (c) => {
    try {
        const visitId = c.req.param('visitId');
        if (!ValidationUtils.isValidUUID(visitId)) {
            return c.json({
                success: false,
                error: 'Invalid visit ID format'
            }, 400);
        }
        const checkedIn = await propertyVisitsService.checkIn(visitId);
        if (!checkedIn) {
            return c.json({
                success: false,
                error: 'Visit not found or cannot check in'
            }, 400);
        }
        return c.json({
            success: true,
            message: 'Checked in successfully'
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to check in'
        }, 400);
    }
};
// Check out
export const checkOut = async (c) => {
    try {
        const visitId = c.req.param('visitId');
        if (!ValidationUtils.isValidUUID(visitId)) {
            return c.json({
                success: false,
                error: 'Invalid visit ID format'
            }, 400);
        }
        const checkedOut = await propertyVisitsService.checkOut(visitId);
        if (!checkedOut) {
            return c.json({
                success: false,
                error: 'Visit not found or cannot check out'
            }, 400);
        }
        return c.json({
            success: true,
            message: 'Checked out successfully'
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to check out'
        }, 400);
    }
};
// Get upcoming visits
export const getUpcomingVisits = async (c) => {
    try {
        const days = parseInt(c.req.query('days') || '7');
        if (isNaN(days) || days < 1 || days > 30) {
            return c.json({
                success: false,
                error: 'Days must be between 1 and 30'
            }, 400);
        }
        const visits = await propertyVisitsService.getUpcomingVisits(days);
        return c.json({
            success: true,
            data: visits
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch upcoming visits'
        }, 400);
    }
};
// Get visit statistics
export const getVisitStatistics = async (c) => {
    try {
        const agentId = c.req.query('agentId');
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined;
        if (agentId && !ValidationUtils.isValidUUID(agentId)) {
            return c.json({
                success: false,
                error: 'Invalid agent ID format'
            }, 400);
        }
        const stats = await propertyVisitsService.getVisitStatistics(agentId, startDate, endDate);
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch visit statistics'
        }, 400);
    }
};
//# sourceMappingURL=propertyVisits.controller.js.map