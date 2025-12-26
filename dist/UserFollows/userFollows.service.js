import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class UserFollowsService {
    db = null;
    constructor() {
        // Lazy initialization
    }
    async getDb() {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }
    // Follow a user
    async followUser(followerId, followedId) {
        const db = await this.getDb();
        if (followerId === followedId) {
            throw new Error('Cannot follow yourself');
        }
        // Validate users exist
        const userCheck = await db.request()
            .input('followerId', sql.UniqueIdentifier, followerId)
            .input('followedId', sql.UniqueIdentifier, followedId)
            .query(`
                SELECT UserId FROM Users 
                WHERE UserId IN (@followerId, @followedId) 
                AND IsActive = 1
            `);
        if (userCheck.recordset.length !== 2) {
            throw new Error('One or both users not found or inactive');
        }
        // Check if already following
        const existingFollow = await db.request()
            .input('followerId', sql.UniqueIdentifier, followerId)
            .input('followedId', sql.UniqueIdentifier, followedId)
            .query(`
                SELECT FollowerId FROM UserFollows 
                WHERE FollowerId = @followerId AND FollowedId = @followedId
            `);
        if (existingFollow.recordset.length > 0) {
            throw new Error('Already following this user');
        }
        const query = `
            INSERT INTO UserFollows (FollowerId, FollowedId)
            OUTPUT INSERTED.*
            VALUES (@followerId, @followedId)
        `;
        const result = await db.request()
            .input('followerId', sql.UniqueIdentifier, followerId)
            .input('followedId', sql.UniqueIdentifier, followedId)
            .query(query);
        return result.recordset[0];
    }
    // Unfollow a user
    async unfollowUser(followerId, followedId) {
        const db = await this.getDb();
        const query = `
            DELETE FROM UserFollows 
            WHERE FollowerId = @followerId AND FollowedId = @followedId
        `;
        const result = await db.request()
            .input('followerId', sql.UniqueIdentifier, followerId)
            .input('followedId', sql.UniqueIdentifier, followedId)
            .query(query);
        return result.rowsAffected[0] > 0;
    }
    // Check if following
    async isFollowing(followerId, followedId) {
        const db = await this.getDb();
        const query = `
            SELECT FollowerId FROM UserFollows 
            WHERE FollowerId = @followerId AND FollowedId = @followedId
        `;
        const result = await db.request()
            .input('followerId', sql.UniqueIdentifier, followerId)
            .input('followedId', sql.UniqueIdentifier, followedId)
            .query(query);
        return result.recordset.length > 0;
    }
    // Get followers of a user
    async getFollowers(userId, limit = 50, offset = 0) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        // Get followers with user info
        const followersQuery = `
            SELECT 
                uf.*,
                u.FullName as UserName,
                u.Role as UserRole
            FROM UserFollows uf
            INNER JOIN Users u ON uf.FollowerId = u.UserId
            WHERE uf.FollowedId = @userId
            ORDER BY uf.CreatedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        const countQuery = `
            SELECT COUNT(*) as total
            FROM UserFollows
            WHERE FollowedId = @userId
        `;
        const [followersResult, countResult] = await Promise.all([
            db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('limit', sql.Int, limit)
                .input('offset', sql.Int, offset)
                .query(followersQuery),
            db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(countQuery)
        ]);
        return {
            followers: followersResult.recordset,
            total: parseInt(countResult.recordset[0].total)
        };
    }
    // Get users followed by a user
    async getFollowing(userId, limit = 50, offset = 0) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        // Get following with user info
        const followingQuery = `
            SELECT 
                uf.*,
                u.FullName as UserName,
                u.Role as UserRole
            FROM UserFollows uf
            INNER JOIN Users u ON uf.FollowedId = u.UserId
            WHERE uf.FollowerId = @userId
            ORDER BY uf.CreatedAt DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        const countQuery = `
            SELECT COUNT(*) as total
            FROM UserFollows
            WHERE FollowerId = @userId
        `;
        const [followingResult, countResult] = await Promise.all([
            db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .input('limit', sql.Int, limit)
                .input('offset', sql.Int, offset)
                .query(followingQuery),
            db.request()
                .input('userId', sql.UniqueIdentifier, userId)
                .query(countQuery)
        ]);
        return {
            following: followingResult.recordset,
            total: parseInt(countResult.recordset[0].total)
        };
    }
    // Get follow statistics for a user
    async getFollowStats(userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM UserFollows WHERE FollowedId = @userId) as followerCount,
                (SELECT COUNT(*) FROM UserFollows WHERE FollowerId = @userId) as followingCount
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .query(query);
        return {
            followerCount: parseInt(result.recordset[0].followerCount),
            followingCount: parseInt(result.recordset[0].followingCount)
        };
    }
    // Get mutual follows
    async getMutualFollows(userId1, userId2) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId1) || !ValidationUtils.isValidUUID(userId2)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT 
                u.UserId,
                u.FullName as UserName,
                u.Role as UserRole
            FROM Users u
            WHERE EXISTS (
                SELECT 1 FROM UserFollows uf1
                WHERE uf1.FollowerId = @userId1 
                AND uf1.FollowedId = u.UserId
            )
            AND EXISTS (
                SELECT 1 FROM UserFollows uf2
                WHERE uf2.FollowerId = @userId2 
                AND uf2.FollowedId = u.UserId
            )
            AND u.IsActive = 1
        `;
        const result = await db.request()
            .input('userId1', sql.UniqueIdentifier, userId1)
            .input('userId2', sql.UniqueIdentifier, userId2)
            .query(query);
        return result.recordset;
    }
    // Get suggested users to follow
    async getSuggestedUsers(userId, limit = 10) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }
        const query = `
            SELECT 
                u.UserId,
                u.FullName as UserName,
                u.Role as UserRole,
                u.TrustScore,
                (
                    SELECT COUNT(*) 
                    FROM UserFollows uf2 
                    WHERE uf2.FollowerId = u.UserId 
                    AND uf2.FollowedId IN (
                        SELECT FollowedId 
                        FROM UserFollows 
                        WHERE FollowerId = @userId
                    )
                ) as MutualFollows
            FROM Users u
            WHERE u.UserId != @userId
            AND u.IsActive = 1
            AND NOT EXISTS (
                SELECT 1 
                FROM UserFollows uf1 
                WHERE uf1.FollowerId = @userId 
                AND uf1.FollowedId = u.UserId
            )
            ORDER BY MutualFollows DESC, u.TrustScore DESC
        `;
        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('limit', sql.Int, limit)
            .query(query);
        return result.recordset.slice(0, limit);
    }
}
export const userFollowsService = new UserFollowsService();
//# sourceMappingURL=userFollows.service.js.map