// agentRoutes.ts
import { Hono } from 'hono';
import { Context } from 'hono';
import * as agentVerificationControllers from './agentController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { agentVerificationService } from './agentService.js';
import { ValidationUtils } from '../utils/validators.js';
import { TokenPayload } from '../utils/jwt.js';

// Define type for context with user
export type AuthContext = Context<{
  Variables: {
    user?: TokenPayload;
  }
}>;

// Create Hono instance with user variable type
const agentVerificationRoutes = new Hono<{
  Variables: {
    user?: TokenPayload;
  }
}>();

// =============================================
// PUBLIC / USER ROUTES
// =============================================

// User applies to become an agent
agentVerificationRoutes.post('/verifications', authenticate, (c) => agentVerificationControllers.createVerification(c as AuthContext));

// User checks their own verification status
agentVerificationRoutes.get('/verifications/user/:userId', authenticate, (c) => agentVerificationControllers.getVerificationByUserId(c as AuthContext));

// User views a specific verification (if they have access)
agentVerificationRoutes.get('/verifications/:verificationId', authenticate, (c) => agentVerificationControllers.getVerificationById(c as AuthContext));

// =============================================
// ADMIN ROUTES
// =============================================

// Admin creates verification for a user
agentVerificationRoutes.post('/verifications/admin/create', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.createVerification(c as AuthContext));

// Admin views all verifications with filtering
agentVerificationRoutes.get('/verifications', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.getAllVerifications(c as AuthContext));

// Admin updates a verification (general update)
agentVerificationRoutes.put('/verifications/:verificationId', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.updateVerification(c as AuthContext));

// Admin approves a verification (convenience endpoint)
agentVerificationRoutes.post('/verifications/:verificationId/approve', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.approveVerification(c as AuthContext));

// Admin rejects a verification (convenience endpoint)
agentVerificationRoutes.post('/verifications/:verificationId/reject', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.rejectVerification(c as AuthContext));

// Admin deletes a verification
agentVerificationRoutes.delete('/verifications/:verificationId', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.deleteVerification(c as AuthContext));

// Admin gets verification statistics
agentVerificationRoutes.get('/verifications/stats/overview', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.getVerificationStatistics(c as AuthContext));

// Admin bulk approves verifications
agentVerificationRoutes.post('/verifications/bulk/approve', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.bulkApproveVerifications(c as AuthContext));

// Admin bulk rejects verifications
agentVerificationRoutes.post('/verifications/bulk/reject', authenticate, authorize('ADMIN'), (c) => agentVerificationControllers.bulkRejectVerifications(c as AuthContext));

// =============================================
// TEST/AUTH ROUTES
// =============================================

// Test authentication
agentVerificationRoutes.get('/verifications/test-auth', authenticate, (c) => agentVerificationControllers.testAuth(c as AuthContext));

// =============================================
// LEGACY/COMPATIBILITY ROUTES
// =============================================

// Backward compatibility route with auto-approve functionality
agentVerificationRoutes.post('/verifications/admin/create-legacy', authenticate, authorize('ADMIN'), async (c: AuthContext) => {
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

        const verificationData = {
            userId: body.userId,
            nationalId: body.nationalId,
            selfieUrl: body.selfieUrl,
            idFrontUrl: body.idFrontUrl,
            idBackUrl: body.idBackUrl,
            propertyProofUrl: body.propertyProofUrl
        };

        // Create verification using service
        const verification = await agentVerificationService.createVerificationForUser(verificationData);

        // Auto-approve if requested
        if (body.autoApprove) {
            const user = c.get('user');
            const adminId = user?.userId;
            if (adminId) {
                const approvedVerification = await agentVerificationService.approveVerification(
                    verification.VerificationId,
                    adminId,
                    body.reviewNotes || 'Automatically approved by admin'
                );
                
                if (approvedVerification) {
                    return c.json({
                        success: true,
                        message: 'Agent verification created and approved successfully',
                        data: approvedVerification
                    }, 201);
                }
            }
        }

        return c.json({
            success: true,
            message: 'Agent verification created successfully',
            data: verification
        }, 201);

    } catch (error: any) {
        console.error('Error creating admin verification:', error.message);
        
        if (error.message.includes('not found') || 
            error.message.includes('already exists') ||
            error.message.includes('not an agent') ||
            error.message.includes('already an approved agent') ||
            error.message.includes('administrators cannot apply')) {
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
});

// User self-check for eligibility
agentVerificationRoutes.get('/verifications/check-eligibility/:userId', authenticate, async (c: AuthContext) => {
    try {
        const userId = c.req.param('userId');
        
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }

        // Get user info using service method instead of direct DB access
        const existingVerification = await agentVerificationService.getVerificationByUserId(userId);
        
        // We need a way to get user info - add a method to your service or use existing verification
        // For now, let's use a different approach:
        const verification = await agentVerificationService.getVerificationByUserId(userId);
        
        if (!verification) {
            // User has no verification yet
            return c.json({
                success: true,
                data: {
                    canApply: true,
                    reason: 'You are eligible to apply',
                    currentStatus: {
                        hasVerification: false,
                        verificationStatus: null
                    }
                }
            });
        }

        const verificationStatus = verification.ReviewStatus?.toUpperCase();
        const eligibility = {
            canApply: false,
            reason: '',
            currentStatus: {
                hasVerification: true,
                verificationStatus: verificationStatus
            }
        };

        // Check eligibility based on status
        if (verificationStatus === 'PENDING') {
            eligibility.canApply = false;
            eligibility.reason = 'You already have a pending agent application';
        } else if (verificationStatus === 'APPROVED') {
            eligibility.canApply = false;
            eligibility.reason = 'Your agent application has already been approved';
        } else if (verificationStatus === 'REJECTED') {
            eligibility.canApply = true;
            eligibility.reason = 'Your previous application was rejected. You can apply again';
        }

        return c.json({
            success: true,
            data: eligibility
        });

    } catch (error: any) {
        console.error('Error checking eligibility:', error.message);
        return c.json({
            success: false,
            error: 'Failed to check eligibility'
        }, 500);
    }
});

// Count endpoints for dashboard
agentVerificationRoutes.get('/verifications/counts/status', authenticate, authorize('ADMIN'), async (c: AuthContext) => {
    try {
        const stats = await agentVerificationService.getVerificationStatistics();
        
        return c.json({
            success: true,
            data: {
                total: stats.total,
                pending: stats.pending,
                approved: stats.approved,
                rejected: stats.rejected,
                last30Days: stats.last30Days
            }
        });
    } catch (error: any) {
        console.error('Error getting verification counts:', error.message);
        return c.json({
            success: false,
            error: 'Failed to get verification counts'
        }, 500);
    }
});

export default agentVerificationRoutes;