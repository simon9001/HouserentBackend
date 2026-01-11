-- -- Conversations Table
-- CREATE TABLE Conversations (
--     ConversationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
--     PropertyId UNIQUEIDENTIFIER NOT NULL,
--     AgentId UNIQUEIDENTIFIER NOT NULL,
--     UserId UNIQUEIDENTIFIER NOT NULL, -- The Tenant
--     CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
--     -- Additional fields for better conversation management
--     LastMessageAt DATETIME2 NULL,
--     LastMessagePreview NVARCHAR(200) NULL,
--     UnreadCountForTenant INT NOT NULL DEFAULT 0,
--     UnreadCountForAgent INT NOT NULL DEFAULT 0,
--     IsArchivedByTenant BIT NOT NULL DEFAULT 0,
--     IsArchivedByAgent BIT NOT NULL DEFAULT 0,
--     IsBlocked BIT NOT NULL DEFAULT 0,
--     BlockedBy UNIQUEIDENTIFIER NULL,
--     BlockReason NVARCHAR(500) NULL,
    
--     CONSTRAINT FK_Conversation_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE CASCADE,
--     CONSTRAINT FK_Conversation_Agent FOREIGN KEY (AgentId) REFERENCES Users(UserId) ON DELETE NO ACTION,
--     CONSTRAINT FK_Conversation_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
--     CONSTRAINT UQ_Property_Agent_User UNIQUE (PropertyId, AgentId, UserId)
-- );
-- GO

-- -- Messages Table
-- CREATE TABLE Messages (
--     MessageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
--     ConversationId UNIQUEIDENTIFIER NOT NULL,
--     SenderId UNIQUEIDENTIFIER NOT NULL,
--     Content NVARCHAR(MAX) NOT NULL,
--     MessageType NVARCHAR(20) NOT NULL DEFAULT 'TEXT' CHECK (MessageType IN ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CONTACT')),
--     MediaUrl NVARCHAR(500) NULL,
--     ThumbnailUrl NVARCHAR(500) NULL,
--     FileName NVARCHAR(255) NULL,
--     FileSize INT NULL,
--     MimeType NVARCHAR(100) NULL,
--     CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
--     ReadAt DATETIME2 NULL,
--     DeliveredAt DATETIME2 NULL,
--     IsEdited BIT NOT NULL DEFAULT 0,
--     EditedAt DATETIME2 NULL,
--     IsDeleted BIT NOT NULL DEFAULT 0,
--     DeletedAt DATETIME2 NULL,
--     DeletedBy UNIQUEIDENTIFIER NULL,
    
--     CONSTRAINT FK_Message_Conversation FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId) ON DELETE CASCADE,
--     CONSTRAINT FK_Message_Sender FOREIGN KEY (SenderId) REFERENCES Users(UserId) ON DELETE NO ACTION
-- );
-- GO

-- -- Message Reactions Table
-- CREATE TABLE MessageReactions (
--     ReactionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
--     MessageId UNIQUEIDENTIFIER NOT NULL,
--     UserId UNIQUEIDENTIFIER NOT NULL,
--     ReactionType NVARCHAR(20) NOT NULL DEFAULT 'LIKE' 
--         CHECK (ReactionType IN ('LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY')),
--     CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
--     CONSTRAINT FK_Reaction_Message FOREIGN KEY (MessageId) REFERENCES Messages(MessageId) ON DELETE CASCADE,
--     CONSTRAINT FK_Reaction_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    
--     UNIQUE (MessageId, UserId)
-- );
-- GO


-- -- Indexes for performance
-- CREATE INDEX IX_Conversations_Property ON Conversations(PropertyId);
-- CREATE INDEX IX_Conversations_User ON Conversations(UserId);
-- CREATE INDEX IX_Conversations_Agent ON Conversations(AgentId);
-- CREATE INDEX IX_Conversations_LastMessageAt ON Conversations(LastMessageAt);
-- CREATE INDEX IX_Conversations_Property_Agent_User ON Conversations(PropertyId, AgentId, UserId) INCLUDE (LastMessageAt, UnreadCountForTenant, UnreadCountForAgent);

-- CREATE INDEX IX_Messages_Conversation ON Messages(ConversationId);
-- CREATE INDEX IX_Messages_Sender ON Messages(SenderId);
-- CREATE INDEX IX_Messages_CreatedAt ON Messages(CreatedAt) INCLUDE (ConversationId, SenderId, Content, MessageType);
-- CREATE INDEX IX_Messages_Conversation_CreatedAt ON Messages(ConversationId, CreatedAt DESC);

-- CREATE INDEX IX_MessageReactions_Message ON MessageReactions(MessageId);
-- CREATE INDEX IX_MessageReactions_User ON MessageReactions(UserId);
-- GO

-- -- Trigger to update conversation last message info
-- CREATE TRIGGER trg_UpdateConversationOnMessage
-- ON Messages
-- AFTER INSERT
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     UPDATE c
--     SET 
--         LastMessageAt = i.CreatedAt,
--         LastMessagePreview = CASE 
--             WHEN i.MessageType = 'TEXT' THEN LEFT(i.Content, 200)
--             WHEN i.MessageType = 'IMAGE' THEN '📷 Image'
--             WHEN i.MessageType = 'VIDEO' THEN '🎥 Video'
--             WHEN i.MessageType = 'DOCUMENT' THEN '📄 Document'
--             WHEN i.MessageType = 'LOCATION' THEN '📍 Location'
--             WHEN i.MessageType = 'CONTACT' THEN '👤 Contact'
--             ELSE 'New message'
--         END,
--         UnreadCountForTenant = CASE 
--             WHEN i.SenderId = c.AgentId THEN UnreadCountForTenant + 1
--             ELSE UnreadCountForTenant
--         END,
--         UnreadCountForAgent = CASE 
--             WHEN i.SenderId = c.UserId THEN UnreadCountForAgent + 1
--             ELSE UnreadCountForAgent
--         END
--     FROM Conversations c
--     INNER JOIN inserted i ON c.ConversationId = i.ConversationId;
-- END;
-- GO

-- -- Trigger to update conversation when message is read
-- CREATE TRIGGER trg_UpdateConversationOnMessageRead
-- ON Messages
-- AFTER UPDATE
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     IF UPDATE(ReadAt)
--     BEGIN
--         UPDATE c
--         SET 
--             UnreadCountForTenant = CASE 
--                 WHEN i.SenderId = c.AgentId AND i.ReadAt IS NOT NULL 
--                 THEN GREATEST(UnreadCountForTenant - 1, 0)
--                 ELSE UnreadCountForTenant
--             END,
--             UnreadCountForAgent = CASE 
--                 WHEN i.SenderId = c.UserId AND i.ReadAt IS NOT NULL 
--                 THEN GREATEST(UnreadCountForAgent - 1, 0)
--                 ELSE UnreadCountForAgent
--             END
--         FROM Conversations c
--         INNER JOIN inserted i ON c.ConversationId = i.ConversationId
--         WHERE i.ReadAt IS NOT NULL;
--     END
-- END;
-- GO

-- -- View for conversations with user info
-- CREATE VIEW vw_ConversationDetails AS
-- SELECT 
--     c.ConversationId,
--     c.PropertyId,
--     c.AgentId,
--     c.UserId as TenantId,
--     p.Title as PropertyTitle,
--     p.RentAmount,
--     pm.MediaUrl as PropertyImage,
--     a.UserId as AgentUserId,
--     a.FullName as AgentName,
--     a.Email as AgentEmail,
--     a.PhoneNumber as AgentPhone,
--     a.AvatarUrl as AgentAvatar,
--     t.UserId as TenantUserId,
--     t.FullName as TenantName,
--     t.Email as TenantEmail,
--     t.PhoneNumber as TenantPhone,
--     t.AvatarUrl as TenantAvatar,
--     c.LastMessageAt,
--     c.LastMessagePreview,
--     c.UnreadCountForTenant,
--     c.UnreadCountForAgent,
--     c.CreatedAt as ConversationCreatedAt,
--     c.IsArchivedByTenant,
--     c.IsArchivedByAgent,
--     c.IsBlocked,
--     c.BlockedBy,
--     c.BlockReason
-- FROM Conversations c
-- INNER JOIN Properties p ON c.PropertyId = p.PropertyId
-- LEFT JOIN PropertyMedia pm ON p.PropertyId = pm.PropertyId AND pm.IsPrimary = 1
-- INNER JOIN Users a ON c.AgentId = a.UserId
-- INNER JOIN Users t ON c.UserId = t.UserId;
-- GO

