import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface Conversation {
    ConversationId: string;
    PropertyId: string;
    AgentId: string;
    TenantId: string; // From UserId in DB
    PropertyTitle: string;
    RentAmount: number;
    PropertyImage?: string;
    AgentName: string;
    AgentAvatar?: string;
    TenantName: string;
    TenantAvatar?: string;
    LastMessageAt?: Date;
    LastMessagePreview?: string;
    UnreadCountForTenant: number;
    UnreadCountForAgent: number;
    IsArchivedByTenant: boolean;
    IsArchivedByAgent: boolean;
    IsBlocked: boolean;
    BlockedBy?: string;
    BlockReason?: string;
    UserRoleInConversation?: 'AGENT' | 'TENANT';
    UnreadCountForUser?: number;
}

export interface MessageReaction {
    ReactionType: string;
    UserName: string;
    UserAvatar?: string;
}

export interface Message {
    MessageId: string;
    ConversationId: string;
    SenderId: string;
    SenderName?: string;
    SenderAvatar?: string;
    SenderRole?: string;
    Content: string;
    MessageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT';
    MediaUrl?: string;
    ThumbnailUrl?: string;
    FileName?: string;
    FileSize?: number;
    MimeType?: string;
    CreatedAt: Date;
    ReadAt?: Date;
    DeliveredAt?: Date;
    IsEdited: boolean;
    EditedAt?: Date;
    IsDeleted: boolean;
    DeletedAt?: Date;
    DeletedBy?: string;
    HasUserReacted?: boolean;
    Reactions?: MessageReaction[] | string; // SQL returns stringified JSON
}

export class MessageService {
    private async getDb(): Promise<sql.ConnectionPool> {
        return getConnectionPool();
    }

    async getOrCreateConversation(propertyId: string, agentId: string, userId: string, initialMessage?: string, messageType?: string): Promise<{ ConversationId: string }> {
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
        } catch (error) {
            throw error;
        }
    }

    async getConversationById(conversationId: string): Promise<Conversation | null> {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(conversationId)) return null;

        const query = `SELECT * FROM vw_ConversationDetails WHERE ConversationId = @conversationId`;

        try {
            const result = await db.request()
                .input('conversationId', sql.UniqueIdentifier, conversationId)
                .query(query);
            return result.recordset[0] || null;
        } catch (error) {
            throw error;
        }
    }

    async getUserConversations(userId: string, role?: string, includeArchived: boolean = false): Promise<Conversation[]> {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(userId)) return [];

        try {
            const result = await db.request()
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('Role', sql.NVarChar, role || null)
                .input('IncludeArchived', sql.Bit, includeArchived)
                .execute('sp_GetUserConversations');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(params: {
        conversationId: string;
        senderId: string;
        content: string;
        messageType?: string;
        mediaUrl?: string;
        thumbnailUrl?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
    }): Promise<Message> {
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
        } catch (error) {
            throw error;
        }
    }

    async getMessages(conversationId: string, userId: string, beforeMessageId?: string): Promise<Message[]> {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(conversationId)) return [];

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
        } catch (error) {
            throw error;
        }
    }

    async markAsRead(conversationId: string, userId: string): Promise<number> {
        const db = await this.getDb();
        if (!ValidationUtils.isValidUUID(conversationId) || !ValidationUtils.isValidUUID(userId)) return 0;

        try {
            const result = await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .execute('sp_MarkMessagesAsRead');
            return result.recordset[0].MessagesRead;
        } catch (error) {
            throw error;
        }
    }

    async toggleArchive(conversationId: string, userId: string, archive: boolean): Promise<void> {
        const db = await this.getDb();
        try {
            await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('Archive', sql.Bit, archive)
                .execute('sp_ToggleArchiveConversation');
        } catch (error) {
            throw error;
        }
    }

    async toggleBlock(conversationId: string, userId: string, block: boolean, reason?: string): Promise<void> {
        const db = await this.getDb();
        try {
            await db.request()
                .input('ConversationId', sql.UniqueIdentifier, conversationId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('Block', sql.Bit, block)
                .input('BlockReason', sql.NVarChar, reason || null)
                .execute('sp_ToggleBlockConversation');
        } catch (error) {
            throw error;
        }
    }

    async deleteMessage(messageId: string, userId: string, forEveryone: boolean = false): Promise<void> {
        const db = await this.getDb();
        try {
            await db.request()
                .input('MessageId', sql.UniqueIdentifier, messageId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('ForEveryone', sql.Bit, forEveryone)
                .execute('sp_DeleteMessage');
        } catch (error) {
            throw error;
        }
    }

    async addReaction(messageId: string, userId: string, reactionType: string): Promise<string> {
        const db = await this.getDb();
        try {
            const result = await db.request()
                .input('MessageId', sql.UniqueIdentifier, messageId)
                .input('UserId', sql.UniqueIdentifier, userId)
                .input('ReactionType', sql.NVarChar, reactionType)
                .execute('sp_AddMessageReaction');
            return result.recordset[0].Action;
        } catch (error) {
            throw error;
        }
    }
}

export const messageService = new MessageService();
