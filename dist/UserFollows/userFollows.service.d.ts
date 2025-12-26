export interface UserFollow {
    FollowerId: string;
    FollowedId: string;
    CreatedAt: Date;
}
export interface FollowStats {
    followerCount: number;
    followingCount: number;
}
export declare class UserFollowsService {
    private db;
    constructor();
    private getDb;
    followUser(followerId: string, followedId: string): Promise<UserFollow>;
    unfollowUser(followerId: string, followedId: string): Promise<boolean>;
    isFollowing(followerId: string, followedId: string): Promise<boolean>;
    getFollowers(userId: string, limit?: number, offset?: number): Promise<{
        followers: Array<UserFollow & {
            UserName: string;
            UserRole: string;
        }>;
        total: number;
    }>;
    getFollowing(userId: string, limit?: number, offset?: number): Promise<{
        following: Array<UserFollow & {
            UserName: string;
            UserRole: string;
        }>;
        total: number;
    }>;
    getFollowStats(userId: string): Promise<FollowStats>;
    getMutualFollows(userId1: string, userId2: string): Promise<Array<{
        UserId: string;
        UserName: string;
        UserRole: string;
    }>>;
    getSuggestedUsers(userId: string, limit?: number): Promise<Array<{
        UserId: string;
        UserName: string;
        UserRole: string;
        TrustScore: number;
        MutualFollows: number;
    }>>;
}
export declare const userFollowsService: UserFollowsService;
//# sourceMappingURL=userFollows.service.d.ts.map