-- -- View for messages with sender info
-- CREATE VIEW vw_MessageDetails AS
-- SELECT 
--     m.MessageId,
--     m.ConversationId,
--     m.SenderId,
--     u.FullName as SenderName,
--     u.AvatarUrl as SenderAvatar,
--     u.Role as SenderRole,
--     m.Content,
--     m.MessageType,
--     m.MediaUrl,
--     m.ThumbnailUrl,
--     m.FileName,
--     m.FileSize,
--     m.MimeType,
--     m.CreatedAt,
--     m.ReadAt,
--     m.DeliveredAt,
--     m.IsEdited,
--     m.EditedAt,
--     m.IsDeleted,
--     m.DeletedAt,
--     m.DeletedBy,
--     c.PropertyId,
--     c.AgentId,
--     c.UserId as TenantId
-- FROM Messages m
-- INNER JOIN Conversations c ON m.ConversationId = c.ConversationId
-- INNER JOIN Users u ON m.SenderId = u.UserId;
-- GO

-- -- Stored procedure for starting a new conversation
-- CREATE PROCEDURE sp_StartConversation
--     @PropertyId UNIQUEIDENTIFIER,
--     @AgentId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER,
--     @InitialMessage NVARCHAR(MAX) = NULL,
--     @MessageType NVARCHAR(20) = 'TEXT'
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     BEGIN TRANSACTION;
    
--     DECLARE @ConversationId UNIQUEIDENTIFIER;
--     DECLARE @MessageId UNIQUEIDENTIFIER;
    
--     BEGIN TRY
--         -- Check if conversation already exists
--         SELECT @ConversationId = ConversationId
--         FROM Conversations
--         WHERE PropertyId = @PropertyId
--           AND AgentId = @AgentId
--           AND UserId = @UserId;
        
--         -- If conversation doesn't exist, create it
--         IF @ConversationId IS NULL
--         BEGIN
--             SET @ConversationId = NEWID();
            
--             INSERT INTO Conversations (
--                 ConversationId,
--                 PropertyId,
--                 AgentId,
--                 UserId,
--                 CreatedAt,
--                 LastMessageAt,
--                 LastMessagePreview
--             ) VALUES (
--                 @ConversationId,
--                 @PropertyId,
--                 @AgentId,
--                 @UserId,
--                 SYSDATETIME(),
--                 SYSDATETIME(),
--                 CASE 
--                     WHEN @InitialMessage IS NOT NULL AND @MessageType = 'TEXT' 
--                     THEN LEFT(@InitialMessage, 200)
--                     WHEN @MessageType = 'IMAGE' THEN '📷 Image'
--                     WHEN @MessageType = 'VIDEO' THEN '🎥 Video'
--                     WHEN @MessageType = 'DOCUMENT' THEN '📄 Document'
--                     WHEN @MessageType = 'LOCATION' THEN '📍 Location'
--                     WHEN @MessageType = 'CONTACT' THEN '👤 Contact'
--                     ELSE 'New conversation'
--                 END
--             );
            
--             -- Set initial unread count for agent
--             UPDATE Conversations
--             SET UnreadCountForAgent = 1
--             WHERE ConversationId = @ConversationId;
--         END
        
--         -- Add initial message if provided
--         IF @InitialMessage IS NOT NULL
--         BEGIN
--             SET @MessageId = NEWID();
            
--             INSERT INTO Messages (
--                 MessageId,
--                 ConversationId,
--                 SenderId,
--                 Content,
--                 MessageType,
--                 CreatedAt,
--                 DeliveredAt
--             ) VALUES (
--                 @MessageId,
--                 @ConversationId,
--                 @UserId,
--                 @InitialMessage,
--                 @MessageType,
--                 SYSDATETIME(),
--                 SYSDATETIME()
--             );
--         END
        
--         -- Return the conversation ID
--         SELECT @ConversationId as ConversationId;
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         ROLLBACK TRANSACTION;
--         THROW;
--     END CATCH
-- END;
-- GO

-- -- Stored procedure for sending a message
-- CREATE PROCEDURE sp_SendMessage
--     @ConversationId UNIQUEIDENTIFIER,
--     @SenderId UNIQUEIDENTIFIER,
--     @Content NVARCHAR(MAX),
--     @MessageType NVARCHAR(20) = 'TEXT',
--     @MediaUrl NVARCHAR(500) = NULL,
--     @ThumbnailUrl NVARCHAR(500) = NULL,
--     @FileName NVARCHAR(255) = NULL,
--     @FileSize INT = NULL,
--     @MimeType NVARCHAR(100) = NULL
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     BEGIN TRANSACTION;
    
--     DECLARE @MessageId UNIQUEIDENTIFIER;
--     DECLARE @AgentId UNIQUEIDENTIFIER;
--     DECLARE @UserId UNIQUEIDENTIFIER;
    
--     BEGIN TRY
--         -- Get conversation participants
--         SELECT @AgentId = AgentId, @UserId = UserId
--         FROM Conversations
--         WHERE ConversationId = @ConversationId;
        
--         IF @AgentId IS NULL
--         BEGIN
--             THROW 50000, 'Conversation not found', 1;
--         END
        
--         -- Check if conversation is blocked
--         DECLARE @IsBlocked BIT;
--         SELECT @IsBlocked = IsBlocked
--         FROM Conversations
--         WHERE ConversationId = @ConversationId;
        
--         IF @IsBlocked = 1
--         BEGIN
--             THROW 50001, 'This conversation is blocked', 1;
--         END
        
--         -- Create the message
--         SET @MessageId = NEWID();
        
--         INSERT INTO Messages (
--             MessageId,
--             ConversationId,
--             SenderId,
--             Content,
--             MessageType,
--             MediaUrl,
--             ThumbnailUrl,
--             FileName,
--             FileSize,
--             MimeType,
--             CreatedAt,
--             DeliveredAt
--         ) VALUES (
--             @MessageId,
--             @ConversationId,
--             @SenderId,
--             @Content,
--             @MessageType,
--             @MediaUrl,
--             @ThumbnailUrl,
--             @FileName,
--             @FileSize,
--             @MimeType,
--             SYSDATETIME(),
--             SYSDATETIME()
--         );
        
--         -- Update conversation unread counts
--         UPDATE Conversations
--         SET 
--             LastMessageAt = SYSDATETIME(),
--             LastMessagePreview = CASE 
--                 WHEN @MessageType = 'TEXT' THEN LEFT(@Content, 200)
--                 WHEN @MessageType = 'IMAGE' THEN '📷 Image'
--                 WHEN @MessageType = 'VIDEO' THEN '🎥 Video'
--                 WHEN @MessageType = 'DOCUMENT' THEN '📄 Document'
--                 WHEN @MessageType = 'LOCATION' THEN '📍 Location'
--                 WHEN @MessageType = 'CONTACT' THEN '👤 Contact'
--                 ELSE 'New message'
--             END,
--             UnreadCountForTenant = CASE 
--                 WHEN @SenderId = @AgentId THEN UnreadCountForTenant + 1
--                 ELSE UnreadCountForTenant
--             END,
--             UnreadCountForAgent = CASE 
--                 WHEN @SenderId = @UserId THEN UnreadCountForAgent + 1
--                 ELSE UnreadCountForAgent
--             END
--         WHERE ConversationId = @ConversationId;
        
