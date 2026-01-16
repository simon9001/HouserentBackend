import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class UserFollowsService {
    // Helper to map DB result to UserFollow interface
    mapDBToUserFollow(data) {
        if (!data)
            return data;
        return {
            FollowerId: data.follower_id,
            FollowedId: data.followed_id,
            CreatedAt: data.created_at
        };
    }
    // Follow a user
    async followUser(followerId, followedId) {
        if (followerId === followedId)
            throw new Error('Cannot follow yourself');
        // Validate users exist (Users table is PascalCase)
        const { count, error } = await supabase
            .from('Users')
            .select('UserId', { count: 'exact', head: true })
            .in('UserId', [followerId, followedId])
            .eq('IsActive', true);
        if (error)
            throw new Error(error.message);
        if ((count || 0) !== 2)
            throw new Error('One or both users not found or inactive');
        // Check if already following (user_follows is snake_case)
        const { data: existingFollow } = await supabase
            .from('user_follows')
            .select('follower_id')
            .eq('follower_id', followerId)
            .eq('followed_id', followedId)
            .single();
        if (existingFollow)
            throw new Error('Already following this user');
        const { data: newFollow, error: insertError } = await supabase
            .from('user_follows')
            .insert({
            follower_id: followerId,
            followed_id: followedId,
            created_at: new Date().toISOString()
        })
            .select()
            .single();
        if (insertError)
            throw new Error(insertError.message);
        return this.mapDBToUserFollow(newFollow);
    }
    // Unfollow a user
    async unfollowUser(followerId, followedId) {
        const { error, count } = await supabase
            .from('user_follows')
            .delete({ count: 'exact' })
            .eq('follower_id', followerId)
            .eq('followed_id', followedId);
        if (error)
            throw new Error(error.message);
        return (count || 0) > 0;
    }
    // Check if following
    async isFollowing(followerId, followedId) {
        const { data, error } = await supabase
            .from('user_follows')
            .select('follower_id')
            .eq('follower_id', followerId)
            .eq('followed_id', followedId)
            .single();
        return !!data && !error;
    }
    // Get followers of a user
    async getFollowers(userId, limit = 50, offset = 0) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        // Join Users (PascalCase) on FollowerId -> Users.UserId
        // Mapping: user_follows.follower_id -> Users.UserId
        // Supabase: Users:follower_id (FullName, Role)
        // Wait, FK in user_follows is follower_id -> Users(UserId).
        const { data, error, count } = await supabase
            .from('user_follows')
            .select(`
                *,
                Users:follower_id (FullName, Role)
            `, { count: 'exact' })
            .eq('followed_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const followers = data.map((item) => {
            const user = item.Users;
            const res = this.mapDBToUserFollow(item);
            if (user) {
                res.UserName = user.FullName;
                res.UserRole = user.Role;
            }
            return res;
        });
        return {
            followers,
            total: count || 0
        };
    }
    // Get users followed by a user
    async getFollowing(userId, limit = 50, offset = 0) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        const { data, error, count } = await supabase
            .from('user_follows')
            .select(`
                *,
                Users:followed_id (FullName, Role)
            `, { count: 'exact' })
            .eq('follower_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const following = data.map((item) => {
            const user = item.Users;
            const res = this.mapDBToUserFollow(item);
            if (user) {
                res.UserName = user.FullName;
                res.UserRole = user.Role;
            }
            return res;
        });
        return {
            following,
            total: count || 0
        };
    }
    // Get follow statistics for a user
    async getFollowStats(userId) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        const [followerRes, followingRes] = await Promise.all([
            supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('followed_id', userId),
            supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
        ]);
        return {
            followerCount: followerRes.count || 0,
            followingCount: followingRes.count || 0
        };
    }
    // Get mutual follows
    async getMutualFollows(userId1, userId2) {
        if (!ValidationUtils.isValidUUID(userId1) || !ValidationUtils.isValidUUID(userId2)) {
            throw new Error('Invalid user ID format');
        }
        const { data: user1Following } = await supabase
            .from('user_follows')
            .select('followed_id')
            .eq('follower_id', userId1);
        const { data: user2Following } = await supabase
            .from('user_follows')
            .select('followed_id')
            .eq('follower_id', userId2);
        if (!user1Following || !user2Following)
            return [];
        const set1 = new Set(user1Following.map(u => u.followed_id));
        const mutualIds = user2Following
            .map(u => u.followed_id)
            .filter(id => set1.has(id));
        if (mutualIds.length === 0)
            return [];
        const { data: mutualUsers } = await supabase
            .from('Users')
            .select('UserId, FullName, Role')
            .in('UserId', mutualIds)
            .eq('IsActive', true);
        return (mutualUsers || []).map((u) => ({
            UserId: u.UserId,
            UserName: u.FullName,
            UserRole: u.Role
        }));
    }
    // Get suggested users to follow
    async getSuggestedUsers(userId, limit = 10) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        // Fetch ID of users I already follow
        const { data: following } = await supabase
            .from('user_follows')
            .select('followed_id')
            .eq('follower_id', userId);
        const excludeIds = new Set((following || []).map(f => f.followed_id));
        excludeIds.add(userId);
        // Fetch top trusted users (limit*2 to allow for filtering)
        const { data: candidates } = await supabase
            .from('Users')
            .select('UserId, FullName, Role, TrustScore')
            .eq('IsActive', true)
            .order('TrustScore', { ascending: false })
            .limit(limit * 3);
        if (!candidates)
            return [];
        const filtered = candidates.filter((u) => !excludeIds.has(u.UserId)).slice(0, limit);
        return filtered.map((u) => ({
            UserId: u.UserId,
            UserName: u.FullName,
            UserRole: u.Role,
            TrustScore: u.TrustScore,
            MutualFollows: 0 // Placeholder
        }));
    }
}
export const userFollowsService = new UserFollowsService();
//# sourceMappingURL=userFollows.service.js.map