import { Hono } from 'hono';
import * as paymentsControllers from './payments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const paymentsRoutes = new Hono();
// Public routes
paymentsRoutes.get('/payments/recent', paymentsControllers.getRecentPayments);
paymentsRoutes.get('/payments/search', paymentsControllers.searchPayments);
// Protected routes
paymentsRoutes.post('/payments', authenticate, paymentsControllers.createPayment);
paymentsRoutes.get('/payments/:paymentId', authenticate, paymentsControllers.getPaymentById);
paymentsRoutes.get('/users/:userId/payments', authenticate, paymentsControllers.getPaymentsByUserId);
paymentsRoutes.get('/properties/:propertyId/payments', authenticate, paymentsControllers.getPaymentsByPropertyId);
paymentsRoutes.put('/payments/:paymentId', authenticate, paymentsControllers.updatePayment);
paymentsRoutes.post('/payments/:paymentId/complete', authenticate, paymentsControllers.completePayment);
paymentsRoutes.post('/payments/:paymentId/fail', authenticate, paymentsControllers.failPayment);
paymentsRoutes.post('/payments/:paymentId/refund', authenticate, paymentsControllers.refundPayment);
// Statistics
paymentsRoutes.get('/payments/stats', authenticate, paymentsControllers.getPaymentStatistics);
export default paymentsRoutes;
//# sourceMappingURL=payments.routes.js.map