--         -- Return the message
--         SELECT 
--             m.MessageId,
--             m.ConversationId,
--             m.SenderId,
--             u.FullName as SenderName,
--             u.AvatarUrl as SenderAvatar,
--             u.Role as SenderRole,
--             m.Content,
--             m.MessageType,
--             m.MediaUrl,
--             m.ThumbnailUrl,
--             m.FileName,
--             m.FileSize,
--             m.MimeType,
--             m.CreatedAt,
--             m.ReadAt,
--             m.DeliveredAt,
--             m.IsEdited,
--             m.EditedAt,
--             m.IsDeleted,
--             m.DeletedAt
--         FROM Messages m
--         INNER JOIN Users u ON m.SenderId = u.UserId
--         WHERE m.MessageId = @MessageId;
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         ROLLBACK TRANSACTION;
--         THROW;
--     END CATCH
-- END;
-- GO

-- -- Stored procedure for marking messages as read
-- CREATE PROCEDURE sp_MarkMessagesAsRead
--     @ConversationId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     BEGIN TRANSACTION;
    
--     DECLARE @AgentId UNIQUEIDENTIFIER;
--     DECLARE @TenantId UNIQUEIDENTIFIER;
    
--     BEGIN TRY
--         -- Get conversation participants
--         SELECT @AgentId = AgentId, @TenantId = UserId
--         FROM Conversations
--         WHERE ConversationId = @ConversationId;
        
--         IF @AgentId IS NULL
--         BEGIN
--             THROW 50000, 'Conversation not found', 1;
--         END
        
--         -- Determine which messages to mark as read
--         DECLARE @MessagesToUpdate TABLE (MessageId UNIQUEIDENTIFIER);
        
--         INSERT INTO @MessagesToUpdate (MessageId)
--         SELECT MessageId
--         FROM Messages
--         WHERE ConversationId = @ConversationId
--           AND ReadAt IS NULL
--           AND SenderId <> @UserId;
        
--         -- Update messages
--         UPDATE Messages
--         SET ReadAt = SYSDATETIME()
--         WHERE MessageId IN (SELECT MessageId FROM @MessagesToUpdate);
        
--         -- Update conversation unread counts
--         IF @UserId = @TenantId
--         BEGIN
--             UPDATE Conversations
--             SET UnreadCountForTenant = 0
--             WHERE ConversationId = @ConversationId;
--         END
--         ELSE IF @UserId = @AgentId
--         BEGIN
--             UPDATE Conversations
--             SET UnreadCountForAgent = 0
--             WHERE ConversationId = @ConversationId;
--         END
        
--         -- Return count of messages marked as read
--         SELECT COUNT(*) as MessagesRead
--         FROM @MessagesToUpdate;
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         ROLLBACK TRANSACTION;
--         THROW;
--     END CATCH
-- END;
-- GO

-- -- Stored procedure for getting conversation list for a user
-- CREATE PROCEDURE sp_GetUserConversations
--     @UserId UNIQUEIDENTIFIER,
--     @Role NVARCHAR(20) = NULL,
--     @IncludeArchived BIT = 0,
--     @PageNumber INT = 1,
--     @PageSize INT = 20
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @AgentConversations BIT = 0;
--     DECLARE @TenantConversations BIT = 0;
    
--     -- Determine which conversations to show based on role
--     IF @Role IS NULL
--     BEGIN
--         -- User hasn't specified role, check both
--         SET @AgentConversations = 1;
--         SET @TenantConversations = 1;
--     END
--     ELSE IF @Role = 'AGENT'
--     BEGIN
--         SET @AgentConversations = 1;
--     END
--     ELSE IF @Role = 'TENANT'
--     BEGIN
--         SET @TenantConversations = 1;
--     END
    
--     -- Calculate offset
--     DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
--     -- Get conversations
--     SELECT 
--         c.ConversationId,
--         c.PropertyId,
--         c.AgentId,
--         c.UserId as TenantId,
--         p.Title as PropertyTitle,
--         p.RentAmount,
--         pm.MediaUrl as PropertyImage,
--         a.FullName as AgentName,
--         a.AvatarUrl as AgentAvatar,
--         t.FullName as TenantName,
--         t.AvatarUrl as TenantAvatar,
--         c.LastMessageAt,
--         c.LastMessagePreview,
--         c.UnreadCountForTenant,
--         c.UnreadCountForAgent,
--         c.CreatedAt as ConversationCreatedAt,
--         c.IsArchivedByTenant,
--         c.IsArchivedByAgent,
--         c.IsBlocked,
--         CASE 
--             WHEN c.AgentId = @UserId THEN 'AGENT'
--             ELSE 'TENANT'
--         END as UserRoleInConversation,
--         CASE 
--             WHEN c.AgentId = @UserId THEN UnreadCountForAgent
--             ELSE UnreadCountForTenant
--         END as UnreadCountForUser
--     FROM Conversations c
--     INNER JOIN Properties p ON c.PropertyId = p.PropertyId
--     LEFT JOIN PropertyMedia pm ON p.PropertyId = pm.PropertyId AND pm.IsPrimary = 1
--     INNER JOIN Users a ON c.AgentId = a.UserId
--     INNER JOIN Users t ON c.UserId = t.UserId
--     WHERE (
--         (@AgentConversations = 1 AND c.AgentId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByAgent = 0))
--         OR
--         (@TenantConversations = 1 AND c.UserId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByTenant = 0))
--     )
--     AND c.IsBlocked = 0
--     ORDER BY c.LastMessageAt DESC
--     OFFSET @Offset ROWS
--     FETCH NEXT @PageSize ROWS ONLY;
    
--     -- Get total count
--     SELECT COUNT(*) as TotalCount
--     FROM Conversations c
--     WHERE (
--         (@AgentConversations = 1 AND c.AgentId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByAgent = 0))
--         OR
--         (@TenantConversations = 1 AND c.UserId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByTenant = 0))
--     )
--     AND c.IsBlocked = 0;
-- END;
-- GO

-- -- Stored procedure for getting messages in a conversation
-- CREATE PROCEDURE sp_GetConversationMessages
--     @ConversationId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER,
--     @BeforeMessageId UNIQUEIDENTIFIER = NULL,
--     @PageSize INT = 50
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     -- First, mark messages as read if they're from the other participant
--     EXEC sp_MarkMessagesAsRead @ConversationId = @ConversationId, @UserId = @UserId;
    
--     -- Get messages
--     SELECT 
--         m.MessageId,
--         m.ConversationId,
--         m.SenderId,
--         u.FullName as SenderName,
--         u.AvatarUrl as SenderAvatar,
--         u.Role as SenderRole,
--         m.Content,
--         m.MessageType,
--         m.MediaUrl,
--         m.ThumbnailUrl,
--         m.FileName,
--         m.FileSize,
--         m.MimeType,
--         m.CreatedAt,
--         m.ReadAt,
--         m.DeliveredAt,
--         m.IsEdited,
--         m.EditedAt,
--         m.IsDeleted,
--         m.DeletedAt,
--         m.DeletedBy,
--         CASE 
--             WHEN EXISTS (
--                 SELECT 1 FROM MessageReactions mr 
--                 WHERE mr.MessageId = m.MessageId 
--                 AND mr.UserId = @UserId
--             ) THEN 1 
--             ELSE 0 
--         END as HasUserReacted,
--         (
--             SELECT 
--                 mr.ReactionType,
--                 u.FullName as UserName,
--                 u.AvatarUrl as UserAvatar
--             FROM MessageReactions mr
--             INNER JOIN Users u ON mr.UserId = u.UserId
--             WHERE mr.MessageId = m.MessageId
--             FOR JSON PATH
--         ) as Reactions
--     FROM Messages m
--     INNER JOIN Users u ON m.SenderId = u.UserId
--     WHERE m.ConversationId = @ConversationId
--       AND m.IsDeleted = 0
--       AND (
--           @BeforeMessageId IS NULL 
--           OR m.CreatedAt < (
--               SELECT CreatedAt 
--               FROM Messages 
--               WHERE MessageId = @BeforeMessageId
--           )
--       )
--     ORDER BY m.CreatedAt DESC
--     OFFSET 0 ROWS
--     FETCH NEXT @PageSize ROWS ONLY;
-- END;
-- GO

