import { Hono } from 'hono';
import * as userControllers from '../Users/userController.js';
const userRoutes = new Hono();
// User management routes
userRoutes.post('/users', userControllers.createUser); // Create new user
userRoutes.get('/users', userControllers.getAllUsers); // Get all users with pagination
userRoutes.get('/users/search', userControllers.searchUsers); // Search users
userRoutes.get('/users/stats', userControllers.getUserStatistics); // Get user statistics
userRoutes.get('/users/role/:role', userControllers.getUsersByRole); // Get users by role
// Single user routes
userRoutes.get('/users/:userId', userControllers.getUserById); // Get user by ID
userRoutes.get('/users/username/:username', userControllers.getUserByUsername); // Get user by username
userRoutes.get('/users/email/:email', userControllers.getUserByEmail); // Get user by email
userRoutes.put('/users/:userId', userControllers.updateUser); // Update user
userRoutes.patch('/users/:userId/password', userControllers.updateUserPassword); // Update user password
userRoutes.patch('/users/:userId/role', userControllers.updateUserRole); // Update user role
userRoutes.patch('/users/:userId/agent-status', userControllers.updateAgentStatus); // Update agent status
userRoutes.patch('/users/:userId/verify-email', userControllers.verifyUserEmail); // Verify user email
userRoutes.delete('/users/:userId', userControllers.deleteUser); // Delete user
export default userRoutes;
//# sourceMappingURL=userRoutes.js.map