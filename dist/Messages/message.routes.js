import { Hono } from 'hono';
import { authenticate } from '../middleware/auth.middleware.js';
import * as messageController from './message.controller.js';
const messageRoutes = new Hono();
// All messaging routes require authentication
messageRoutes.use('*', authenticate);
// Get user conversations
messageRoutes.get('/conversations', messageController.getUserConversations);
// Get or create conversation
messageRoutes.post('/conversation', messageController.getOrCreateConversation);
// Get messages for a conversation
messageRoutes.get('/:conversationId', messageController.getMessages);
// Send message
messageRoutes.post('/:conversationId', messageController.sendMessage);
// Archive conversation
messageRoutes.post('/:conversationId/archive', messageController.toggleArchive);
// Block conversation
messageRoutes.post('/:conversationId/block', messageController.toggleBlock);
// Delete message
messageRoutes.delete('/message/:messageId', messageController.deleteMessage);
// Add reaction to message
messageRoutes.post('/message/:messageId/reaction', messageController.addReaction);
export default messageRoutes;
//# sourceMappingURL=message.routes.js.map