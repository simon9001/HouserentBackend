import { Context } from 'hono';
import { agentVerificationService, CreateVerificationInput, UpdateVerificationInput } from './agentService.js';
import { ValidationUtils } from '../utils/validators.js';

// Create new agent verification
export const createVerification = async (c: Context) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        const requiredFields = ['userId', 'nationalId', 'selfieUrl', 'idFrontUrl'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }

        // Validate UUID
        if (!ValidationUtils.isValidUUID(body.userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        const verificationData: CreateVerificationInput = {
            userId: body.userId,
            nationalId: body.nationalId,
            selfieUrl: body.selfieUrl,
            idFrontUrl: body.idFrontUrl,
            idBackUrl: body.idBackUrl,
            propertyProofUrl: body.propertyProofUrl
        };

        const verification = await agentVerificationService.createVerification(verificationData);

        return c.json({
            success: true,
            message: 'Agent verification submitted successfully',
            data: verification
        }, 201);

    } catch (error: any) {
        console.error('Error creating agent verification:', error.message);
        
        if (error.message.includes('not found') || 
            error.message.includes('already exists') ||
            error.message.includes('not an agent')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Failed to submit verification'
        }, 500);
    }
};

// Get verification by ID
export const getVerificationById = async (c: Context) => {
    try {
        const verificationId = c.req.param('verificationId');

        if (!ValidationUtils.isValidUUID(verificationId)) {
            return c.json({
                success: false,
                error: 'Invalid verification ID format'
            }, 400);
        }

        const verification = await agentVerificationService.getVerificationById(verificationId);

        if (!verification) {
            return c.json({
                success: false,
                error: 'Verification not found'
            }, 404);
        }

        return c.json({
            success: true,
            data: verification
        });

    } catch (error: any) {
        console.error('Error fetching verification:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch verification'
        }, 500);
    }
};

// Get verification by user ID
export const getVerificationByUserId = async (c: Context) => {
    try {
        const userId = c.req.param('userId');

        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        const verification = await agentVerificationService.getVerificationByUserId(userId);

        if (!verification) {
            return c.json({
                success: false,
                error: 'No verification found for this user'
            }, 404);
        }

        return c.json({
            success: true,
            data: verification
        });

    } catch (error: any) {
        console.error('Error fetching user verification:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch verification'
        }, 500);
    }
};

// Get all verifications
export const getAllVerifications = async (c: Context) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const status = c.req.query('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined;

        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }

        if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return c.json({
                success: false,
                error: 'Invalid status. Must be one of: PENDING, APPROVED, REJECTED'
            }, 400);
        }

        const result = await agentVerificationService.getAllVerifications(page, limit, status);

        return c.json({
            success: true,
            data: {
                verifications: result.verifications,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching verifications:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch verifications'
        }, 500);
    }
};

// Update verification (admin review)
export const updateVerification = async (c: Context) => {
    try {
        const verificationId = c.req.param('verificationId');
        const body = await c.req.json();

        if (!ValidationUtils.isValidUUID(verificationId)) {
            return c.json({
                success: false,
                error: 'Invalid verification ID format'
            }, 400);
        }

        // Validate required fields for admin review
        if (!body.reviewerId) {
            return c.json({
                success: false,
                error: 'Reviewer ID is required'
            }, 400);
        }

        if (!ValidationUtils.isValidUUID(body.reviewerId)) {
            return c.json({
                success: false,
                error: 'Invalid reviewer ID format'
            }, 400);
        }

        const updateData: UpdateVerificationInput = {
            reviewStatus: body.reviewStatus,
            reviewNotes: body.reviewNotes,
            reviewedBy: body.reviewedBy || body.reviewerId
        };

        const updatedVerification = await agentVerificationService.updateVerification(
            verificationId, 
            updateData, 
            body.reviewerId
        );

        if (!updatedVerification) {
            return c.json({
                success: false,
                error: 'Failed to update verification'
            }, 500);
        }

        return c.json({
            success: true,
            message: 'Verification updated successfully',
            data: updatedVerification
        });

    } catch (error: any) {
        console.error('Error updating verification:', error.message);
        
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Failed to update verification'
        }, 500);
    }
};

// Get verification statistics
export const getVerificationStatistics = async (c: Context) => {
    try {
        const stats = await agentVerificationService.getVerificationStatistics();

        return c.json({
            success: true,
            data: stats
        });

    } catch (error: any) {
        console.error('Error fetching verification statistics:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch statistics'
        }, 500);
    }
};

// Delete verification
export const deleteVerification = async (c: Context) => {
    try {
        const verificationId = c.req.param('verificationId');

        if (!ValidationUtils.isValidUUID(verificationId)) {
            return c.json({
                success: false,
                error: 'Invalid verification ID format'
            }, 400);
        }

        const success = await agentVerificationService.deleteVerification(verificationId);

        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to delete verification'
            }, 500);
        }

        return c.json({
            success: true,
            message: 'Verification deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting verification:', error.message);
        
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }

        return c.json({
            success: false,
            error: 'Failed to delete verification'
        }, 500);
    }
};