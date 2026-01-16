import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class MessageService {
    // Helper to map DB result to Conversation interface
    mapDBToConversation(data) {
        if (!data)
            return data;
        // Process property image
        let propertyImage = null;
        if (data.properties?.images) { // properties joined as snake_case -> properties.images (assuming properties table is snake_case properties, column images)
            // But properties table usually has `images` as array or string
            // Wait, properties table cols are `images` (snake_case).
            const imgs = typeof data.properties.images === 'string' ? JSON.parse(data.properties.images) : data.properties.images;
            propertyImage = Array.isArray(imgs) ? imgs[0] : imgs;
        }
        return {
            ConversationId: data.conversation_id,
            PropertyId: data.property_id,
            AgentId: data.agent_id,
            TenantId: data.tenant_id,
            PropertyTitle: data.properties?.title,
            RentAmount: data.properties?.rent_amount,
            PropertyImage: propertyImage,
            AgentName: data.agents?.FullName, // Joined Users table (PascalCase) -> Agents alias
            AgentAvatar: data.agents?.AvatarUrl,
            TenantName: data.tenants?.FullName,
            TenantAvatar: data.tenants?.AvatarUrl,
            LastMessageAt: data.last_message_at,
            LastMessagePreview: data.last_message_preview,
            UnreadCountForTenant: data.unread_count_for_tenant || 0,
            UnreadCountForAgent: data.unread_count_for_agent || 0,
            IsArchivedByTenant: data.is_archived_by_tenant || false,
            IsArchivedByAgent: data.is_archived_by_agent || false,
            IsBlocked: data.is_blocked || false,
            BlockedBy: data.blocked_by,
            BlockReason: data.block_reason
        };
    }
    // Helper to map DB result to Message interface
    mapDBToMessage(data) {
        if (!data)
            return data;
        return {
            MessageId: data.message_id,
            ConversationId: data.conversation_id,
            SenderId: data.sender_id,
            Content: data.content,
            MessageType: data.message_type,
            MediaUrl: data.media_url,
            ThumbnailUrl: data.thumbnail_url,
            FileName: data.file_name,
            FileSize: data.file_size,
            MimeType: data.mime_type,
            CreatedAt: data.created_at,
            ReadAt: data.read_at,
            DeliveredAt: data.delivered_at,
            IsEdited: data.is_edited,
            EditedAt: data.edited_at,
            IsDeleted: data.is_deleted,
            DeletedAt: data.deleted_at,
            DeletedBy: data.deleted_by,
            SenderName: data.senders?.FullName,
            SenderAvatar: data.senders?.AvatarUrl,
            SenderRole: data.senders?.Role,
            Reactions: data.reactions ? (typeof data.reactions === 'string' ? JSON.parse(data.reactions) : data.reactions) : []
        };
    }
    async getOrCreateConversation(propertyId, agentId, userId, initialMessage, messageType) {
        if (!ValidationUtils.isValidUUID(propertyId) || !ValidationUtils.isValidUUID(agentId) || !ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid ID format');
        }
        // Check for existing conversation
        const { data: existing } = await supabase
            .from('conversations')
            .select('conversation_id')
            .eq('property_id', propertyId)
            .eq('agent_id', agentId)
            .eq('tenant_id', userId)
            .single();
        if (existing) {
            // If initial message provided, send it
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
        const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({
            property_id: propertyId,
            agent_id: agentId,
            tenant_id: userId,
            last_message_at: new Date().toISOString(),
            last_message_preview: initialMessage || 'Started conversation'
        })
            .select('conversation_id')
            .single();
        if (createError)
            throw new Error(createError.message);
        // If initial message provided, send it
        if (initialMessage) {
            await this.sendMessage({
                conversationId: newConv.conversation_id,
                senderId: userId,
                content: initialMessage,
                messageType: messageType || 'TEXT'
            });
        }
        return { ConversationId: newConv.conversation_id };
    }
    async getConversationById(conversationId) {
        if (!ValidationUtils.isValidUUID(conversationId))
            return null;
        // Simulate `vw_ConversationDetails` with joins
        // agents and tenants are aliases for Users table via FKs usually named agent_id, tenant_id
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                properties:property_id (title, rent_amount, images),
                agents:agent_id!inner (FullName, AvatarUrl),
                tenants:tenant_id!inner (FullName, AvatarUrl)
            `)
            .eq('conversation_id', conversationId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return this.mapDBToConversation(data);
    }
    async getUserConversations(userId, role, includeArchived = false) {
        if (!ValidationUtils.isValidUUID(userId))
            return [];
        let query = supabase
            .from('conversations')
            .select(`
                *,
                properties:property_id (title, rent_amount, images),
                agents:agent_id!inner (FullName, AvatarUrl),
                tenants:tenant_id!inner (FullName, AvatarUrl)
            `)
            .order('last_message_at', { ascending: false });
        if (role === 'AGENT') {
            query = query.eq('agent_id', userId);
            if (!includeArchived)
                query = query.eq('is_archived_by_agent', false);
        }
        else if (role === 'TENANT') {
            query = query.eq('tenant_id', userId);
            if (!includeArchived)
                query = query.eq('is_archived_by_tenant', false);
        }
        else {
            // Check both columns
            query = query.or(`agent_id.eq.${userId},tenant_id.eq.${userId}`);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data.map((d) => {
            const mapped = this.mapDBToConversation(d);
            // Determine user role and unread count dynamically
            const userRoleInConv = d.agent_id === userId ? 'AGENT' : 'TENANT';
            const unreadCount = userRoleInConv === 'AGENT' ? (d.unread_count_for_agent || 0) : (d.unread_count_for_tenant || 0);
            mapped.UserRoleInConversation = userRoleInConv;
            mapped.UnreadCountForUser = unreadCount;
            return mapped;
        });
    }
    async sendMessage(params) {
        // Insert message
        const { data: message, error } = await supabase
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
            is_deleted: false,
            is_edited: false
        })
            .select('*')
            .single();
        if (error)
            throw error;
        // Update conversation LastMessageAt, LastMessagePreview, and increment unread counts
        const { data: conv } = await supabase.from('conversations').select('agent_id, tenant_id').eq('conversation_id', params.conversationId).single();
        if (conv) {
            const updates = {
                last_message_at: new Date().toISOString(),
                last_message_preview: params.messageType === 'TEXT' ? params.content : `Sent a ${params.messageType?.toLowerCase()}`
            };
            // If sender is Agent, increment Tenant unread. If sender is Tenant, increment Agent unread.
            if (params.senderId === conv.agent_id) {
                const { data: current } = await supabase.from('conversations').select('unread_count_for_tenant').eq('conversation_id', params.conversationId).single();
                if (current) {
                    updates.unread_count_for_tenant = (current.unread_count_for_tenant || 0) + 1;
                }
            }
            else {
                const { data: current } = await supabase.from('conversations').select('unread_count_for_agent').eq('conversation_id', params.conversationId).single();
                if (current) {
                    updates.unread_count_for_agent = (current.unread_count_for_agent || 0) + 1;
                }
            }
            await supabase.from('conversations').update(updates).eq('conversation_id', params.conversationId);
        }
        return this.mapDBToMessage(message);
    }
    async getMessages(conversationId, userId, beforeMessageId) {
        if (!ValidationUtils.isValidUUID(conversationId))
            return [];
        // 1. Mark as read
        const { data: conv } = await supabase.from('conversations').select('agent_id, tenant_id').eq('conversation_id', conversationId).single();
        if (conv) {
            const updates = {};
            if (userId === conv.agent_id) {
                updates.unread_count_for_agent = 0;
            }
            else if (userId === conv.tenant_id) {
                updates.unread_count_for_tenant = 0;
            }
            if (Object.keys(updates).length > 0) {
                await supabase.from('conversations').update(updates).eq('conversation_id', conversationId);
            }
        }
        // 2. Fetch messages
        let query = supabase
            .from('messages')
            .select(`
                *,
                senders:sender_id (FullName, AvatarUrl, Role)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (beforeMessageId) {
            const { data: beforeMsg } = await supabase.from('messages').select('created_at').eq('message_id', beforeMessageId).single();
            if (beforeMsg) {
                query = query.lt('created_at', beforeMsg.created_at);
            }
        }
        const { data, error } = await query;
        if (error) {
            console.error('❌ Error in getMessages:', error);
            throw error;
        }
        return data.map((msg) => this.mapDBToMessage(msg));
    }
    async markAsRead(conversationId, userId) {
        if (!ValidationUtils.isValidUUID(conversationId) || !ValidationUtils.isValidUUID(userId))
            return 0;
        const { data: conv } = await supabase.from('conversations').select('agent_id, tenant_id').eq('conversation_id', conversationId).single();
        if (!conv)
            return 0;
        const updates = {};
        if (userId === conv.agent_id) {
            updates.unread_count_for_agent = 0;
        }
        else if (userId === conv.tenant_id) {
            updates.unread_count_for_tenant = 0;
        }
        else {
            return 0; // Not a participant
        }
        const { error } = await supabase.from('conversations').update(updates).eq('conversation_id', conversationId);
        if (error)
            throw error;
        return 1;
    }
    async toggleArchive(conversationId, userId, archive) {
        const { data: conv } = await supabase.from('conversations').select('agent_id, tenant_id').eq('conversation_id', conversationId).single();
        if (!conv)
            throw new Error('Conversation not found');
        const updates = {};
        if (userId === conv.agent_id) {
            updates.is_archived_by_agent = archive;
        }
        else if (userId === conv.tenant_id) {
            updates.is_archived_by_tenant = archive;
        }
        else {
            throw new Error('User is not a participant');
        }
        await supabase.from('conversations').update(updates).eq('conversation_id', conversationId);
    }
    async toggleBlock(conversationId, userId, block, reason) {
        const updates = {
            is_blocked: block,
            blocked_by: block ? userId : null,
            block_reason: block ? reason : null
        };
        await supabase.from('conversations').update(updates).eq('conversation_id', conversationId);
    }
    async deleteMessage(messageId, userId, forEveryone = false) {
        if (forEveryone) {
            const { data: msg } = await supabase.from('messages').select('sender_id').eq('message_id', messageId).single();
            if (msg && msg.sender_id === userId) {
                await supabase.from('messages').update({ is_deleted: true, deleted_at: new Date().toISOString(), content: 'This message was deleted' }).eq('message_id', messageId);
            }
        }
        else {
            // Soft delete for default
            await supabase.from('messages').update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: userId }).eq('message_id', messageId);
        }
    }
    async addReaction(messageId, userId, reactionType) {
        const { data: existing } = await supabase
            .from('message_reactions')
            .select('reaction_id')
            .eq('message_id', messageId)
            .eq('user_id', userId)
            .eq('reaction_type', reactionType)
            .single();
        if (existing) {
            await supabase.from('message_reactions').delete().eq('reaction_id', existing.reaction_id);
            return 'REMOVED';
        }
        else {
            await supabase.from('message_reactions').insert({
                message_id: messageId,
                user_id: userId,
                reaction_type: reactionType,
                created_at: new Date().toISOString()
            });
            return 'ADDED';
        }
    }
}
export const messageService = new MessageService();
//# sourceMappingURL=message.service.js.map