import { messageService } from './message.service.js';
import { propertiesService } from '../Properties/properties.service.js';
import { AuthContext } from '../middleware/auth.middleware.js';

export const getOrCreateConversation = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const { propertyId, initialMessage, messageType } = await c.req.json();

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);
        if (!propertyId) return c.json({ success: false, error: 'PropertyId is required' }, 400);

        // Get property to find the agent (owner)
        const property = await propertiesService.getPropertyById(propertyId);
        if (!property) return c.json({ success: false, error: 'Property not found' }, 404);

        const agentId = property.owner_id;

        // If user is the agent, they shouldn't start a conversation with themselves
        if (userId === agentId) {
            return c.json({ success: false, error: 'Cannot start a conversation with yourself' }, 400);
        }

        const result = await messageService.getOrCreateConversation(propertyId, agentId, userId, initialMessage, messageType);

        return c.json({ success: true, data: result });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const getUserConversations = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const role = c.req.query('role');
        const includeArchived = c.req.query('includeArchived') === 'true';

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);

        const conversations = await messageService.getUserConversations(userId, role, includeArchived);
        return c.json({ success: true, data: conversations });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const getMessages = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const beforeMessageId = c.req.query('beforeMessageId');

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);

        const messages = await messageService.getMessages(conversationId, userId, beforeMessageId);
        return c.json({ success: true, data: messages });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const sendMessage = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const body = await c.req.json();

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);
        if (!body.content && !body.mediaUrl) return c.json({ success: false, error: 'Message content or media is required' }, 400);

        const message = await messageService.sendMessage({
            conversationId,
            senderId: userId,
            ...body
        });
        return c.json({ success: true, data: message });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const toggleArchive = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const { archive } = await c.req.json();

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);

        await messageService.toggleArchive(conversationId, userId, archive);
        return c.json({ success: true, message: `Conversation ${archive ? 'archived' : 'unarchived'}` });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const toggleBlock = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const { block, reason } = await c.req.json();

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);

        await messageService.toggleBlock(conversationId, userId, block, reason);
        return c.json({ success: true, message: `Conversation ${block ? 'blocked' : 'unblocked'}` });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const deleteMessage = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const messageId = c.req.param('messageId');
        const { forEveryone } = await c.req.json();

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);

        await messageService.deleteMessage(messageId, userId, forEveryone);
        return c.json({ success: true, message: 'Message deleted' });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};

export const addReaction = async (c: AuthContext) => {
    try {
        const userId = c.user?.userId;
        const messageId = c.req.param('messageId');
        const { reactionType } = await c.req.json();

        if (!userId) return c.json({ success: false, error: 'User not authenticated' }, 401);

        const action = await messageService.addReaction(messageId, userId, reactionType);
        return c.json({ success: true, action });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
};
