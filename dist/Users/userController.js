import { usersService } from '../Users/userService.js';
import { SecurityUtils } from '../utils/security.js';
import { UserValidators } from '../utils/validators.js';
// Create new user
export const createUser = async (c) => {
    try {
        const body = await c.req.json();
        // Validate required fields
        const requiredFields = ['username', 'email', 'password', 'fullName', 'phoneNumber'];
        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return c.json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            }, 400);
        }
        // Create user
        const userInput = {
            username: body.username,
            email: body.email,
            password: body.password,
            fullName: body.fullName,
            phoneNumber: body.phoneNumber,
            role: body.role || 'TENANT'
        };
        const user = await usersService.createUser(userInput);
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = user;
        return c.json({
            success: true,
            message: 'User created successfully',
            data: userWithoutPassword
        }, 201);
    }
    catch (error) {
        console.error('Error creating user:', error.message);
        if (error.message.includes('already exists')) {
            return c.json({
                success: false,
                error: error.message
            }, 409);
        }
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to create user'
        }, 500);
    }
};
// Get all users
export const getAllUsers = async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        const result = await usersService.getAllUsers(page, limit);
        // Remove password hashes from response
        const usersWithoutPasswords = result.users.map(user => {
            const { PasswordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return c.json({
            success: true,
            data: {
                users: usersWithoutPasswords,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching users:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch users'
        }, 500);
    }
};
// Get user by ID
export const getUserById = async (c) => {
    try {
        const userId = c.req.param('userId');
        const user = await usersService.getUserById(userId);
        if (!user) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = user;
        return c.json({
            success: true,
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error fetching user:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to fetch user'
        }, 500);
    }
};
// Get user by username
export const getUserByUsername = async (c) => {
    try {
        const username = c.req.param('username');
        const user = await usersService.getUserByUsername(username);
        if (!user) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = user;
        return c.json({
            success: true,
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error fetching user:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch user'
        }, 500);
    }
};
// Get user by email
export const getUserByEmail = async (c) => {
    try {
        const email = c.req.param('email');
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = user;
        return c.json({
            success: true,
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error fetching user:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch user'
        }, 500);
    }
};
// Update user
export const updateUser = async (c) => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();
        // Check if user exists
        const existingUser = await usersService.getUserById(userId);
        if (!existingUser) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        const updateData = {
            fullName: body.fullName,
            phoneNumber: body.phoneNumber,
            email: body.email,
            role: body.role,
            agentStatus: body.agentStatus,
            trustScore: body.trustScore,
            isActive: body.isActive
        };
        const updatedUser = await usersService.updateUser(userId, updateData);
        if (!updatedUser) {
            return c.json({
                success: false,
                error: 'Failed to update user'
            }, 500);
        }
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = updatedUser;
        return c.json({
            success: true,
            message: 'User updated successfully',
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error updating user:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (error.message.includes('already exists')) {
            return c.json({
                success: false,
                error: error.message
            }, 409);
        }
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update user'
        }, 500);
    }
};
// Update user password
export const updateUserPassword = async (c) => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();
        // Check if user exists
        const existingUser = await usersService.getUserById(userId);
        if (!existingUser) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        // Validate required fields
        if (!body.currentPassword || !body.newPassword) {
            return c.json({
                success: false,
                error: 'Both currentPassword and newPassword are required'
            }, 400);
        }
        // Verify current password
        const isPasswordValid = await SecurityUtils.comparePassword(body.currentPassword, existingUser.PasswordHash);
        if (!isPasswordValid) {
            await usersService.updateLoginAttempts(userId, false);
            return c.json({
                success: false,
                error: 'Current password is incorrect'
            }, 401);
        }
        // Update password
        const success = await usersService.updateUserPassword(userId, body.newPassword);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to update password'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Password updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating password:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        if (error.message.includes('must be')) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update password'
        }, 500);
    }
};
// Update user role
export const updateUserRole = async (c) => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();
        // Check if user exists
        const existingUser = await usersService.getUserById(userId);
        if (!existingUser) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        // Validate role
        if (!body.role) {
            return c.json({
                success: false,
                error: 'Role is required'
            }, 400);
        }
        const roleValidation = UserValidators.validateRole(body.role);
        if (!roleValidation.isValid) {
            return c.json({
                success: false,
                error: roleValidation.error
            }, 400);
        }
        const updateData = {
            role: body.role
        };
        const updatedUser = await usersService.updateUser(userId, updateData);
        if (!updatedUser) {
            return c.json({
                success: false,
                error: 'Failed to update user role'
            }, 500);
        }
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = updatedUser;
        return c.json({
            success: true,
            message: 'User role updated successfully',
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error updating user role:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update user role'
        }, 500);
    }
};
// Update agent status
export const updateAgentStatus = async (c) => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();
        // Check if user exists
        const existingUser = await usersService.getUserById(userId);
        if (!existingUser) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        // Check if user is an agent
        if (existingUser.Role !== 'AGENT') {
            return c.json({
                success: false,
                error: 'User is not an agent'
            }, 400);
        }
        // Validate agent status
        if (!body.agentStatus) {
            return c.json({
                success: false,
                error: 'Agent status is required'
            }, 400);
        }
        const statusValidation = UserValidators.validateAgentStatus(body.agentStatus);
        if (!statusValidation.isValid) {
            return c.json({
                success: false,
                error: statusValidation.error
            }, 400);
        }
        const updateData = {
            agentStatus: body.agentStatus
        };
        const updatedUser = await usersService.updateUser(userId, updateData);
        if (!updatedUser) {
            return c.json({
                success: false,
                error: 'Failed to update agent status'
            }, 500);
        }
        // Remove password hash from response
        const { PasswordHash, ...userWithoutPassword } = updatedUser;
        return c.json({
            success: true,
            message: 'Agent status updated successfully',
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Error updating agent status:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to update agent status'
        }, 500);
    }
};
// Verify user email
export const verifyUserEmail = async (c) => {
    try {
        const userId = c.req.param('userId');
        // Check if user exists
        const existingUser = await usersService.getUserById(userId);
        if (!existingUser) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        const success = await usersService.verifyEmail(userId);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to verify email'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Error verifying email:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to verify email'
        }, 500);
    }
};
// Delete user
export const deleteUser = async (c) => {
    try {
        const userId = c.req.param('userId');
        // Check if user exists
        const existingUser = await usersService.getUserById(userId);
        if (!existingUser) {
            return c.json({
                success: false,
                error: 'User not found'
            }, 404);
        }
        const success = await usersService.deleteUser(userId);
        if (!success) {
            return c.json({
                success: false,
                error: 'Failed to delete user'
            }, 500);
        }
        return c.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting user:', error.message);
        if (error.message.includes('Invalid user ID format')) {
            return c.json({
                success: false,
                error: 'Invalid user ID format'
            }, 400);
        }
        return c.json({
            success: false,
            error: 'Failed to delete user'
        }, 500);
    }
};
// Get user statistics
export const getUserStatistics = async (c) => {
    try {
        const stats = await usersService.getUserStatistics();
        return c.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching user statistics:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch statistics'
        }, 500);
    }
};
// Search users
export const searchUsers = async (c) => {
    try {
        const searchTerm = c.req.query('q') || '';
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        if (searchTerm.length < 2) {
            return c.json({
                success: false,
                error: 'Search term must be at least 2 characters long'
            }, 400);
        }
        const result = await usersService.searchUsers(searchTerm, page, limit);
        // Remove password hashes from response
        const usersWithoutPasswords = result.users.map(user => {
            const { PasswordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return c.json({
            success: true,
            data: {
                users: usersWithoutPasswords,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });
    }
    catch (error) {
        console.error('Error searching users:', error.message);
        return c.json({
            success: false,
            error: 'Failed to search users'
        }, 500);
    }
};
// Get users by role
export const getUsersByRole = async (c) => {
    try {
        const role = c.req.param('role');
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        // Validate role
        const roleValidation = UserValidators.validateRole(role);
        if (!roleValidation.isValid) {
            return c.json({
                success: false,
                error: roleValidation.error
            }, 400);
        }
        if (page < 1 || limit < 1) {
            return c.json({
                success: false,
                error: 'Page and limit must be positive numbers'
            }, 400);
        }
        const result = await usersService.getUsersByRole(role, page, limit);
        // Remove password hashes from response
        const usersWithoutPasswords = result.users.map(user => {
            const { PasswordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return c.json({
            success: true,
            data: {
                users: usersWithoutPasswords,
                pagination: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching users by role:', error.message);
        return c.json({
            success: false,
            error: 'Failed to fetch users by role'
        }, 500);
    }
};
//# sourceMappingURL=userController.js.map