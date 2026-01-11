import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface UserFollow {
    FollowerId: string;
    FollowedId: string;
    CreatedAt: string;
}

export interface FollowStats {
    followerCount: number;
    followingCount: number;
}

export class UserFollowsService {

    // Follow a user
    async followUser(followerId: string, followedId: string): Promise<UserFollow> {
        if (followerId === followedId) throw new Error('Cannot follow yourself');

        // Validate users exist using valid Supabase query
        // "IN" query for UserId
        const { count, error } = await supabase
            .from('Users')
            .select('UserId', { count: 'exact', head: true })
            .in('UserId', [followerId, followedId])
            .eq('IsActive', true);

        if (error) throw new Error(error.message);
        if ((count || 0) !== 2) throw new Error('One or both users not found or inactive');

        // Check if already following
        const { data: existingFollow } = await supabase
            .from('UserFollows')
            .select('FollowerId')
            .eq('FollowerId', followerId)
            .eq('FollowedId', followedId)
            .single();

        if (existingFollow) throw new Error('Already following this user');

        const { data: newFollow, error: insertError } = await supabase
            .from('UserFollows')
            .insert({
                FollowerId: followerId,
                FollowedId: followedId,
                CreatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) throw new Error(insertError.message);

        return newFollow as UserFollow;
    }

    // Unfollow a user
    async unfollowUser(followerId: string, followedId: string): Promise<boolean> {
        const { error, count } = await supabase
            .from('UserFollows')
            .delete({ count: 'exact' })
            .eq('FollowerId', followerId)
            .eq('FollowedId', followedId);

        if (error) throw new Error(error.message);

        return (count || 0) > 0;
    }

    // Check if following
    async isFollowing(followerId: string, followedId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('UserFollows')
            .select('FollowerId')
            .eq('FollowerId', followerId)
            .eq('FollowedId', followedId)
            .single();

        return !!data && !error;
    }

    // Get followers of a user
    async getFollowers(userId: string, limit: number = 50, offset: number = 0): Promise<{
        followers: Array<UserFollow & { UserName: string; UserRole: string }>;
        total: number;
    }> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { data, error, count } = await supabase
            .from('UserFollows')
            .select(`
                *,
                Users:FollowerId (FullName, Role)
            `, { count: 'exact' })
            .eq('FollowedId', userId)
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        const followers = data.map((item: any) => {
            const user = item.Users;
            const res: any = { ...item };
            delete res.Users;
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
    async getFollowing(userId: string, limit: number = 50, offset: number = 0): Promise<{
        following: Array<UserFollow & { UserName: string; UserRole: string }>;
        total: number;
    }> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const { data, error, count } = await supabase
            .from('UserFollows')
            .select(`
                *,
                Users:FollowedId (FullName, Role)
            `, { count: 'exact' })
            .eq('FollowerId', userId)
            .order('CreatedAt', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        const following = data.map((item: any) => {
            const user = item.Users;
            const res: any = { ...item };
            delete res.Users;
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
    async getFollowStats(userId: string): Promise<FollowStats> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        const [followerRes, followingRes] = await Promise.all([
            supabase.from('UserFollows').select('*', { count: 'exact', head: true }).eq('FollowedId', userId),
            supabase.from('UserFollows').select('*', { count: 'exact', head: true }).eq('FollowerId', userId)
        ]);

        return {
            followerCount: followerRes.count || 0,
            followingCount: followingRes.count || 0
        };
    }

    // Get mutual follows
    async getMutualFollows(userId1: string, userId2: string): Promise<Array<{
        UserId: string;
        UserName: string;
        UserRole: string;
    }>> {
        if (!ValidationUtils.isValidUUID(userId1) || !ValidationUtils.isValidUUID(userId2)) {
            throw new Error('Invalid user ID format');
        }

        // Logic: Find users followed by BOTH userId1 and userId2? 
        // OR: Users who follow both?
        // Original MSSQL query:
        // EXISTS (SELECT 1 FROM UserFollows uf1 WHERE uf1.FollowerId = @userId1 AND uf1.FollowedId = u.UserId)
        // AND EXISTS (SELECT 1 FROM UserFollows uf2 WHERE uf2.FollowerId = @userId2 AND uf2.FollowedId = u.UserId)
        // This finds users that BOTH userId1 and userId2 are FOLLOWING. (Common interest)

        // Supabase approach:
        // 1. Get List of users followed by User1
        // 2. Get List of users followed by User2
        // 3. Intersect in JS (or use specialized query)

        // Let's try to fetch IDs only and intersect in JS for simplicity, assuming lists aren't massive.

        const { data: user1Following } = await supabase
            .from('UserFollows')
            .select('FollowedId')
            .eq('FollowerId', userId1);

        const { data: user2Following } = await supabase
            .from('UserFollows')
            .select('FollowedId')
            .eq('FollowerId', userId2);

        if (!user1Following || !user2Following) return [];

        const set1 = new Set(user1Following.map(u => u.FollowedId));
        const mutualIds = user2Following
            .map(u => u.FollowedId)
            .filter(id => set1.has(id));

        if (mutualIds.length === 0) return [];

        const { data: mutualUsers } = await supabase
            .from('Users')
            .select('UserId, FullName, Role')
            .in('UserId', mutualIds)
            .eq('IsActive', true);

        return (mutualUsers || []).map((u: any) => ({
            UserId: u.UserId,
            UserName: u.FullName,
            UserRole: u.Role
        }));
    }

    // Get suggested users to follow
    async getSuggestedUsers(userId: string, limit: number = 10): Promise<Array<{
        UserId: string;
        UserName: string;
        UserRole: string;
        TrustScore: number;
        MutualFollows: number;
    }>> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        // Suggest users who are followed by users I follow? (Friends of friends)
        // Or high trust score users?
        // Original query:
        // 1. u.UserId != @userId
        // 2. Not already following
        // 3. Sort by MutualFollows DESC, TrustScore DESC
        // MutualFollows = Count of (You follow X, X follows Target)

        // Implementing this efficiently in Supabase/PostgREST without RPC is hard.
        // Simplified approach:
        // 1. Get top trust score users
        // 2. Filter out already followed
        // 3. (Optional) Check mutuals for them

        // Fetch ID of users I already follow
        const { data: following } = await supabase
            .from('UserFollows')
            .select('FollowedId')
            .eq('FollowerId', userId);

        const excludeIds = new Set((following || []).map(f => f.FollowedId));
        excludeIds.add(userId);

        // Fetch top trusted users (limit*2 to allow for filtering)
        const { data: candidates } = await supabase
            .from('Users')
            .select('UserId, FullName, Role, TrustScore')
            .eq('IsActive', true)
            .order('TrustScore', { ascending: false })
            .limit(limit * 3);

        if (!candidates) return [];

        const filtered = candidates.filter((u: any) => !excludeIds.has(u.UserId)).slice(0, limit);

        // For mutual follows calculation (Client side approximation or skip)
        // Skip mutual calculation for now as it requires intense querying

        return filtered.map((u: any) => ({
            UserId: u.UserId,
            UserName: u.FullName,
            UserRole: u.Role,
            TrustScore: u.TrustScore,
            MutualFollows: 0 // Placeholder
        }));
    }
}

export const userFollowsService = new UserFollowsService();