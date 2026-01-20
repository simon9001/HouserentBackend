import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

// Frontend Interface (PascalCase)
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

export class MessageService {
    // Map database conversation to frontend interface
    private async mapDBToConversation(dbData: any): Promise<Conversation> {
        return {
            ConversationId: dbData.conversation_id,
            PropertyId: dbData.property_id,
            AgentId: dbData.agent_id,
            TenantId: dbData.user_id,
            PropertyTitle: dbData.property?.title || '',
            RentAmount: dbData.property?.rent_amount || 0,
            PropertyImage: dbData.property_image,
            AgentName: dbData.agent_name || 'Unknown Agent',
            AgentAvatar: dbData.agent_avatar,
            TenantName: dbData.tenant_name || 'Unknown Tenant',
            TenantAvatar: dbData.tenant_avatar,
            LastMessageAt: dbData.last_message_at,
            LastMessagePreview: dbData.last_message_preview,
            UnreadCountForTenant: dbData.unread_count_for_tenant || 0,
            UnreadCountForAgent: dbData.unread_count_for_agent || 0,
            IsArchivedByTenant: dbData.is_archived_by_tenant || false,
            IsArchivedByAgent: dbData.is_archived_by_agent || false,
            IsBlocked: dbData.is_blocked || false,
            BlockedBy: dbData.blocked_by,
            BlockReason: dbData.block_reason,
            CreatedAt: dbData.created_at
        };
    }

    // Map database message to frontend interface
    private mapDBToMessage(dbData: any): Message {
        return {
            MessageId: dbData.message_id,
            ConversationId: dbData.conversation_id,
            SenderId: dbData.sender_id,
            Content: dbData.content,
            MessageType: (dbData.message_type || 'TEXT') as Message['MessageType'],
            MediaUrl: dbData.media_url,
            ThumbnailUrl: dbData.thumbnail_url,
            FileName: dbData.file_name,
            FileSize: dbData.file_size,
            MimeType: dbData.mime_type,
            CreatedAt: dbData.created_at,
            ReadAt: dbData.read_at,
            DeliveredAt: dbData.delivered_at,
            IsEdited: dbData.is_edited,
            EditedAt: dbData.edited_at,
            IsDeleted: dbData.is_deleted,
            DeletedAt: dbData.deleted_at,
            DeletedBy: dbData.deleted_by,
            SenderName: dbData.sender_name,
            SenderAvatar: dbData.sender_avatar,
            SenderRole: dbData.sender_role
        };
    }

