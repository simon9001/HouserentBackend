import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class MessageService {
    async getDb() {
        return getConnectionPool();
    }
    async getOrCreateConversation(propertyId, agentId, userId, initialMessage, messageType) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(propertyId) || !ValidationUtils.isValidUUID(agentId) || !ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid ID format');
        }
        try {
            const result = await db.request()
                .input('PropertyId', sql.UniqueIdentifier, propertyId)
                .input('AgentId', sql.UniqueIdentifier, agentId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('InitialMessage', sql.NVarChar, initialMessage || null)
                .input('MessageType', sql.NVarChar, messageType || 'TEXT')
                .execute('sp_StartConversation');
            return result.recordset[0];
        }
        catch (error) {
            throw error;
        }
    }
    async getConversationById(conversationId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(conversationId))
            return null;
        const query = `SELECT * FROM vw_ConversationDetails WHERE ConversationId = @conversationId`;
        try {
            const result = await db.request()
                .input('conversationId', sql.UniqueIdentifier, conversationId)
                .query(query);
            return result.recordset[0] || null;
        }
        catch (error) {
            throw error;
        }
    }
    async getUserConversations(userId, role, includeArchived = false) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId))
            return [];
        try {
            const result = await db.request()
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('Role', sql.NVarChar, role || null)
                .input('IncludeArchived', sql.Bit, includeArchived)
                .execute('sp_GetUserConversations');
            return result.recordset;
        }
        catch (error) {
            throw error;
        }
    }
    async sendMessage(params) {
        const db = await this.getDb();
        try {
            const result = await db.request()
                .input('ConversationId', sql.UniqueIdentifier, params.conversationId)
                .input('SenderId', sql.UniqueIdentifier, params.senderId)
                .input('Content', sql.NVarChar, params.content)
                .input('MessageType', sql.NVarChar, params.messageType || 'TEXT')
                .input('MediaUrl', sql.NVarChar, params.mediaUrl || null)
                .input('ThumbnailUrl', sql.NVarChar, params.thumbnailUrl || null)
                .input('FileName', sql.NVarChar, params.fileName || null)
                .input('FileSize', sql.Int, params.fileSize || null)
                .input('MimeType', sql.NVarChar, params.mimeType || null)
                .execute('sp_SendMessage');
            const message = result.recordset[0];
            if (message.Reactions && typeof message.Reactions === 'string') {
                message.Reactions = JSON.parse(message.Reactions);
            }
            return message;
        }
        catch (error) {
            throw error;
        }
    }
    async getMessages(conversationId, userId, beforeMessageId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(conversationId))
            return [];
        try {
            const result = await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('BeforeMessageId', sql.UniqueIdentifier, beforeMessageId || null)
                .execute('sp_GetConversationMessages');
            return result.recordset.map(msg => {
                if (msg.Reactions && typeof msg.Reactions === 'string') {
                    msg.Reactions = JSON.parse(msg.Reactions);
                }
                return msg;
            });
        }
        catch (error) {
            throw error;
        }
    }
    async markAsRead(conversationId, userId) {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(conversationId) || !ValidationUtils.isValidUUID(userId))
            return 0;
        try {
            const result = await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .execute('sp_MarkMessagesAsRead');
            return result.recordset[0].MessagesRead;
        }
        catch (error) {
            throw error;
        }
    }
    async toggleArchive(conversationId, userId, archive) {
        const db = await this.getDb();
        try {
            await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('Archive', sql.Bit, archive)
                .execute('sp_ToggleArchiveConversation');
        }
        catch (error) {
            throw error;
        }
    }
    async toggleBlock(conversationId, userId, block, reason) {
        const db = await this.getDb();
        try {
            await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('Block', sql.Bit, block)
                .input('BlockReason', sql.NVarChar, reason || null)
                .execute('sp_ToggleBlockConversation');
        }
        catch (error) {
            throw error;
        }
    }
    async deleteMessage(messageId, userId, forEveryone = false) {
        const db = await this.getDb();
        try {
            await db.request()
                .input('MessageId', sql.UniqueIdentifier, messageId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('ForEveryone', sql.Bit, forEveryone)
                .execute('sp_DeleteMessage');
        }
        catch (error) {
            throw error;
        }
    }
    async addReaction(messageId, userId, reactionType) {
        const db = await this.getDb();
        try {
            const result = await db.request()
                .input('MessageId', sql.UniqueIdentifier, messageId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('ReactionType', sql.NVarChar, reactionType)
                .execute('sp_AddMessageReaction');
            return result.recordset[0].Action;
        }
        catch (error) {
            throw error;
        }
    }
}
export const messageService = new MessageService();
//# sourceMappingURL=message.service.js.map