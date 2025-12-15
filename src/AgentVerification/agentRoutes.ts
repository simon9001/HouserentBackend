import { Hono } from 'hono';
import * as agentVerificationControllers from './agentController.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const agentVerificationRoutes = new Hono();

// Public routes
agentVerificationRoutes.post('/verifications', authenticate, agentVerificationControllers.createVerification);

// Protected routes (authenticated users)
agentVerificationRoutes.get('/verifications/user/:userId', authenticate, agentVerificationControllers.getVerificationByUserId);
agentVerificationRoutes.get('/verifications/:verificationId', authenticate, agentVerificationControllers.getVerificationById);

// Admin only routes
agentVerificationRoutes.get('/verifications', authenticate, authorize('ADMIN'), agentVerificationControllers.getAllVerifications);
agentVerificationRoutes.put('/verifications/:verificationId', authenticate, authorize('ADMIN'), agentVerificationControllers.updateVerification);
agentVerificationRoutes.delete('/verifications/:verificationId', authenticate, authorize('ADMIN'), agentVerificationControllers.deleteVerification);
agentVerificationRoutes.get('/verifications/stats/overview', authenticate, authorize('ADMIN'), agentVerificationControllers.getVerificationStatistics);

export default agentVerificationRoutes;