-- -- Stored procedure for archiving/unarchiving conversation
-- CREATE PROCEDURE sp_ToggleArchiveConversation
--     @ConversationId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER,
--     @Archive BIT
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @AgentId UNIQUEIDENTIFIER;
--     DECLARE @TenantId UNIQUEIDENTIFIER;
    
--     -- Get conversation participants
--     SELECT @AgentId = AgentId, @TenantId = UserId
--     FROM Conversations
--     WHERE ConversationId = @ConversationId;
    
--     IF @AgentId IS NULL
--     BEGIN
--         THROW 50000, 'Conversation not found', 1;
--     END
    
--     -- Update archive status based on user role
--     IF @UserId = @AgentId
--     BEGIN
--         UPDATE Conversations
--         SET IsArchivedByAgent = @Archive
--         WHERE ConversationId = @ConversationId;
--     END
--     ELSE IF @UserId = @TenantId
--     BEGIN
--         UPDATE Conversations
--         SET IsArchivedByTenant = @Archive
--         WHERE ConversationId = @ConversationId;
--     END
--     ELSE
--     BEGIN
--         THROW 50001, 'User is not a participant in this conversation', 1;
--     END
    
--     SELECT 'Success' as Status;
-- END;
-- GO

-- -- Stored procedure for blocking/unblocking conversation
-- CREATE PROCEDURE sp_ToggleBlockConversation
--     @ConversationId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER,
--     @Block BIT,
--     @BlockReason NVARCHAR(500) = NULL
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @AgentId UNIQUEIDENTIFIER;
    
--     -- Check if user is the agent in this conversation
--     SELECT @AgentId = AgentId
--     FROM Conversations
--     WHERE ConversationId = @ConversationId;
    
--     IF @AgentId IS NULL
--     BEGIN
--         THROW 50000, 'Conversation not found', 1;
--     END
    
--     IF @UserId <> @AgentId
--     BEGIN
--         THROW 50001, 'Only the agent can block/unblock conversations', 1;
--     END
    
--     -- Update block status
--     UPDATE Conversations
--     SET 
--         IsBlocked = @Block,
--         BlockedBy = CASE WHEN @Block = 1 THEN @UserId ELSE NULL END,
--         BlockReason = CASE WHEN @Block = 1 THEN @BlockReason ELSE NULL END
--     WHERE ConversationId = @ConversationId;
    
--     SELECT 'Success' as Status;
-- END;
-- GO

-- -- Stored procedure for deleting a message (soft delete)
-- CREATE PROCEDURE sp_DeleteMessage
--     @MessageId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER,
--     @ForEveryone BIT = 0
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @SenderId UNIQUEIDENTIFIER;
--     DECLARE @IsDeleted BIT;
    
--     -- Get message info
--     SELECT @SenderId = SenderId, @IsDeleted = IsDeleted
--     FROM Messages
--     WHERE MessageId = @MessageId;
    
--     IF @SenderId IS NULL
--     BEGIN
--         THROW 50000, 'Message not found', 1;
--     END
    
--     IF @IsDeleted = 1
--     BEGIN
--         THROW 50001, 'Message already deleted', 1;
--     END
    
--     -- Check permissions
--     IF @ForEveryone = 1 AND @SenderId <> @UserId
--     BEGIN
--         THROW 50002, 'Only the sender can delete for everyone', 1;
--     END
    
--     -- Soft delete the message
--     UPDATE Messages
--     SET 
--         IsDeleted = 1,
--         DeletedAt = SYSDATETIME(),
--         DeletedBy = @UserId
--     WHERE MessageId = @MessageId
--       AND (SenderId = @UserId OR @ForEveryone = 1);
    
--     SELECT 'Success' as Status;
-- END;
-- GO

-- -- Stored procedure for adding a reaction to a message
-- CREATE PROCEDURE sp_AddMessageReaction
--     @MessageId UNIQUEIDENTIFIER,
--     @UserId UNIQUEIDENTIFIER,
--     @ReactionType NVARCHAR(20)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     -- Check if message exists and is not deleted
--     IF NOT EXISTS (
--         SELECT 1 FROM Messages 
--         WHERE MessageId = @MessageId 
--         AND IsDeleted = 0
--     )
--     BEGIN
--         THROW 50000, 'Message not found or deleted', 1;
--     END
    
--     -- Check if user already reacted
--     DECLARE @ExistingReactionId UNIQUEIDENTIFIER;
--     DECLARE @ExistingReactionType NVARCHAR(20);
    
--     SELECT @ExistingReactionId = ReactionId, @ExistingReactionType = ReactionType
--     FROM MessageReactions
--     WHERE MessageId = @MessageId AND UserId = @UserId;
    
--     IF @ExistingReactionId IS NOT NULL
--     BEGIN
--         -- If same reaction, remove it (toggle)
--         IF @ExistingReactionType = @ReactionType
--         BEGIN
--             DELETE FROM MessageReactions
--             WHERE ReactionId = @ExistingReactionId;
            
--             SELECT 'Reaction removed' as Action;
--         END
--         ELSE
--         BEGIN
--             -- Update to new reaction
--             UPDATE MessageReactions
--             SET ReactionType = @ReactionType,
--                 CreatedAt = SYSDATETIME()
--             WHERE ReactionId = @ExistingReactionId;
            
--             SELECT 'Reaction updated' as Action;
--         END
--     END
--     ELSE
--     BEGIN
--         -- Add new reaction
--         DECLARE @ReactionId UNIQUEIDENTIFIER = NEWID();
        
--         INSERT INTO MessageReactions (
--             ReactionId,
--             MessageId,
--             UserId,
--             ReactionType,
--             CreatedAt
--         ) VALUES (
--             @ReactionId,
--             @MessageId,
--             @UserId,
--             @ReactionType,
--             SYSDATETIME()
--         );
        
--         SELECT 'Reaction added' as Action;
--     END
-- END;
-- GO

-- -- Function to check if a user can message another user
-- CREATE FUNCTION fn_CanMessageUser(
--     @SenderId UNIQUEIDENTIFIER,
--     @ReceiverId UNIQUEIDENTIFIER
-- )
-- RETURNS BIT
-- AS
-- BEGIN
--     DECLARE @Result BIT = 0;
    
--     -- Check if both users exist and are active
--     IF EXISTS (
--         SELECT 1 FROM Users 
--         WHERE UserId = @SenderId 
--         AND IsActive = 1
--     ) AND EXISTS (
--         SELECT 1 FROM Users 
--         WHERE UserId = @ReceiverId 
--         AND IsActive = 1
--     )
--     BEGIN
--         SET @Result = 1;
--     END
    
--     RETURN @Result;
-- END;
-- GO

-- -- Update the existing delete trigger to handle conversation cleanup
-- CREATE TRIGGER trg_DeleteConversationsOnUserDelete
-- ON Users
-- INSTEAD OF DELETE
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     DECLARE @DeletedUsers TABLE (UserId UNIQUEIDENTIFIER);
--     INSERT INTO @DeletedUsers (UserId) SELECT UserId FROM deleted;
    
--     -- Delete from Conversations where user is involved
--     DELETE FROM Conversations 
--     WHERE UserId IN (SELECT UserId FROM @DeletedUsers)
--        OR AgentId IN (SELECT UserId FROM @DeletedUsers);
    
--     -- Continue with the rest of the delete operations...
--     -- (Existing delete logic from previous trigger)
    
--     -- Delete from MessageReactions
--     DELETE FROM MessageReactions 
--     WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    
--     -- Delete from UserFollows first
--     DELETE FROM UserFollows 
--     WHERE FollowerId IN (SELECT UserId FROM @DeletedUsers)
--        OR FollowedId IN (SELECT UserId FROM @DeletedUsers);
    
