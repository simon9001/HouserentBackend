// agentController.ts
import { agentVerificationService } from './agentService.js';
import { ValidationUtils } from '../utils/validators.js';
// Create new agent verification
export const createVerification = async (c) => {
    try {
        const user = c.get('user');
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        const body = await c.req.json();
        // Validate required fields
        const requiredFields = ['nationalId', 'selfieUrl', 'idFrontUrl'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        const verificationData = {
            userId: user.userId,
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
    }
    catch (error) {
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
export const getVerificationById = async (c) => {
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
    }
    catch (error) {
        console.error('Error fetching verification:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch verification'
        }, 500);
    }
};
// Get verification by user ID
export const getVerificationByUserId = async (c) => {
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
            // Return null data instead of 404 to prevent console errors when checking status
            return c.json({
                success: true,
                data: null
            });
        }
        return c.json({
            success: true,
            data: verification
        });
    }
    catch (error) {
        console.error('Error fetching user verification:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch verification'
        }, 500);
    }
};
// Get all verifications
export const getAllVerifications = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const status = c.req.query('status');
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
    }
    catch (error) {
        console.error('Error fetching verifications:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch verifications'
        }, 500);
    }
};
// Update verification (admin review)
export const updateVerification = async (c) => {
    try {
        const verificationId = c.req.param('verificationId');
        const body = await c.req.json();
        const user = c.get('user');
        console.log('Update verification request:', {
            verificationId,
            body,
            userId: user?.userId
        });
        if (!ValidationUtils.isValidUUID(verificationId)) {
            return c.json({
                success: false,
                error: 'Invalid verification ID format'
            }, 400);
        }
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        if (!body.reviewStatus) {
            return c.json({
                success: false,
                error: 'Review status is required'
            }, 400);
        }
        // Validate review status
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(body.reviewStatus)) {
            return c.json({
                success: false,
                error: 'Invalid review status. Must be one of: PENDING, APPROVED, REJECTED'
            }, 400);
        }
        const updateData = {
            reviewStatus: body.reviewStatus,
            reviewNotes: body.reviewNotes
        };
        console.log('Calling service with:', {
            verificationId,
            updateData,
            reviewerId: user.userId
        });
        const updatedVerification = await agentVerificationService.updateVerification(verificationId, updateData, user.userId);
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
    }
    catch (error) {
        console.error('Error updating verification:', error.message);
        console.error('Error stack:', error.stack);
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
// Approve verification
export const approveVerification = async (c) => {
    try {
        const verificationId = c.req.param('verificationId');
        const body = await c.req.json();
        const user = c.get('user');
        if (!ValidationUtils.isValidUUID(verificationId)) {
            return c.json({
                success: false,
                error: 'Invalid verification ID format'
            }, 400);
        }
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        const approvedVerification = await agentVerificationService.approveVerification(verificationId, user.userId, body.reviewNotes);
        if (!approvedVerification) {
            return c.json({
                success: false,
                error: 'Failed to approve verification'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Verification approved successfully',
            data: approvedVerification
        });
    }
    catch (error) {
        console.error('Error approving verification:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to approve verification'
        }, 500);
    }
};
// Reject verification
export const rejectVerification = async (c) => {
    try {
        const verificationId = c.req.param('verificationId');
        const body = await c.req.json();
        const user = c.get('user');
        if (!ValidationUtils.isValidUUID(verificationId)) {
            return c.json({
                success: false,
                error: 'Invalid verification ID format'
            }, 400);
        }
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        const rejectedVerification = await agentVerificationService.rejectVerification(verificationId, user.userId, body.reviewNotes);
        if (!rejectedVerification) {
            return c.json({
                success: false,
                error: 'Failed to reject verification'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Verification rejected successfully',
            data: rejectedVerification
        });
    }
    catch (error) {
        console.error('Error rejecting verification:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to reject verification'
        }, 500);
    }
};
// Bulk approve verifications
export const bulkApproveVerifications = async (c) => {
    try {
        const body = await c.req.json();
        const user = c.get('user');
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        if (!body.verificationIds || !Array.isArray(body.verificationIds) || body.verificationIds.length === 0) {
            return c.json({
                success: false,
                error: 'verificationIds array is required'
            }, 400);
        }
        const approvedVerifications = await agentVerificationService.bulkApproveVerifications(body.verificationIds, user.userId, body.reviewNotes);
        return c.json({
            success: true,
            message: `Successfully approved ${approvedVerifications.length} verification(s)`,
            data: approvedVerifications
        });
    }
    catch (error) {
        console.error('Error bulk approving verifications:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to bulk approve verifications'
        }, 500);
    }
};
// Bulk reject verifications
export const bulkRejectVerifications = async (c) => {
    try {
        const body = await c.req.json();
        const user = c.get('user');
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        if (!body.verificationIds || !Array.isArray(body.verificationIds) || body.verificationIds.length === 0) {
            return c.json({
                success: false,
                error: 'verificationIds array is required'
            }, 400);
        }
        const rejectedVerifications = await agentVerificationService.bulkRejectVerifications(body.verificationIds, user.userId, body.reviewNotes);
        return c.json({
            success: true,
            message: `Successfully rejected ${rejectedVerifications.length} verification(s)`,
            data: rejectedVerifications
        });
    }
    catch (error) {
        console.error('Error bulk rejecting verifications:', error.message);
        if (error.message.includes('Invalid') || error.message.includes('not found')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to bulk reject verifications'
        }, 500);
    }
};
// Get verification statistics
export const getVerificationStatistics = async (c) => {
    try {
        const stats = await agentVerificationService.getVerificationStatistics();
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching verification statistics:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch statistics'
        }, 500);
    }
};
// Delete verification
export const deleteVerification = async (c) => {
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
    }
    catch (error) {
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
// Test authentication
export const testAuth = async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({
            success: false,
            error: 'Not authenticated'
        }, 401);
    }
    return c.json({
        success: true,
        message: 'Authentication successful',
        user: {
            userId: user.userId,
            username: user.username,
            role: user.role
        }
    });
};
// Add these functions to your agentController.ts
// Check eligibility
export const checkEligibility = async (c) => {
    try {
        const userId = c.req.param('userId');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const eligibility = await agentVerificationService.checkEligibility(userId);
        return c.json({
            success: true,
            data: eligibility
        });
    }
    catch (error) {
        console.error('Error checking eligibility:', error.message);
        return c.json({
            success: false,
            error: 'Failed to check eligibility'
        }, 500);
    }
};
// Get status counts
export const getStatusCounts = async (c) => {
    try {
        const stats = await agentVerificationService.getStatusCounts();
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching status counts:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch status counts'
        }, 500);
    }
};
// Create verification for user (admin)
export const createVerificationForUser = async (c) => {
    try {
        const user = c.get('user');
        const body = await c.req.json();
        if (!user) {
            return c.json({
                success: false,
                error: 'Authentication required'
            }, 401);
        }
        // Validate required fields
        const requiredFields = ['userId', 'nationalId', 'selfieUrl', 'idFrontUrl'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        const verificationData = {
            userId: body.userId,
            nationalId: body.nationalId,
            selfieUrl: body.selfieUrl,
            idFrontUrl: body.idFrontUrl,
            idBackUrl: body.idBackUrl,
            propertyProofUrl: body.propertyProofUrl
        };
        const verification = await agentVerificationService.createVerificationForUser(verificationData);
        return c.json({
            success: true,
            message: 'Agent verification created successfully',
            data: verification
        }, 201);
    }
    catch (error) {
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
            error: 'Failed to create verification'
        }, 500);
    }
};
//# sourceMappingURL=agentController.js.map