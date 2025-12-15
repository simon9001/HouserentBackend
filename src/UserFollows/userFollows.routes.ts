import { Hono } from 'hono';
import * as userFollowsControllers from './userFollows.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const userFollowsRoutes = new Hono();

// Protected routes
userFollowsRoutes.post('/follow/:followerId/:followedId', authenticate, userFollowsControllers.followUser);
userFollowsRoutes.delete('/follow/:followerId/:followedId', authenticate, userFollowsControllers.unfollowUser);
userFollowsRoutes.get('/follow/:followerId/:followedId/check', authenticate, userFollowsControllers.checkFollowing);
userFollowsRoutes.get('/users/:userId/followers', authenticate, userFollowsControllers.getFollowers);
userFollowsRoutes.get('/users/:userId/following', authenticate, userFollowsControllers.getFollowing);
userFollowsRoutes.get('/users/:userId/follow/stats', authenticate, userFollowsControllers.getFollowStats);
userFollowsRoutes.get('/users/:userId1/:userId2/mutual-follows', authenticate, userFollowsControllers.getMutualFollows);
userFollowsRoutes.get('/users/:userId/suggested-follows', authenticate, userFollowsControllers.getSuggestedUsers);

export default userFollowsRoutes;