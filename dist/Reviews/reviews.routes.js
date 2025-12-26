import { Hono } from 'hono';
import * as reviewsControllers from './reviews.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const reviewsRoutes = new Hono();
// Public routes
reviewsRoutes.get('/reviews/recent', reviewsControllers.getRecentReviews);
reviewsRoutes.get('/agents/:agentId/reviews', reviewsControllers.getReviewsByAgentId);
reviewsRoutes.get('/agents/:agentId/reviews/summary', reviewsControllers.getAgentRatingSummary);
reviewsRoutes.get('/properties/:propertyId/reviews', reviewsControllers.getReviewsByPropertyId);
reviewsRoutes.get('/properties/:propertyId/reviews/summary', reviewsControllers.getPropertyRatingSummary);
reviewsRoutes.get('/reviews/:reviewId', reviewsControllers.getReviewById);
// Protected routes
reviewsRoutes.post('/reviews', authenticate, reviewsControllers.createReview);
reviewsRoutes.put('/reviews/:reviewId', authenticate, reviewsControllers.updateReview);
reviewsRoutes.delete('/reviews/:reviewId', authenticate, reviewsControllers.deleteReview);
export default reviewsRoutes;
//# sourceMappingURL=reviews.routes.js.map