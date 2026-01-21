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
    LastMessageAt?: string;
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
    CreatedAt: string;
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
    CreatedAt: string;
    ReadAt?: string;
    DeliveredAt?: string;
    IsEdited: boolean;
    EditedAt?: string;
    IsDeleted: boolean;
    DeletedAt?: string;
    DeletedBy?: string;
    HasUserReacted?: boolean;
    Reactions?: MessageReaction[];
}
export declare class MessageService {
    private mapDBToConversation;
    private mapDBToMessage;
    getOrCreateConversation(propertyId: string, agentId: string, userId: string, initialMessage?: string, messageType?: string): Promise<{
        ConversationId: string;
    }>;
    getUserConversations(userId: string, role?: string, includeArchived?: boolean): Promise<Conversation[]>;
    getMessages(conversationId: string, userId: string, beforeMessageId?: string): Promise<Message[]>;
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
    markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
    toggleArchive(conversationId: string, userId: string, archive: boolean): Promise<void>;
    toggleBlock(conversationId: string, userId: string, block: boolean, reason?: string): Promise<void>;
    deleteMessage(messageId: string, userId: string, forEveryone?: boolean): Promise<void>;
    addReaction(messageId: string, userId: string, reactionType: string): Promise<string>;
}
export declare const messageService: MessageService;
//# sourceMappingURL=message.service.d.ts.map