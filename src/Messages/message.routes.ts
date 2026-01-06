import { Hono } from 'hono';
import { authenticate } from '../middleware/auth.middleware.js';
import * as messageController from './message.controller.js';

const messageRoutes = new Hono();

// All messaging routes require authentication
messageRoutes.use('*', authenticate);

// Conversation management
messageRoutes.get('/conversations', messageController.getUserConversations);
messageRoutes.post('/conversation', messageController.getOrCreateConversation);

// Advanced Conversation management
messageRoutes.post('/:conversationId/archive', messageController.toggleArchive);
messageRoutes.post('/:conversationId/block', messageController.toggleBlock);

// Message management
messageRoutes.get('/:conversationId', messageController.getMessages);
messageRoutes.post('/:conversationId', messageController.sendMessage);
messageRoutes.delete('/message/:messageId', messageController.deleteMessage);
messageRoutes.post('/message/:messageId/reaction', messageController.addReaction);

export default messageRoutes;