--     -- Then delete from other tables with cascade relationships
--     DELETE FROM AgentVerification WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM PasswordResetTokens WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM UserSessions WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    
--     -- Then delete from Properties (which will cascade to PropertyMedia, PropertyAmenities)
--     DELETE FROM Properties WHERE OwnerId IN (SELECT UserId FROM @DeletedUsers);
    
--     -- Then delete from other tables
--     DELETE FROM Payments WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM Reviews WHERE ReviewerId IN (SELECT UserId FROM @DeletedUsers) OR AgentId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM PropertyVisits WHERE TenantId IN (SELECT UserId FROM @DeletedUsers) OR AgentId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM AuditLogs WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM Notifications WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
--     DELETE FROM UserStatus WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    
--     -- Finally delete the user
--     DELETE FROM Users WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
-- END;
-- GO



-- ALTER TABLE Users
-- ADD AvatarUrl NVARCHAR(500) NULL;


-- Conversations Table
CREATE TABLE Conversations (
    ConversationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PropertyId UNIQUEIDENTIFIER NOT NULL,
    AgentId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL, -- The Tenant
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    -- Additional fields for better conversation management
    LastMessageAt DATETIME2 NULL,
    LastMessagePreview NVARCHAR(200) NULL,
    UnreadCountForTenant INT NOT NULL DEFAULT 0,
    UnreadCountForAgent INT NOT NULL DEFAULT 0,
    IsArchivedByTenant BIT NOT NULL DEFAULT 0,
    IsArchivedByAgent BIT NOT NULL DEFAULT 0,
    IsBlocked BIT NOT NULL DEFAULT 0,
    BlockedBy UNIQUEIDENTIFIER NULL,
    BlockReason NVARCHAR(500) NULL,
    
    CONSTRAINT FK_Conversation_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE CASCADE,
    CONSTRAINT FK_Conversation_Agent FOREIGN KEY (AgentId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Conversation_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT UQ_Property_Agent_User UNIQUE (PropertyId, AgentId, UserId)
);
GO

-- Messages Table
CREATE TABLE Messages (
    MessageId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ConversationId UNIQUEIDENTIFIER NOT NULL,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    MessageType NVARCHAR(20) NOT NULL DEFAULT 'TEXT' CHECK (MessageType IN ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CONTACT')),
    MediaUrl NVARCHAR(500) NULL,
    ThumbnailUrl NVARCHAR(500) NULL,
    FileName NVARCHAR(255) NULL,
    FileSize INT NULL,
    MimeType NVARCHAR(100) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    ReadAt DATETIME2 NULL,
    DeliveredAt DATETIME2 NULL,
    IsEdited BIT NOT NULL DEFAULT 0,
    EditedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME2 NULL,
    DeletedBy UNIQUEIDENTIFIER NULL,
    
    CONSTRAINT FK_Message_Conversation FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId) ON DELETE CASCADE,
    CONSTRAINT FK_Message_Sender FOREIGN KEY (SenderId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
GO

-- Message Reactions Table
CREATE TABLE MessageReactions (
    ReactionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MessageId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    ReactionType NVARCHAR(20) NOT NULL DEFAULT 'LIKE' 
        CHECK (ReactionType IN ('LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_Reaction_Message FOREIGN KEY (MessageId) REFERENCES Messages(MessageId) ON DELETE CASCADE,
    CONSTRAINT FK_Reaction_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    
    UNIQUE (MessageId, UserId)
);
GO


-- Indexes for performance
CREATE INDEX IX_Conversations_Property ON Conversations(PropertyId);
CREATE INDEX IX_Conversations_User ON Conversations(UserId);
CREATE INDEX IX_Conversations_Agent ON Conversations(AgentId);
CREATE INDEX IX_Conversations_LastMessageAt ON Conversations(LastMessageAt);
CREATE INDEX IX_Conversations_Property_Agent_User ON Conversations(PropertyId, AgentId, UserId) INCLUDE (LastMessageAt, UnreadCountForTenant, UnreadCountForAgent);

CREATE INDEX IX_Messages_Conversation ON Messages(ConversationId);
CREATE INDEX IX_Messages_Sender ON Messages(SenderId);
CREATE INDEX IX_Messages_CreatedAt ON Messages(CreatedAt) INCLUDE (ConversationId, SenderId, Content, MessageType);
CREATE INDEX IX_Messages_Conversation_CreatedAt ON Messages(ConversationId, CreatedAt DESC);

CREATE INDEX IX_MessageReactions_Message ON MessageReactions(MessageId);
CREATE INDEX IX_MessageReactions_User ON MessageReactions(UserId);
GO

-- Trigger to update conversation last message info
CREATE TRIGGER trg_UpdateConversationOnMessage
ON Messages
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE c
    SET 
        LastMessageAt = i.CreatedAt,
        LastMessagePreview = CASE 
            WHEN i.MessageType = 'TEXT' THEN LEFT(i.Content, 200)
            WHEN i.MessageType = 'IMAGE' THEN '?? Image'
            WHEN i.MessageType = 'VIDEO' THEN '?? Video'
            WHEN i.MessageType = 'DOCUMENT' THEN '?? Document'
            WHEN i.MessageType = 'LOCATION' THEN '?? Location'
            WHEN i.MessageType = 'CONTACT' THEN '?? Contact'
            ELSE 'New message'
        END,
        UnreadCountForTenant = CASE 
            WHEN i.SenderId = c.AgentId THEN UnreadCountForTenant + 1
            ELSE UnreadCountForTenant
        END,
        UnreadCountForAgent = CASE 
            WHEN i.SenderId = c.UserId THEN UnreadCountForAgent + 1
            ELSE UnreadCountForAgent
        END
    FROM Conversations c
    INNER JOIN inserted i ON c.ConversationId = i.ConversationId;
END;
GO

-- Trigger to update conversation when message is read
CREATE TRIGGER trg_UpdateConversationOnMessageRead
ON Messages
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(ReadAt)
    BEGIN
        UPDATE c
        SET 
            UnreadCountForTenant = CASE 
                WHEN i.SenderId = c.AgentId AND i.ReadAt IS NOT NULL 
                THEN GREATEST(UnreadCountForTenant - 1, 0)
                ELSE UnreadCountForTenant
            END,
            UnreadCountForAgent = CASE 
                WHEN i.SenderId = c.UserId AND i.ReadAt IS NOT NULL 
                THEN GREATEST(UnreadCountForAgent - 1, 0)
                ELSE UnreadCountForAgent
            END
        FROM Conversations c
        INNER JOIN inserted i ON c.ConversationId = i.ConversationId
        WHERE i.ReadAt IS NOT NULL;
    END
END;
GO

-- View for conversations with user info
CREATE VIEW vw_ConversationDetails AS
SELECT 
    c.ConversationId,
    c.PropertyId,
    c.AgentId,
    c.UserId as TenantId,
    p.Title as PropertyTitle,
    p.RentAmount,
    pm.MediaUrl as PropertyImage,
    a.UserId as AgentUserId,
    a.FullName as AgentName,
    a.Email as AgentEmail,
    a.PhoneNumber as AgentPhone,
    a.AvatarUrl as AgentAvatar,
    t.UserId as TenantUserId,
    t.FullName as TenantName,
    t.Email as TenantEmail,
    t.PhoneNumber as TenantPhone,
    t.AvatarUrl as TenantAvatar,
    c.LastMessageAt,
    c.LastMessagePreview,
    c.UnreadCountForTenant,
    c.UnreadCountForAgent,
    c.CreatedAt as ConversationCreatedAt,
    c.IsArchivedByTenant,
    c.IsArchivedByAgent,
    c.IsBlocked,
    c.BlockedBy,
    c.BlockReason
FROM Conversations c
INNER JOIN Properties p ON c.PropertyId = p.PropertyId
LEFT JOIN PropertyMedia pm ON p.PropertyId = pm.PropertyId AND pm.IsPrimary = 1
INNER JOIN Users a ON c.AgentId = a.UserId
INNER JOIN Users t ON c.UserId = t.UserId;
GO

-- View for messages with sender info
CREATE VIEW vw_MessageDetails AS
SELECT 
    m.MessageId,
    m.ConversationId,
    m.SenderId,
    u.FullName as SenderName,
    u.AvatarUrl as SenderAvatar,
    u.Role as SenderRole,
    m.Content,
    m.MessageType,
    m.MediaUrl,
    m.ThumbnailUrl,
    m.FileName,
    m.FileSize,
    m.MimeType,
    m.CreatedAt,
    m.ReadAt,
    m.DeliveredAt,
    m.IsEdited,
    m.EditedAt,
    m.IsDeleted,
    m.DeletedAt,
    m.DeletedBy,
    c.PropertyId,
    c.AgentId,
    c.UserId as TenantId
FROM Messages m
INNER JOIN Conversations c ON m.ConversationId = c.ConversationId
INNER JOIN Users u ON m.SenderId = u.UserId;
GO

-- Stored procedure for starting a new conversation
CREATE PROCEDURE sp_StartConversation
    @PropertyId UNIQUEIDENTIFIER,
    @AgentId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @InitialMessage NVARCHAR(MAX) = NULL,
    @MessageType NVARCHAR(20) = 'TEXT'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @ConversationId UNIQUEIDENTIFIER;
    DECLARE @MessageId UNIQUEIDENTIFIER;
    
    BEGIN TRY
        -- Check if conversation already exists
        SELECT @ConversationId = ConversationId
        FROM Conversations
        WHERE PropertyId = @PropertyId
          AND AgentId = @AgentId
          AND UserId = @UserId;
        
        -- If conversation doesn't exist, create it
        IF @ConversationId IS NULL
        BEGIN
            SET @ConversationId = NEWID();
            
            INSERT INTO Conversations (
                ConversationId,
                PropertyId,
                AgentId,
                UserId,
                CreatedAt,
                LastMessageAt,
                LastMessagePreview
            ) VALUES (
                @ConversationId,
                @PropertyId,
                @AgentId,
                @UserId,
                SYSDATETIME(),
                SYSDATETIME(),
                CASE 
                    WHEN @InitialMessage IS NOT NULL AND @MessageType = 'TEXT' 
                    THEN LEFT(@InitialMessage, 200)
                    WHEN @MessageType = 'IMAGE' THEN '?? Image'
                    WHEN @MessageType = 'VIDEO' THEN '?? Video'
                    WHEN @MessageType = 'DOCUMENT' THEN '?? Document'
                    WHEN @MessageType = 'LOCATION' THEN '?? Location'
                    WHEN @MessageType = 'CONTACT' THEN '?? Contact'
                    ELSE 'New conversation'
                END
            );
            
            -- Set initial unread count for agent
            UPDATE Conversations
            SET UnreadCountForAgent = 1
            WHERE ConversationId = @ConversationId;
        END
        
        -- Add initial message if provided
        IF @InitialMessage IS NOT NULL
        BEGIN
            SET @MessageId = NEWID();
            
            INSERT INTO Messages (
                MessageId,
                ConversationId,
                SenderId,
                Content,
                MessageType,
                CreatedAt,
                DeliveredAt
            ) VALUES (
                @MessageId,
                @ConversationId,
                @UserId,
                @InitialMessage,
                @MessageType,
                SYSDATETIME(),
                SYSDATETIME()
            );
        END
        
        -- Return the conversation ID
        SELECT @ConversationId as ConversationId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Stored procedure for sending a message
CREATE PROCEDURE sp_SendMessage
    @ConversationId UNIQUEIDENTIFIER,
    @SenderId UNIQUEIDENTIFIER,
    @Content NVARCHAR(MAX),
    @MessageType NVARCHAR(20) = 'TEXT',
    @MediaUrl NVARCHAR(500) = NULL,
    @ThumbnailUrl NVARCHAR(500) = NULL,
    @FileName NVARCHAR(255) = NULL,
    @FileSize INT = NULL,
    @MimeType NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @MessageId UNIQUEIDENTIFIER;
    DECLARE @AgentId UNIQUEIDENTIFIER;
    DECLARE @UserId UNIQUEIDENTIFIER;
    
    BEGIN TRY
        -- Get conversation participants
        SELECT @AgentId = AgentId, @UserId = UserId
        FROM Conversations
        WHERE ConversationId = @ConversationId;
        
        IF @AgentId IS NULL
        BEGIN
            THROW 50000, 'Conversation not found', 1;
        END
        
        -- Check if conversation is blocked
        DECLARE @IsBlocked BIT;
        SELECT @IsBlocked = IsBlocked
        FROM Conversations
        WHERE ConversationId = @ConversationId;
        
        IF @IsBlocked = 1
        BEGIN
            THROW 50001, 'This conversation is blocked', 1;
        END
        
        -- Create the message
        SET @MessageId = NEWID();
        
        INSERT INTO Messages (
            MessageId,
            ConversationId,
            SenderId,
            Content,
            MessageType,
            MediaUrl,
            ThumbnailUrl,
            FileName,
            FileSize,
            MimeType,
            CreatedAt,
            DeliveredAt
        ) VALUES (
            @MessageId,
            @ConversationId,
            @SenderId,
            @Content,
            @MessageType,
            @MediaUrl,
            @ThumbnailUrl,
            @FileName,
            @FileSize,
            @MimeType,
            SYSDATETIME(),
            SYSDATETIME()
        );
        
        -- Update conversation unread counts
        UPDATE Conversations
        SET 
            LastMessageAt = SYSDATETIME(),
            LastMessagePreview = CASE 
                WHEN @MessageType = 'TEXT' THEN LEFT(@Content, 200)
                WHEN @MessageType = 'IMAGE' THEN '?? Image'
                WHEN @MessageType = 'VIDEO' THEN '?? Video'
                WHEN @MessageType = 'DOCUMENT' THEN '?? Document'
                WHEN @MessageType = 'LOCATION' THEN '?? Location'
                WHEN @MessageType = 'CONTACT' THEN '?? Contact'
                ELSE 'New message'
            END,
            UnreadCountForTenant = CASE 
                WHEN @SenderId = @AgentId THEN UnreadCountForTenant + 1
                ELSE UnreadCountForTenant
            END,
            UnreadCountForAgent = CASE 
                WHEN @SenderId = @UserId THEN UnreadCountForAgent + 1
                ELSE UnreadCountForAgent
            END
        WHERE ConversationId = @ConversationId;
        
        -- Return the message
        SELECT 
            m.MessageId,
            m.ConversationId,
            m.SenderId,
            u.FullName as SenderName,
            u.AvatarUrl as SenderAvatar,
            u.Role as SenderRole,
            m.Content,
            m.MessageType,
            m.MediaUrl,
            m.ThumbnailUrl,
            m.FileName,
            m.FileSize,
            m.MimeType,
            m.CreatedAt,
            m.ReadAt,
            m.DeliveredAt,
            m.IsEdited,
            m.EditedAt,
            m.IsDeleted,
            m.DeletedAt
        FROM Messages m
        INNER JOIN Users u ON m.SenderId = u.UserId
        WHERE m.MessageId = @MessageId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Stored procedure for marking messages as read
CREATE PROCEDURE sp_MarkMessagesAsRead
    @ConversationId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @AgentId UNIQUEIDENTIFIER;
    DECLARE @TenantId UNIQUEIDENTIFIER;
    
    BEGIN TRY
        -- Get conversation participants
        SELECT @AgentId = AgentId, @TenantId = UserId
        FROM Conversations
        WHERE ConversationId = @ConversationId;
        
        IF @AgentId IS NULL
        BEGIN
            THROW 50000, 'Conversation not found', 1;
        END
        
        -- Determine which messages to mark as read
        DECLARE @MessagesToUpdate TABLE (MessageId UNIQUEIDENTIFIER);
        
        INSERT INTO @MessagesToUpdate (MessageId)
        SELECT MessageId
        FROM Messages
        WHERE ConversationId = @ConversationId
          AND ReadAt IS NULL
          AND SenderId <> @UserId;
        
        -- Update messages
        UPDATE Messages
        SET ReadAt = SYSDATETIME()
        WHERE MessageId IN (SELECT MessageId FROM @MessagesToUpdate);
        
        -- Update conversation unread counts
        IF @UserId = @TenantId
        BEGIN
            UPDATE Conversations
            SET UnreadCountForTenant = 0
            WHERE ConversationId = @ConversationId;
        END
        ELSE IF @UserId = @AgentId
        BEGIN
            UPDATE Conversations
            SET UnreadCountForAgent = 0
            WHERE ConversationId = @ConversationId;
        END
        
        -- Return count of messages marked as read
        SELECT COUNT(*) as MessagesRead
        FROM @MessagesToUpdate;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Stored procedure for getting conversation list for a user
CREATE PROCEDURE sp_GetUserConversations
    @UserId UNIQUEIDENTIFIER,
    @Role NVARCHAR(20) = NULL,
    @IncludeArchived BIT = 0,
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AgentConversations BIT = 0;
    DECLARE @TenantConversations BIT = 0;
    
    -- Determine which conversations to show based on role
    IF @Role IS NULL
    BEGIN
        -- User hasn't specified role, check both
        SET @AgentConversations = 1;
        SET @TenantConversations = 1;
    END
    ELSE IF @Role = 'AGENT'
    BEGIN
        SET @AgentConversations = 1;
    END
    ELSE IF @Role = 'TENANT'
    BEGIN
        SET @TenantConversations = 1;
    END
    
    -- Calculate offset
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Get conversations
    SELECT 
        c.ConversationId,
        c.PropertyId,
        c.AgentId,
        c.UserId as TenantId,
        p.Title as PropertyTitle,
        p.RentAmount,
        pm.MediaUrl as PropertyImage,
        a.FullName as AgentName,
        a.AvatarUrl as AgentAvatar,
        t.FullName as TenantName,
        t.AvatarUrl as TenantAvatar,
        c.LastMessageAt,
        c.LastMessagePreview,
        c.UnreadCountForTenant,
        c.UnreadCountForAgent,
        c.CreatedAt as ConversationCreatedAt,
        c.IsArchivedByTenant,
        c.IsArchivedByAgent,
        c.IsBlocked,
        CASE 
            WHEN c.AgentId = @UserId THEN 'AGENT'
            ELSE 'TENANT'
        END as UserRoleInConversation,
        CASE 
            WHEN c.AgentId = @UserId THEN UnreadCountForAgent
            ELSE UnreadCountForTenant
        END as UnreadCountForUser
    FROM Conversations c
    INNER JOIN Properties p ON c.PropertyId = p.PropertyId
    LEFT JOIN PropertyMedia pm ON p.PropertyId = pm.PropertyId AND pm.IsPrimary = 1
    INNER JOIN Users a ON c.AgentId = a.UserId
    INNER JOIN Users t ON c.UserId = t.UserId
    WHERE (
        (@AgentConversations = 1 AND c.AgentId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByAgent = 0))
        OR
        (@TenantConversations = 1 AND c.UserId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByTenant = 0))
    )
    AND c.IsBlocked = 0
    ORDER BY c.LastMessageAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) as TotalCount
    FROM Conversations c
    WHERE (
        (@AgentConversations = 1 AND c.AgentId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByAgent = 0))
        OR
        (@TenantConversations = 1 AND c.UserId = @UserId AND (@IncludeArchived = 1 OR c.IsArchivedByTenant = 0))
    )
    AND c.IsBlocked = 0;
END;
GO

-- Stored procedure for getting messages in a conversation
CREATE PROCEDURE sp_GetConversationMessages
    @ConversationId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @BeforeMessageId UNIQUEIDENTIFIER = NULL,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    -- First, mark messages as read if they're from the other participant
    EXEC sp_MarkMessagesAsRead @ConversationId = @ConversationId, @UserId = @UserId;
    
    -- Get messages
    SELECT 
        m.MessageId,
        m.ConversationId,
        m.SenderId,
        u.FullName as SenderName,
        u.AvatarUrl as SenderAvatar,
        u.Role as SenderRole,
        m.Content,
        m.MessageType,
        m.MediaUrl,
        m.ThumbnailUrl,
        m.FileName,
        m.FileSize,
        m.MimeType,
        m.CreatedAt,
        m.ReadAt,
        m.DeliveredAt,
        m.IsEdited,
        m.EditedAt,
        m.IsDeleted,
        m.DeletedAt,
        m.DeletedBy,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM MessageReactions mr 
                WHERE mr.MessageId = m.MessageId 
                AND mr.UserId = @UserId
            ) THEN 1 
            ELSE 0 
        END as HasUserReacted,
        (
            SELECT 
                mr.ReactionType,
                u.FullName as UserName,
                u.AvatarUrl as UserAvatar
            FROM MessageReactions mr
            INNER JOIN Users u ON mr.UserId = u.UserId
            WHERE mr.MessageId = m.MessageId
            FOR JSON PATH
        ) as Reactions
    FROM Messages m
    INNER JOIN Users u ON m.SenderId = u.UserId
    WHERE m.ConversationId = @ConversationId
      AND m.IsDeleted = 0
      AND (
          @BeforeMessageId IS NULL 
          OR m.CreatedAt < (
              SELECT CreatedAt 
              FROM Messages 
              WHERE MessageId = @BeforeMessageId
          )
      )
    ORDER BY m.CreatedAt DESC
    OFFSET 0 ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- Stored procedure for archiving/unarchiving conversation
