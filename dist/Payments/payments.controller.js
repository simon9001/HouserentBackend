import { paymentsService } from './payments.service.js';
import { ValidationUtils } from '../utils/validators.js';
// Create new payment
export const createPayment = async (c) => {
    try {
        const body = await c.req.json();
        // Validate required fields
        if (!body.userId || !body.amount || !body.paymentProvider || !body.providerReference || !body.purpose) {
            return c.json({
                success: false,
                error: 'User ID, amount, payment provider, provider reference, and purpose are required'
            }, 400);
        }
        // Validate UUIDs
        ['userId', 'propertyId'].forEach(field => {
            if (body[field] && !ValidationUtils.isValidUUID(body[field])) {
                throw new Error(`Invalid ${field} format`);
            }
        });
        // Validate amount
        if (body.amount <= 0) {
            return c.json({
                success: false,
                error: 'Amount must be greater than 0'
            }, 400);
        }
        // Validate purpose
        const validPurposes = ['ACCESS', 'BOOST', 'SUBSCRIPTION', 'BOOKING', 'DEPOSIT'];
        if (!validPurposes.includes(body.purpose)) {
            return c.json({
                success: false,
                error: 'Invalid payment purpose'
            }, 400);
        }
        const paymentData = {
            userId: body.userId,
            propertyId: body.propertyId,
            amount: parseFloat(body.amount),
            currency: body.currency || 'KES',
            paymentProvider: body.paymentProvider,
            providerReference: body.providerReference,
            purpose: body.purpose
        };
        const payment = await paymentsService.createPayment(paymentData);
        return c.json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        }, 201);
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to create payment'
        }, 400);
    }
};
// Get payment by ID
export const getPaymentById = async (c) => {
    try {
        const paymentId = c.req.param('paymentId');
        if (!ValidationUtils.isValidUUID(paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }
        const payment = await paymentsService.getPaymentById(paymentId);
        if (!payment) {
            return c.json({
                success: false,
                error: 'Payment not found'
            }, 404);
        }
        return c.json({
            success: true,
            data: payment
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch payment'
        }, 400);
    }
};
// Get payments by user ID
export const getPaymentsByUserId = async (c) => {
    try {
        const userId = c.req.param('userId');
        const status = c.req.query('status');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const payments = await paymentsService.getPaymentsByUserId(userId, status);
        return c.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch payments'
        }, 400);
    }
};
// Get payments by property ID
export const getPaymentsByPropertyId = async (c) => {
    try {
        const propertyId = c.req.param('propertyId');
        if (!ValidationUtils.isValidUUID(propertyId)) {
            return c.json({
                success: false,
                error: 'Invalid property ID format'
            }, 400);
        }
        const payments = await paymentsService.getPaymentsByPropertyId(propertyId);
        return c.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch payments'
        }, 400);
    }
};
// Update payment
export const updatePayment = async (c) => {
    try {
        const paymentId = c.req.param('paymentId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }
        const updateData = {};
        if (body.status !== undefined)
            updateData.status = body.status;
        if (body.providerReference !== undefined)
            updateData.providerReference = body.providerReference;
        if (body.completedAt !== undefined)
            updateData.completedAt = new Date(body.completedAt);
        if (Object.keys(updateData).length === 0) {
            return c.json({
                success: false,
                error: 'No fields to update'
            }, 400);
        }
        const updatedPayment = await paymentsService.updatePayment(paymentId, updateData);
        return c.json({
            success: true,
            message: 'Payment updated successfully',
            data: updatedPayment
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to update payment'
        }, 400);
    }
};
// Complete payment
export const completePayment = async (c) => {
    try {
        const paymentId = c.req.param('paymentId');
        if (!ValidationUtils.isValidUUID(paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }
        const payment = await paymentsService.completePayment(paymentId);
        return c.json({
            success: true,
            message: 'Payment completed successfully',
            data: payment
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to complete payment'
        }, 400);
    }
};
// Fail payment
export const failPayment = async (c) => {
    try {
        const paymentId = c.req.param('paymentId');
        const body = await c.req.json();
        if (!ValidationUtils.isValidUUID(paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }
        const payment = await paymentsService.failPayment(paymentId, body.reason);
        return c.json({
            success: true,
            message: 'Payment marked as failed',
            data: payment
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to mark payment as failed'
        }, 400);
    }
};
// Refund payment
export const refundPayment = async (c) => {
    try {
        const paymentId = c.req.param('paymentId');
        if (!ValidationUtils.isValidUUID(paymentId)) {
            return c.json({
                success: false,
                error: 'Invalid payment ID format'
            }, 400);
        }
        const payment = await paymentsService.refundPayment(paymentId);
        return c.json({
            success: true,
            message: 'Payment refunded successfully',
            data: payment
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to refund payment'
        }, 400);
    }
};
// Get payment statistics
export const getPaymentStatistics = async (c) => {
    try {
        const userId = c.req.query('userId');
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined;
        if (userId && !ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const stats = await paymentsService.getPaymentStatistics(userId, startDate, endDate);
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch payment statistics'
        }, 400);
    }
};
// Get recent payments
export const getRecentPayments = async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '10');
        if (isNaN(limit) || limit < 1 || limit > 50) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 50'
            }, 400);
        }
        const payments = await paymentsService.getRecentPayments(limit);
        return c.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch recent payments'
        }, 400);
    }
};
// Search payments
export const searchPayments = async (c) => {
    try {
        const searchTerm = c.req.query('q');
        const userId = c.req.query('userId');
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
        const payments = await paymentsService.searchPayments(searchTerm.trim(), userId);
        return c.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to search payments'
        }, 400);
    }
};
//# sourceMappingURL=payments.controller.js.map