    // Get or create conversation
    async getOrCreateConversation(
        propertyId: string, 
        agentId: string, 
        userId: string, 
        initialMessage?: string, 
        messageType?: string
    ): Promise<{ ConversationId: string }> {
        console.log('Creating conversation:', { propertyId, agentId, userId, initialMessage });
        
        if (!ValidationUtils.isValidUUID(propertyId) || !ValidationUtils.isValidUUID(agentId) || !ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid ID format');
        }

        // Check existing conversation
        const { data: existing } = await supabase
            .from('conversations')
            .select('conversation_id')
            .eq('property_id', propertyId)
            .eq('agent_id', agentId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            console.log('Existing conversation found:', existing.conversation_id);
            
            if (initialMessage) {
                await this.sendMessage({
                    conversationId: existing.conversation_id,
                    senderId: userId,
                    content: initialMessage,
                    messageType: messageType || 'TEXT'
                });
            }
            return { ConversationId: existing.conversation_id };
        }

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                property_id: propertyId,
                agent_id: agentId,
                user_id: userId,
                last_message_at: new Date().toISOString(),
                last_message_preview: initialMessage ? initialMessage.substring(0, 200) : 'Started conversation',
                unread_count_for_tenant: 1,
                unread_count_for_agent: 0,
                is_archived_by_tenant: false,
                is_archived_by_agent: false,
                is_blocked: false,
                created_at: new Date().toISOString()
            })
            .select('conversation_id')
            .single();

        if (createError) {
            console.error('Error creating conversation:', createError);
            throw new Error(`Failed to create conversation: ${createError.message}`);
        }

        console.log('New conversation created:', newConversation.conversation_id);

        if (initialMessage) {
            await this.sendMessage({
                conversationId: newConversation.conversation_id,
                senderId: userId,
                content: initialMessage,
                messageType: messageType || 'TEXT'
            });
        }

        return { ConversationId: newConversation.conversation_id };
    }

    // Get user conversations - USING THE VIEW YOU CREATED
    async getUserConversations(
        userId: string, 
        role?: string, 
        includeArchived: boolean = false
    ): Promise<Conversation[]> {
        console.log('Getting conversations for user:', userId, 'role:', role);
        
        if (!ValidationUtils.isValidUUID(userId)) return [];

        // USE THE DATABASE VIEW vw_conversation_list
        let query = supabase
            .from('vw_conversation_list')
            .select('*')
            .order('last_message_at', { ascending: false });

        // Apply filters
        if (role === 'AGENT') {
            query = query.eq('agent_id', userId);
            if (!includeArchived) {
                query = query.eq('is_archived_by_agent', false);
            }
        } else if (role === 'TENANT') {
            query = query.eq('tenant_id', userId);
            if (!includeArchived) {
                query = query.eq('is_archived_by_tenant', false);
            }
        } else {
            // Get all conversations where user is either agent or tenant
            query = query.or(`agent_id.eq.${userId},tenant_id.eq.${userId}`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching conversations:', error);
            throw new Error(`Failed to fetch conversations: ${error.message}`);
        }

        console.log(`Found ${data?.length || 0} conversations`);

        // Map and enhance conversations
        const conversations = await Promise.all(
            (data || []).map(async (dbConv: any) => {
                const conversation = await this.mapDBToConversation(dbConv);
                
                // Determine user's role
                const isAgent = dbConv.agent_id === userId;
                conversation.UserRoleInConversation = isAgent ? 'AGENT' : 'TENANT';
                
                // Set unread count for user
                conversation.UnreadCountForUser = isAgent 
                    ? dbConv.unread_count_for_agent 
                    : dbConv.unread_count_for_tenant;
                
                return conversation;
            })
        );

        return conversations;
    }

    // Get messages for a conversation
    async getMessages(
        conversationId: string, 
        userId: string, 
        beforeMessageId?: string
    ): Promise<Message[]> {
        console.log('Getting messages for conversation:', conversationId);
        
        if (!ValidationUtils.isValidUUID(conversationId)) return [];

        try {
            // Mark as read for this user
            await this.markMessagesAsRead(conversationId, userId);

            // Fetch messages with sender info using PROPER JOIN syntax
            let query = supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id (
                        "FullName",
                        "AvatarUrl",
                        "Role"
                    )
                `)
                .eq('conversation_id', conversationId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true })
                .limit(100);

            if (beforeMessageId) {
                const { data: beforeMsg } = await supabase
                    .from('messages')
                    .select('created_at')
                    .eq('message_id', beforeMessageId)
                    .single();
                
                if (beforeMsg) {
                    query = query.lt('created_at', beforeMsg.created_at);
                }
            }

            const { data: messages, error } = await query;

            if (error) {
                console.error('Supabase error:', error);
                throw new Error(`Failed to fetch messages: ${error.message}`);
            }

            console.log(`Found ${messages?.length || 0} messages`);

            // Get reactions for each message
            const messagesWithReactions = await Promise.all(
                (messages || []).map(async (msg: any) => {
                    const message = this.mapDBToMessage({
                        ...msg,
                        sender_name: msg.sender?.FullName,
                        sender_avatar: msg.sender?.AvatarUrl,
                        sender_role: msg.sender?.Role
                    });
                    
                    // Get reactions
                    const { data: reactions } = await supabase
                        .from('message_reactions')
                        .select(`
                            reaction_type,
                            user:user_id (
                                "FullName",
                                "AvatarUrl"
                            )
                        `)
                        .eq('message_id', msg.message_id);

                    message.Reactions = (reactions || []).map((reaction: any) => ({
                        ReactionType: reaction.reaction_type,
                        UserName: reaction.user?.FullName || 'Unknown',
                        UserAvatar: reaction.user?.AvatarUrl
                    }));

                    return message;
                })
            );

            return messagesWithReactions;
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    // Send a message
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
        console.log('Sending message:', params);
        
        try {
            // Validate conversation exists
            const { data: conversation } = await supabase
                .from('conversations')
                .select('agent_id, user_id, is_blocked, unread_count_for_tenant')
                .eq('conversation_id', params.conversationId)
                .single();

            if (!conversation) {
                throw new Error('Conversation not found');
            }

            if (conversation.is_blocked) {
                throw new Error('This conversation is blocked');
            }

            // Insert message
            const { data: message, error: insertError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: params.conversationId,
                    sender_id: params.senderId,
                    content: params.content,
                    message_type: params.messageType || 'TEXT',
                    media_url: params.mediaUrl,
                    thumbnail_url: params.thumbnailUrl,
                    file_name: params.fileName,
                    file_size: params.fileSize,
                    mime_type: params.mimeType,
                    created_at: new Date().toISOString(),
                    delivered_at: new Date().toISOString(),
                    is_edited: false,
                    is_deleted: false
                })
                .select(`
                    *,
                    sender:sender_id (
                        "FullName",
                        "AvatarUrl",
                        "Role"
                    )
                `)
                .single();

            if (insertError) {
                console.error('Insert error:', insertError);
                throw new Error(`Failed to send message: ${insertError.message}`);
            }

            // Update conversation
            const updates: any = {
                last_message_at: new Date().toISOString(),
                last_message_preview: params.content.substring(0, 200)
            };

            // Update unread count
            if (params.senderId === conversation.agent_id) {
                // Sender is agent, increment tenant's unread count
                updates.unread_count_for_tenant = (conversation.unread_count_for_tenant || 0) + 1;
            } else {
                // Sender is tenant, increment agent's unread count
                updates.unread_count_for_agent = (conversation.unread_count_for_tenant || 0) + 1;
            }

            await supabase
                .from('conversations')
                .update(updates)
                .eq('conversation_id', params.conversationId);

            console.log('Message sent successfully');
            
            return this.mapDBToMessage({
                ...message,
                sender_name: message.sender?.FullName,
                sender_avatar: message.sender?.AvatarUrl,
                sender_role: message.sender?.Role
            });
        } catch (error: any) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Mark messages as read
    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        try {
            const { data: conversation } = await supabase
                .from('conversations')
                .select('agent_id, user_id')
                .eq('conversation_id', conversationId)
                .single();

            if (!conversation) return;

            const updates: any = {};
            
            if (userId === conversation.agent_id) {
                updates.unread_count_for_agent = 0;
            } else if (userId === conversation.user_id) {
                updates.unread_count_for_tenant = 0;
            }

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('conversations')
                    .update(updates)
                    .eq('conversation_id', conversationId);
            }

            // Mark all messages as read
            await supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('conversation_id', conversationId)
                .neq('sender_id', userId) // Only mark messages not sent by user as read
                .is('read_at', null);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    // Toggle archive
    async toggleArchive(conversationId: string, userId: string, archive: boolean): Promise<void> {
        try {
            const { data: conversation } = await supabase
                .from('conversations')
                .select('agent_id, user_id')
                .eq('conversation_id', conversationId)
                .single();

            if (!conversation) throw new Error('Conversation not found');

            const updates: any = {};
            
            if (userId === conversation.agent_id) {
                updates.is_archived_by_agent = archive;
            } else if (userId === conversation.user_id) {
                updates.is_archived_by_tenant = archive;
            } else {
                throw new Error('User is not a participant');
            }

            await supabase
                .from('conversations')
                .update(updates)
                .eq('conversation_id', conversationId);
        } catch (error: any) {
            console.error('Error toggling archive:', error);
            throw error;
        }
    }

    // Toggle block
    async toggleBlock(conversationId: string, userId: string, block: boolean, reason?: string): Promise<void> {
        try {
            const updates: any = {
                is_blocked: block,
                blocked_by: block ? userId : null,
                block_reason: block ? reason : null
            };

            await supabase
                .from('conversations')
                .update(updates)
                .eq('conversation_id', conversationId);
        } catch (error: any) {
            console.error('Error toggling block:', error);
            throw error;
        }
    }

    // Delete message
    async deleteMessage(messageId: string, userId: string, forEveryone: boolean = false): Promise<void> {
        try {
            if (forEveryone) {
                await supabase
                    .from('messages')
                    .update({ 
                        is_deleted: true, 
                        deleted_at: new Date().toISOString(),
                        content: 'This message was deleted',
                        deleted_by: userId
                    })
                    .eq('message_id', messageId);
            } else {
                // Soft delete for the user
                await supabase
                    .from('messages')
                    .update({ 
                        is_deleted: true, 
                        deleted_at: new Date().toISOString(),
                        deleted_by: userId 
                    })
                    .eq('message_id', messageId);
            }
        } catch (error: any) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    // Add reaction
    async addReaction(messageId: string, userId: string, reactionType: string): Promise<string> {
        try {
            // Check existing reaction
            const { data: existing } = await supabase
                .from('message_reactions')
                .select('reaction_id')
                .eq('message_id', messageId)
                .eq('user_id', userId)
                .eq('reaction_type', reactionType)
                .maybeSingle();

            if (existing) {
                // Remove existing
                await supabase
                    .from('message_reactions')
                    .delete()
                    .eq('reaction_id', existing.reaction_id);
                return 'REMOVED';
            } else {
                // Add new
                await supabase
                    .from('message_reactions')
                    .insert({
                        message_id: messageId,
                        user_id: userId,
                        reaction_type: reactionType,
                        created_at: new Date().toISOString()
                    });
                return 'ADDED';
            }
        } catch (error: any) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    }
}

export const messageService = new MessageService();