CREATE PROCEDURE sp_ToggleArchiveConversation
    @ConversationId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @Archive BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AgentId UNIQUEIDENTIFIER;
    DECLARE @TenantId UNIQUEIDENTIFIER;
    
    -- Get conversation participants
    SELECT @AgentId = AgentId, @TenantId = UserId
    FROM Conversations
    WHERE ConversationId = @ConversationId;
    
    IF @AgentId IS NULL
    BEGIN
        THROW 50000, 'Conversation not found', 1;
    END
    
    -- Update archive status based on user role
    IF @UserId = @AgentId
    BEGIN
        UPDATE Conversations
        SET IsArchivedByAgent = @Archive
        WHERE ConversationId = @ConversationId;
    END
    ELSE IF @UserId = @TenantId
    BEGIN
        UPDATE Conversations
        SET IsArchivedByTenant = @Archive
        WHERE ConversationId = @ConversationId;
    END
    ELSE
    BEGIN
        THROW 50001, 'User is not a participant in this conversation', 1;
    END
    
    SELECT 'Success' as Status;
END;
GO

-- Stored procedure for blocking/unblocking conversation
CREATE PROCEDURE sp_ToggleBlockConversation
    @ConversationId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @Block BIT,
    @BlockReason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AgentId UNIQUEIDENTIFIER;
    
    -- Check if user is the agent in this conversation
    SELECT @AgentId = AgentId
    FROM Conversations
    WHERE ConversationId = @ConversationId;
    
    IF @AgentId IS NULL
    BEGIN
        THROW 50000, 'Conversation not found', 1;
    END
    
    IF @UserId <> @AgentId
    BEGIN
        THROW 50001, 'Only the agent can block/unblock conversations', 1;
    END
    
    -- Update block status
    UPDATE Conversations
    SET 
        IsBlocked = @Block,
        BlockedBy = CASE WHEN @Block = 1 THEN @UserId ELSE NULL END,
        BlockReason = CASE WHEN @Block = 1 THEN @BlockReason ELSE NULL END
    WHERE ConversationId = @ConversationId;
    
    SELECT 'Success' as Status;
