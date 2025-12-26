import { userFollowsService } from './userFollows.service.js';
import { ValidationUtils } from '../utils/validators.js';
// Follow a user
export const followUser = async (c) => {
    try {
        const followerId = c.req.param('followerId');
        const followedId = c.req.param('followedId');
        if (!ValidationUtils.isValidUUID(followerId) || !ValidationUtils.isValidUUID(followedId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const follow = await userFollowsService.followUser(followerId, followedId);
        return c.json({
            success: true,
            message: 'User followed successfully',
            data: follow
        }, 201);
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to follow user'
        }, 400);
    }
};
// Unfollow a user
export const unfollowUser = async (c) => {
    try {
        const followerId = c.req.param('followerId');
        const followedId = c.req.param('followedId');
        if (!ValidationUtils.isValidUUID(followerId) || !ValidationUtils.isValidUUID(followedId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const unfollowed = await userFollowsService.unfollowUser(followerId, followedId);
        if (!unfollowed) {
            return c.json({
                success: false,
                error: 'Not following this user'
            }, 404);
        }
        return c.json({
            success: true,
            message: 'User unfollowed successfully'
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to unfollow user'
        }, 400);
    }
};
// Check if following
export const checkFollowing = async (c) => {
    try {
        const followerId = c.req.param('followerId');
        const followedId = c.req.param('followedId');
        if (!ValidationUtils.isValidUUID(followerId) || !ValidationUtils.isValidUUID(followedId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const isFollowing = await userFollowsService.isFollowing(followerId, followedId);
        return c.json({
            success: true,
            data: { isFollowing }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to check follow status'
        }, 400);
    }
};
// Get followers
export const getFollowers = async (c) => {
    try {
        const userId = c.req.param('userId');
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 100'
            }, 400);
        }
        if (isNaN(offset) || offset < 0) {
            return c.json({
                success: false,
                error: 'Offset must be 0 or greater'
            }, 400);
        }
        const { followers, total } = await userFollowsService.getFollowers(userId, limit, offset);
        return c.json({
            success: true,
            data: {
                followers,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch followers'
        }, 400);
    }
};
// Get following
export const getFollowing = async (c) => {
    try {
        const userId = c.req.param('userId');
        const limit = parseInt(c.req.query('limit') || '50');
        const offset = parseInt(c.req.query('offset') || '0');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 100'
            }, 400);
        }
        if (isNaN(offset) || offset < 0) {
            return c.json({
                success: false,
                error: 'Offset must be 0 or greater'
            }, 400);
        }
        const { following, total } = await userFollowsService.getFollowing(userId, limit, offset);
        return c.json({
            success: true,
            data: {
                following,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch following'
        }, 400);
    }
};
// Get follow statistics
export const getFollowStats = async (c) => {
    try {
        const userId = c.req.param('userId');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const stats = await userFollowsService.getFollowStats(userId);
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch follow statistics'
        }, 400);
    }
};
// Get mutual follows
export const getMutualFollows = async (c) => {
    try {
        const userId1 = c.req.param('userId1');
        const userId2 = c.req.param('userId2');
        if (!ValidationUtils.isValidUUID(userId1) || !ValidationUtils.isValidUUID(userId2)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        const mutualFollows = await userFollowsService.getMutualFollows(userId1, userId2);
        return c.json({
            success: true,
            data: mutualFollows
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch mutual follows'
        }, 400);
    }
};
// Get suggested users
export const getSuggestedUsers = async (c) => {
    try {
        const userId = c.req.param('userId');
        const limit = parseInt(c.req.query('limit') || '10');
        if (!ValidationUtils.isValidUUID(userId)) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 50) {
            return c.json({
                success: false,
                error: 'Limit must be between 1 and 50'
            }, 400);
        }
        const suggestions = await userFollowsService.getSuggestedUsers(userId, limit);
        return c.json({
            success: true,
            data: suggestions
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch suggested users'
        }, 400);
    }
};
//# sourceMappingURL=userFollows.controller.js.map