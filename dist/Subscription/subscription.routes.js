import { Hono } from 'hono';
import * as subscriptionPlansControllers from './subscriptionPlans.controller.js';
import * as userSubscriptionsControllers from './userSubscriptions.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
const subscriptionRoutes = new Hono();
// Public routes
subscriptionRoutes.get('/plans', subscriptionPlansControllers.getAllSubscriptionPlans);
subscriptionRoutes.get('/plans/compare', subscriptionPlansControllers.compareSubscriptionPlans);
subscriptionRoutes.get('/plans/:planId', subscriptionPlansControllers.getSubscriptionPlanById);
// Protected routes (authenticated users)
subscriptionRoutes.get('/subscriptions/my/active', authenticate, userSubscriptionsControllers.getMyActiveSubscription);
subscriptionRoutes.get('/subscriptions/my', authenticate, userSubscriptionsControllers.getMySubscriptions);
subscriptionRoutes.get('/subscriptions/usage/check', authenticate, userSubscriptionsControllers.checkUsageLimit);
subscriptionRoutes.get('/subscriptions/usage/stats', authenticate, userSubscriptionsControllers.getUsageStatistics);
subscriptionRoutes.post('/subscriptions/usage/record', authenticate, userSubscriptionsControllers.recordUsage);
subscriptionRoutes.post('/subscriptions', authenticate, userSubscriptionsControllers.createUserSubscription);
subscriptionRoutes.get('/subscriptions/:subscriptionId', authenticate, userSubscriptionsControllers.getUserSubscriptionById);
subscriptionRoutes.put('/subscriptions/:subscriptionId', authenticate, userSubscriptionsControllers.updateUserSubscription);
subscriptionRoutes.post('/subscriptions/:subscriptionId/cancel', authenticate, userSubscriptionsControllers.cancelUserSubscription);
subscriptionRoutes.post('/subscriptions/:subscriptionId/renew', authenticate, userSubscriptionsControllers.renewUserSubscription);
// Admin only routes
subscriptionRoutes.post('/plans', authenticate, authorize('ADMIN'), subscriptionPlansControllers.createSubscriptionPlan);
subscriptionRoutes.put('/plans/:planId', authenticate, authorize('ADMIN'), subscriptionPlansControllers.updateSubscriptionPlan);
subscriptionRoutes.delete('/plans/:planId', authenticate, authorize('ADMIN'), subscriptionPlansControllers.deleteSubscriptionPlan);
export default subscriptionRoutes;
//# sourceMappingURL=subscription.routes.js.map