END;
GO

-- Stored procedure for deleting a message (soft delete)
CREATE PROCEDURE sp_DeleteMessage
    @MessageId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @ForEveryone BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SenderId UNIQUEIDENTIFIER;
    DECLARE @IsDeleted BIT;
    
    -- Get message info
    SELECT @SenderId = SenderId, @IsDeleted = IsDeleted
    FROM Messages
    WHERE MessageId = @MessageId;
    
    IF @SenderId IS NULL
    BEGIN
        THROW 50000, 'Message not found', 1;
    END
    
    IF @IsDeleted = 1
    BEGIN
        THROW 50001, 'Message already deleted', 1;
    END
    
    -- Check permissions
    IF @ForEveryone = 1 AND @SenderId <> @UserId
    BEGIN
        THROW 50002, 'Only the sender can delete for everyone', 1;
    END
    
    -- Soft delete the message
    UPDATE Messages
    SET 
        IsDeleted = 1,
        DeletedAt = SYSDATETIME(),
        DeletedBy = @UserId
    WHERE MessageId = @MessageId
      AND (SenderId = @UserId OR @ForEveryone = 1);
    
    SELECT 'Success' as Status;
END;
GO

-- Stored procedure for adding a reaction to a message
CREATE PROCEDURE sp_AddMessageReaction
    @MessageId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @ReactionType NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if message exists and is not deleted
    IF NOT EXISTS (
        SELECT 1 FROM Messages 
        WHERE MessageId = @MessageId 
        AND IsDeleted = 0
    )
    BEGIN
        THROW 50000, 'Message not found or deleted', 1;
    END
    
    -- Check if user already reacted
    DECLARE @ExistingReactionId UNIQUEIDENTIFIER;
    DECLARE @ExistingReactionType NVARCHAR(20);
    
    SELECT @ExistingReactionId = ReactionId, @ExistingReactionType = ReactionType
    FROM MessageReactions
    WHERE MessageId = @MessageId AND UserId = @UserId;
    
    IF @ExistingReactionId IS NOT NULL
    BEGIN
        -- If same reaction, remove it (toggle)
        IF @ExistingReactionType = @ReactionType
        BEGIN
            DELETE FROM MessageReactions
            WHERE ReactionId = @ExistingReactionId;
            
            SELECT 'Reaction removed' as Action;
        END
        ELSE
        BEGIN
            -- Update to new reaction
            UPDATE MessageReactions
            SET ReactionType = @ReactionType,
                CreatedAt = SYSDATETIME()
            WHERE ReactionId = @ExistingReactionId;
            
            SELECT 'Reaction updated' as Action;
        END
    END
    ELSE
    BEGIN
        -- Add new reaction
        DECLARE @ReactionId UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO MessageReactions (
            ReactionId,
            MessageId,
            UserId,
            ReactionType,
            CreatedAt
        ) VALUES (
            @ReactionId,
            @MessageId,
            @UserId,
            @ReactionType,
            SYSDATETIME()
        );
        
        SELECT 'Reaction added' as Action;
    END
