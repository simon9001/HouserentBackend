import { Hono } from 'hono';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { createStatus, getActiveStatuses, deleteStatus } from './status.controller.js';

const statusRoutes = new Hono();

// Get active statuses (public or protected? Making it public for UserHome for now)
statusRoutes.get('/', getActiveStatuses);

// Protected routes
statusRoutes.post('/', authenticate, authorize('ADMIN', 'AGENT'), createStatus);
statusRoutes.delete('/:id', authenticate, authorize('ADMIN', 'AGENT'), deleteStatus);

export default statusRoutes;
