export interface Conversation {
    ConversationId: string;
    PropertyId: string;
    AgentId: string;
    TenantId: string;
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
    Reactions?: MessageReaction[] | string;
}
export declare class MessageService {
    private mapDBToConversation;
    private mapDBToMessage;
    getOrCreateConversation(propertyId: string, agentId: string, userId: string, initialMessage?: string, messageType?: string): Promise<{
        ConversationId: string;
    }>;
    getConversationById(conversationId: string): Promise<Conversation | null>;
    getUserConversations(userId: string, role?: string, includeArchived?: boolean): Promise<Conversation[]>;
    sendMessage(params: {
        conversationId: string;
        senderId: string;
        content: string;
        messageType?: string;
        mediaUrl?: string;
        thumbnailUrl?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
    }): Promise<Message>;
    getMessages(conversationId: string, userId: string, beforeMessageId?: string): Promise<Message[]>;
    markAsRead(conversationId: string, userId: string): Promise<number>;
    toggleArchive(conversationId: string, userId: string, archive: boolean): Promise<void>;
    toggleBlock(conversationId: string, userId: string, block: boolean, reason?: string): Promise<void>;
    deleteMessage(messageId: string, userId: string, forEveryone?: boolean): Promise<void>;
    addReaction(messageId: string, userId: string, reactionType: string): Promise<string>;
}
export declare const messageService: MessageService;
//# sourceMappingURL=message.service.d.ts.map