END;
GO

-- Function to check if a user can message another user
CREATE FUNCTION fn_CanMessageUser(
    @SenderId UNIQUEIDENTIFIER,
    @ReceiverId UNIQUEIDENTIFIER
)
RETURNS BIT
AS
BEGIN
    DECLARE @Result BIT = 0;
    
    -- Check if both users exist and are active
    IF EXISTS (
        SELECT 1 FROM Users 
        WHERE UserId = @SenderId 
        AND IsActive = 1
    ) AND EXISTS (
        SELECT 1 FROM Users 
        WHERE UserId = @ReceiverId 
        AND IsActive = 1
    )
    BEGIN
        SET @Result = 1;
    END
    
    RETURN @Result;
END;
GO

-- Update the existing delete trigger to handle conversation cleanup
CREATE TRIGGER trg_DeleteConversationsOnUserDelete
ON Users
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DeletedUsers TABLE (UserId UNIQUEIDENTIFIER);
    INSERT INTO @DeletedUsers (UserId) SELECT UserId FROM deleted;
    
    -- Delete from Conversations where user is involved
    DELETE FROM Conversations 
    WHERE UserId IN (SELECT UserId FROM @DeletedUsers)
       OR AgentId IN (SELECT UserId FROM @DeletedUsers);
    
    -- Continue with the rest of the delete operations...
    -- (Existing delete logic from previous trigger)
    
    -- Delete from MessageReactions
    DELETE FROM MessageReactions 
    WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    
    -- Delete from UserFollows first
    DELETE FROM UserFollows 
    WHERE FollowerId IN (SELECT UserId FROM @DeletedUsers)
       OR FollowedId IN (SELECT UserId FROM @DeletedUsers);
    
    -- Then delete from other tables with cascade relationships
    DELETE FROM AgentVerification WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM PasswordResetTokens WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM UserSessions WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    
    -- Then delete from Properties (which will cascade to PropertyMedia, PropertyAmenities)
    DELETE FROM Properties WHERE OwnerId IN (SELECT UserId FROM @DeletedUsers);
    
    -- Then delete from other tables
    DELETE FROM Payments WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM Reviews WHERE ReviewerId IN (SELECT UserId FROM @DeletedUsers) OR AgentId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM PropertyVisits WHERE TenantId IN (SELECT UserId FROM @DeletedUsers) OR AgentId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM AuditLogs WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM Notifications WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    DELETE FROM UserStatus WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
    
    -- Finally delete the user
    DELETE FROM Users WHERE UserId IN (SELECT UserId FROM @DeletedUsers);
END;
GO



ALTER TABLE Users
ADD AvatarUrl NVARCHAR(500) NULL;



ALTER PROCEDURE sp_GetConversationMessages
    @ConversationId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @BeforeMessageId UNIQUEIDENTIFIER = NULL,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    -- DEBUG: Log parameters
    PRINT 'DEBUG: ConversationId = ' + CAST(@ConversationId AS NVARCHAR(50));
    PRINT 'DEBUG: UserId = ' + CAST(@UserId AS NVARCHAR(50));
    PRINT 'DEBUG: BeforeMessageId = ' + ISNULL(CAST(@BeforeMessageId AS NVARCHAR(50)), 'NULL');
    PRINT 'DEBUG: PageSize = ' + CAST(@PageSize AS NVARCHAR(10));
    
    -- First, mark messages as read if they're from the other participant
    EXEC sp_MarkMessagesAsRead @ConversationId = @ConversationId, @UserId = @UserId;
    
    -- Get messages - TEMPORARILY REMOVE FILTERS FOR DEBUGGING
    SELECT 
        m.MessageId,
        m.ConversationId,
        m.SenderId,
        u.FullName as SenderName,
        u.AvatarUrl as SenderAvatar,
        u.Role as SenderRole,
        m.Content,
        m.MessageType,
        m.MediaUrl,
        m.ThumbnailUrl,
        m.FileName,
        m.FileSize,
        m.MimeType,
        m.CreatedAt,
        m.ReadAt,
        m.DeliveredAt,
        m.IsEdited,
        m.EditedAt,
        m.IsDeleted,
        m.DeletedAt,
        m.DeletedBy,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM MessageReactions mr 
                WHERE mr.MessageId = m.MessageId 
                AND mr.UserId = @UserId
            ) THEN 1 
            ELSE 0 
        END as HasUserReacted,
        (
            SELECT 
                mr.ReactionType,
                u.FullName as UserName,
                u.AvatarUrl as UserAvatar
            FROM MessageReactions mr
            INNER JOIN Users u ON mr.UserId = u.UserId
            WHERE mr.MessageId = m.MessageId
            FOR JSON PATH
        ) as Reactions
    FROM Messages m
    INNER JOIN Users u ON m.SenderId = u.UserId
    WHERE m.ConversationId = @ConversationId
      AND m.IsDeleted = 0
    -- TEMPORARILY COMMENT OUT FILTERS:
    --   AND (
    --       @BeforeMessageId IS NULL 
    --       OR m.CreatedAt < (
    --           SELECT CreatedAt 
    --           FROM Messages 
    --           WHERE MessageId = @BeforeMessageId
    --       )
    --   )
    ORDER BY m.CreatedAt ASC -- Changed from DESC to ASC for frontend
    -- TEMPORARILY REMOVE PAGING:
    -- OFFSET 0 ROWS
    -- FETCH NEXT @PageSize ROWS ONLY;
    
    -- DEBUG: Count messages returned
    PRINT 'DEBUG: Returning all messages for conversation';
END;
GO