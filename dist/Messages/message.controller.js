import { messageService } from './message.service.js';
import { propertiesService } from '../Properties/properties.service.js';
export const getOrCreateConversation = async (c) => {
    try {
        const userId = c.user?.userId;
        const { propertyId, initialMessage, messageType } = await c.req.json();
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        if (!propertyId)
            return c.json({ success: false, error: 'PropertyId is required' }, 400);
        // Get property to find agent (owner)
        const property = await propertiesService.getPropertyById(propertyId);
        if (!property)
            return c.json({ success: false, error: 'Property not found' }, 404);
        const agentId = property.owner_id;
        // Prevent self-conversation
        if (userId === agentId) {
            return c.json({ success: false, error: 'Cannot start a conversation with yourself' }, 400);
        }
        const result = await messageService.getOrCreateConversation(propertyId, agentId, userId, initialMessage, messageType);
        return c.json({
            success: true,
            data: result,
            message: initialMessage ? 'Conversation started with first message' : 'Conversation created'
        });
    }
    catch (error) {
        console.error('Error in getOrCreateConversation:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const getUserConversations = async (c) => {
    try {
        const userId = c.user?.userId;
        const role = c.req.query('role');
        const includeArchived = c.req.query('includeArchived') === 'true';
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        const conversations = await messageService.getUserConversations(userId, role, includeArchived);
        return c.json({
            success: true,
            data: conversations,
            count: conversations.length
        });
    }
    catch (error) {
        console.error('Error in getUserConversations:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const getMessages = async (c) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const beforeMessageId = c.req.query('beforeMessageId');
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        if (!conversationId)
            return c.json({ success: false, error: 'ConversationId is required' }, 400);
        const messages = await messageService.getMessages(conversationId, userId, beforeMessageId);
        return c.json({
            success: true,
            data: messages,
            count: messages.length
        });
    }
    catch (error) {
        console.error('Error in getMessages:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const sendMessage = async (c) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const body = await c.req.json();
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        if (!body.content && !body.mediaUrl) {
            return c.json({ success: false, error: 'Message content or media is required' }, 400);
        }
        const message = await messageService.sendMessage({
            conversationId,
            senderId: userId,
            ...body
        });
        return c.json({
            success: true,
            data: message,
            message: 'Message sent successfully'
        });
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const toggleArchive = async (c) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const { archive } = await c.req.json();
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        await messageService.toggleArchive(conversationId, userId, archive);
        return c.json({
            success: true,
            message: `Conversation ${archive ? 'archived' : 'unarchived'} successfully`
        });
    }
    catch (error) {
        console.error('Error in toggleArchive:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const toggleBlock = async (c) => {
    try {
        const userId = c.user?.userId;
        const conversationId = c.req.param('conversationId');
        const { block, reason } = await c.req.json();
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        await messageService.toggleBlock(conversationId, userId, block, reason);
        return c.json({
            success: true,
            message: `Conversation ${block ? 'blocked' : 'unblocked'} successfully`
        });
    }
    catch (error) {
        console.error('Error in toggleBlock:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const deleteMessage = async (c) => {
    try {
        const userId = c.user?.userId;
        const messageId = c.req.param('messageId');
        const { forEveryone } = await c.req.json();
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        await messageService.deleteMessage(messageId, userId, forEveryone);
        return c.json({
            success: true,
            message: 'Message deleted successfully'
        });
    }
    catch (error) {
        console.error('Error in deleteMessage:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
export const addReaction = async (c) => {
    try {
        const userId = c.user?.userId;
        const messageId = c.req.param('messageId');
        const { reactionType } = await c.req.json();
        if (!userId)
            return c.json({ success: false, error: 'User not authenticated' }, 401);
        const action = await messageService.addReaction(messageId, userId, reactionType);
        return c.json({
            success: true,
            action: action,
            message: `Reaction ${action === 'ADDED' ? 'added' : 'removed'} successfully`
        });
    }
    catch (error) {
        console.error('Error in addReaction:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
};
//# sourceMappingURL=message.controller.js.map