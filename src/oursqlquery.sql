CREATE DATABASE RENT_ME_A_KEJADB;
GO

USE RENT_ME_A_KEJADB;
GO

-- Users table with Username for login
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Login credentials
    Username NVARCHAR(50) NOT NULL UNIQUE,  -- Added for username-based login
    PasswordHash NVARCHAR(500) NOT NULL,    -- store hashed password
    
    -- Personal information
    FullName NVARCHAR(150) NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL UNIQUE,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    
    -- User role and status
    Role NVARCHAR(20) NOT NULL DEFAULT 'TENANT' CHECK (Role IN ('TENANT', 'AGENT', 'ADMIN')),
    AgentStatus NVARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (AgentStatus IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    
    -- Account metrics
    TrustScore INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    LoginAttempts INT NOT NULL DEFAULT 0,           -- Added for security
    LastLogin DATETIME2 NULL,                      -- Added for tracking
    LockedUntil DATETIME2 NULL,                    -- Added for account lockout
    
    -- Timestamps
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

ALTER TABLE Users
ADD IsEmailVerified BIT NOT NULL DEFAULT 0;

-- Create indexes for login optimization
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_PhoneNumber ON Users(PhoneNumber);
GO

-- Agent verification table
CREATE TABLE AgentVerification (
    VerificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,

    NationalId NVARCHAR(50) NOT NULL,
    SelfieUrl NVARCHAR(500) NOT NULL,
    IdFrontUrl NVARCHAR(500) NOT NULL,
    IdBackUrl NVARCHAR(500) NULL,                    -- Added ID back image
    PropertyProofUrl NVARCHAR(500) NULL,

    ReviewedBy UNIQUEIDENTIFIER NULL,
    ReviewStatus NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (ReviewStatus IN ('PENDING', 'APPROVED', 'REJECTED')),
    ReviewNotes NVARCHAR(500) NULL,

    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    ReviewedAt DATETIME2 NULL,

    CONSTRAINT FK_Verification_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

-- Properties table
CREATE TABLE Properties (
    PropertyId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OwnerId UNIQUEIDENTIFIER NOT NULL,

    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    RentAmount DECIMAL(10,2) NOT NULL,
    DepositAmount DECIMAL(10,2) NULL,

    -- Address details
    County NVARCHAR(100) NOT NULL,
    Constituency NVARCHAR(100) NULL,                 -- Added for better location
    Area NVARCHAR(150) NOT NULL,
    StreetAddress NVARCHAR(500) NULL,                -- Added street address
    Latitude DECIMAL(9,6) NULL,                     -- Made nullable
    Longitude DECIMAL(9,6) NULL,                    -- Made nullable

    -- Property details
    PropertyType NVARCHAR(50) NOT NULL DEFAULT 'APARTMENT' CHECK (PropertyType IN ('APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER')),
    Bedrooms INT NULL,
    Bathrooms INT NULL,
    
    Rules NVARCHAR(MAX) NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    IsVerified BIT NOT NULL DEFAULT 0,
    IsBoosted BIT NOT NULL DEFAULT 0,                -- Added for promoted listings
    BoostExpiry DATETIME2 NULL,                     -- Added for boost expiration

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Property_User FOREIGN KEY (OwnerId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Properties_OwnerId ON Properties(OwnerId);
CREATE INDEX IX_Properties_IsAvailable ON Properties(IsAvailable);
CREATE INDEX IX_Properties_IsBoosted ON Properties(IsBoosted);
GO

-- Property media table
CREATE TABLE PropertyMedia (
    MediaId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PropertyId UNIQUEIDENTIFIER NOT NULL,

    MediaType NVARCHAR(20) NOT NULL CHECK (MediaType IN ('IMAGE', 'VIDEO', 'DOCUMENT')),
    MediaUrl NVARCHAR(500) NOT NULL,
    ThumbnailUrl NVARCHAR(500) NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,                -- Added for primary/property images

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Media_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE CASCADE
);
GO

-- Property amenities table (added for better property details)
CREATE TABLE PropertyAmenities (
    AmenityId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PropertyId UNIQUEIDENTIFIER NOT NULL,
    AmenityName NVARCHAR(100) NOT NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_Amenity_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE CASCADE
);
GO

-- User follows
CREATE TABLE UserFollows (
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FollowedId UNIQUEIDENTIFIER NOT NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT PK_Follow PRIMARY KEY (FollowerId, FollowedId),
    CONSTRAINT FK_Follow_Follower FOREIGN KEY (FollowerId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Follow_Followed FOREIGN KEY (FollowedId) REFERENCES Users(UserId) ON DELETE NO ACTION
);

-- Property visits
CREATE TABLE PropertyVisits (
    VisitId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PropertyId UNIQUEIDENTIFIER NOT NULL,
    TenantId UNIQUEIDENTIFIER NOT NULL,
    AgentId UNIQUEIDENTIFIER NOT NULL,

    VisitDate DATETIME2 NOT NULL,                   -- Scheduled visit date/time
    VisitPurpose NVARCHAR(200) NULL,                -- Purpose of visit
    TenantNotes NVARCHAR(500) NULL,                 -- Notes from tenant
    AgentNotes NVARCHAR(500) NULL,                  -- Notes from agent
    
    CheckInTime DATETIME2 NULL,                     -- Made nullable (actual check-in)
    CheckOutTime DATETIME2 NULL,                    -- Made nullable (actual check-out)

    Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (Status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW')),

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Visit_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE CASCADE,
    CONSTRAINT FK_Visit_Tenant FOREIGN KEY (TenantId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Visit_Agent FOREIGN KEY (AgentId) REFERENCES Users(UserId) ON DELETE NO ACTION
);

-- Reviews table
CREATE TABLE Reviews (
    ReviewId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PropertyId UNIQUEIDENTIFIER NULL,               -- Made nullable (can review agent without property)
    ReviewerId UNIQUEIDENTIFIER NOT NULL,
    AgentId UNIQUEIDENTIFIER NOT NULL,
    
    ReviewType NVARCHAR(20) NOT NULL DEFAULT 'AGENT' CHECK (ReviewType IN ('PROPERTY', 'AGENT')),

    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(1000) NULL,                    -- Increased length

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Review_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE CASCADE,
    CONSTRAINT FK_Review_Reviewer FOREIGN KEY (ReviewerId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Review_Agent FOREIGN KEY (AgentId) REFERENCES Users(UserId) ON DELETE NO ACTION
);
GO

-- Payments table
CREATE TABLE Payments (
    PaymentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PropertyId UNIQUEIDENTIFIER NULL,               -- Added for property-specific payments

    Amount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'KES',
    PaymentProvider NVARCHAR(50) NOT NULL,          -- PAYSTACK, MPESA
    ProviderReference NVARCHAR(150) NOT NULL,

    Purpose NVARCHAR(50) NOT NULL CHECK (Purpose IN ('ACCESS', 'BOOST', 'SUBSCRIPTION', 'BOOKING', 'DEPOSIT')),
    Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (Status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CompletedAt DATETIME2 NULL,

    CONSTRAINT FK_Payment_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Payment_Property FOREIGN KEY (PropertyId) REFERENCES Properties(PropertyId) ON DELETE NO ACTION
);
GO
-- Audit logs
CREATE TABLE AuditLogs (
    LogId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,

    Action NVARCHAR(100) NOT NULL,
    Entity NVARCHAR(100) NOT NULL,
    EntityId UNIQUEIDENTIFIER NULL,

    IpAddress NVARCHAR(45) NULL,                    -- Added for security
    UserAgent NVARCHAR(500) NULL,                   -- Added for device tracking
    Metadata NVARCHAR(MAX) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

GO

-- Password reset tokens (added for authentication)
CREATE TABLE PasswordResetTokens (
    TokenId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    TokenHash NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_PasswordResetToken_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

-- User sessions (optional, for tracking active sessions)
CREATE TABLE UserSessions (
    SessionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    DeviceId NVARCHAR(200) NULL,
    RefreshTokenHash NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    LastAccessedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_UserSession_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);
GO

-- Create trigger for UpdatedAt
CREATE TRIGGER trg_UpdateUsersTimestamp 
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users
    SET UpdatedAt = SYSDATETIME()
    FROM Users u
    INNER JOIN inserted i ON u.UserId = i.UserId
END;
GO


-- Create trigger for Properties UpdatedAt
CREATE TRIGGER trg_UpdatePropertiesTimestamp 
ON Properties
AFTER UPDATE
AS
BEGIN
    UPDATE Properties
    SET UpdatedAt = SYSDATETIME()
    FROM Properties p
    INNER JOIN inserted i ON p.PropertyId = i.PropertyId
END;
GO


-- Create trigger for Reviews UpdatedAt
CREATE TRIGGER trg_UpdateReviewsTimestamp 
ON Reviews
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Reviews
    SET UpdatedAt = SYSDATETIME()
    FROM Reviews r
    INNER JOIN inserted i ON r.ReviewId = i.ReviewId
END;
GO

-- Create trigger for PropertyVisits UpdatedAt
CREATE TRIGGER trg_UpdatePropertyVisitsTimestamp 
ON PropertyVisits
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE PropertyVisits
    SET UpdatedAt = SYSDATETIME()
    FROM PropertyVisits pv
    INNER JOIN inserted i ON pv.VisitId = i.VisitId
END;
GO

-- Optional: Create a view for user login information
CREATE VIEW vw_UserLoginInfo AS
SELECT 
    UserId,
    Username,
    PasswordHash,
    Email,
    PhoneNumber,
    FullName,
    Role,
    IsActive,
    LoginAttempts,
    LockedUntil,
    LastLogin
FROM Users;
GO

-- Optional: Create a view for property listings
CREATE VIEW vw_PropertyListings AS
SELECT 
    p.PropertyId,
    p.Title,
    p.Description,
    p.RentAmount,
    p.DepositAmount,
    p.County,
    p.Area,
    p.StreetAddress,
    p.PropertyType,
    p.Bedrooms,
    p.Bathrooms,
    p.IsAvailable,
    p.IsVerified,
    p.IsBoosted,
    p.BoostExpiry,
    u.UserId AS OwnerId,
    u.FullName AS OwnerName,
    u.TrustScore AS OwnerTrustScore,
    p.CreatedAt,
    p.UpdatedAt
FROM Properties p
INNER JOIN Users u ON p.OwnerId = u.UserId
WHERE p.IsAvailable = 1 AND u.IsActive = 1;
GO





-- Alternative: Use trigger for cascade delete in UserFollows
CREATE TRIGGER trg_DeleteUserFollows
ON Users
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Delete from UserFollows first
    DELETE FROM UserFollows 
    WHERE FollowerId IN (SELECT UserId FROM deleted)
       OR FollowedId IN (SELECT UserId FROM deleted);
    
    -- Then delete from other tables with cascade relationships
    DELETE FROM AgentVerification WHERE UserId IN (SELECT UserId FROM deleted);
    DELETE FROM PasswordResetTokens WHERE UserId IN (SELECT UserId FROM deleted);
    DELETE FROM UserSessions WHERE UserId IN (SELECT UserId FROM deleted);
    
    -- Then delete from Properties (which will cascade to PropertyMedia, PropertyAmenities)
    DELETE FROM Properties WHERE OwnerId IN (SELECT UserId FROM deleted);
    
    -- Then delete from other tables
    DELETE FROM Payments WHERE UserId IN (SELECT UserId FROM deleted);
    DELETE FROM Reviews WHERE ReviewerId IN (SELECT UserId FROM deleted) OR AgentId IN (SELECT UserId FROM deleted);
    DELETE FROM PropertyVisits WHERE TenantId IN (SELECT UserId FROM deleted) OR AgentId IN (SELECT UserId FROM deleted);
    DELETE FROM AuditLogs WHERE UserId IN (SELECT UserId FROM deleted);
    
    -- Finally delete the user
    DELETE FROM Users WHERE UserId IN (SELECT UserId FROM deleted);
END;
GO


CREATE TABLE EmailVerificationTokens (
    TokenId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    VerificationToken NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_EmailToken_User FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);



SELECT * FROM Users












-- subscription--

-- Subscription Plans (Static capabilities)
CREATE TABLE SubscriptionPlans (
    PlanId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    DisplayName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    
    -- Pricing
    BasePrice DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'KES',
    BillingCycle NVARCHAR(20) NOT NULL DEFAULT 'MONTHLY' 
        CHECK (BillingCycle IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY')),
    TrialDays INT NOT NULL DEFAULT 0,
    
    -- Features & Limits (Static capabilities)
    MaxProperties INT NOT NULL DEFAULT 5,
    MaxVisitsPerMonth INT NOT NULL DEFAULT 10,
    MaxMediaPerProperty INT NOT NULL DEFAULT 10,
    MaxAmenitiesPerProperty INT NOT NULL DEFAULT 15,
    AllowBoost BIT NOT NULL DEFAULT 0,
    MaxBoostsPerMonth INT NOT NULL DEFAULT 0,
    AllowPremiumSupport BIT NOT NULL DEFAULT 0,
    AllowAdvancedAnalytics BIT NOT NULL DEFAULT 0,
    AllowBulkOperations BIT NOT NULL DEFAULT 0,
    
    -- Visibility & Ordering
    IsActive BIT NOT NULL DEFAULT 1,
    IsVisible BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    HighlightFeatures NVARCHAR(MAX) NULL, -- JSON array of feature highlights
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- User Subscriptions (Time-bound contractual access)
CREATE TABLE UserSubscriptions (
    SubscriptionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PlanId UNIQUEIDENTIFIER NOT NULL,
    
    -- Billing & Contract
    PaymentId UNIQUEIDENTIFIER NULL, -- Reference to successful payment
    Price DECIMAL(10,2) NOT NULL, -- Actual price paid (allows discounts)
    Currency NVARCHAR(10) NOT NULL DEFAULT 'KES',
    BillingCycle NVARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    
    -- Time Period
    StartDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    EndDate DATETIME2 NOT NULL, -- Contractual end date
    TrialEndDate DATETIME2 NULL, -- When trial ends (if applicable)
    CancelAtPeriodEnd BIT NOT NULL DEFAULT 0,
    CancelledDate DATETIME2 NULL,
    
    -- Status
    Status NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (Status IN ('TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'SUSPENDED')),
    AutoRenew BIT NOT NULL DEFAULT 1,
    RenewalAttempts INT NOT NULL DEFAULT 0,
    LastRenewalAttempt DATETIME2 NULL,
    
    -- Usage Counters (Fast, deterministic limit checks)
    PropertiesUsed INT NOT NULL DEFAULT 0,
    VisitsUsedThisMonth INT NOT NULL DEFAULT 0,
    MediaUsedThisMonth INT NOT NULL DEFAULT 0,
    AmenitiesUsedThisMonth INT NOT NULL DEFAULT 0,
    BoostsUsedThisMonth INT NOT NULL DEFAULT 0,
    
    -- Reset tracking
    LastUsageReset DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    NextUsageReset DATETIME2 NOT NULL DEFAULT DATEADD(MONTH, 1, SYSDATETIME()),
    
    -- Audit
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_UserSubscription_User FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_UserSubscription_Plan FOREIGN KEY (PlanId) 
        REFERENCES SubscriptionPlans(PlanId),
    CONSTRAINT FK_UserSubscription_Payment FOREIGN KEY (PaymentId) 
        REFERENCES Payments(PaymentId)
);

-- Usage Logs (Append-only for auditing, analytics, dispute resolution)
CREATE TABLE SubscriptionUsageLogs (
    LogId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubscriptionId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    
    -- What was used
    Feature NVARCHAR(50) NOT NULL 
        CHECK (Feature IN ('PROPERTY_CREATE', 'VISIT_SCHEDULE', 'MEDIA_UPLOAD', 
                          'AMENITY_ADD', 'BOOST_PROPERTY', 'SUPPORT_TICKET',
                          'ANALYTICS_ACCESS', 'BULK_OPERATION')),
    ResourceId UNIQUEIDENTIFIER NULL, -- e.g., PropertyId, MediaId, etc.
    Action NVARCHAR(50) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    
    -- Usage context
    UsageCount INT NOT NULL DEFAULT 1,
    UsageDate DATE NOT NULL DEFAULT CAST(SYSDATETIME() AS DATE),
    UsageTimestamp DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    -- Enforcement context (what limits applied)
    WasGated BIT NOT NULL DEFAULT 0, -- Whether access was restricted
    GateType NVARCHAR(20) NULL CHECK (GateType IN ('SOFT', 'HARD', 'UPSELL')),
    OverrideReason NVARCHAR(200) NULL, -- Why gate was bypassed (admin, promo, etc.)
    
    -- Metadata
    IpAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    Metadata NVARCHAR(MAX) NULL, -- JSON context
    
    CONSTRAINT FK_UsageLog_Subscription FOREIGN KEY (SubscriptionId) 
        REFERENCES UserSubscriptions(SubscriptionId) ON DELETE CASCADE,
    CONSTRAINT FK_UsageLog_User FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE NO ACTION
);

-- Invoices & Billing
CREATE TABLE SubscriptionInvoices (
    InvoiceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubscriptionId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    
    -- Invoice details
    InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
    InvoiceDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DueDate DATETIME2 NOT NULL DEFAULT DATEADD(DAY, 7, SYSDATETIME()),
    PeriodStart DATETIME2 NOT NULL,
    PeriodEnd DATETIME2 NOT NULL,
    
    -- Amounts
    Subtotal DECIMAL(10,2) NOT NULL,
    TaxAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(10) NOT NULL DEFAULT 'KES',
    
    -- Payment status
    Status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (Status IN ('DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID', 'REFUNDED')),
    PaidAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    PaidDate DATETIME2 NULL,
    
    -- Payment reference
    PaymentId UNIQUEIDENTIFIER NULL,
    
    -- Line items (stored as JSON for flexibility)
    LineItems NVARCHAR(MAX) NOT NULL,
    
    -- PDF generation
    PdfUrl NVARCHAR(500) NULL,
    HtmlUrl NVARCHAR(500) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_Invoice_Subscription FOREIGN KEY (SubscriptionId) 
        REFERENCES UserSubscriptions(SubscriptionId) ON DELETE NO ACTION,
    CONSTRAINT FK_Invoice_User FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Invoice_Payment FOREIGN KEY (PaymentId) 
        REFERENCES Payments(PaymentId)
);

-- Feature Gates (Soft gating - visibility without action)
CREATE TABLE FeatureGates (
    GateId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Feature NVARCHAR(50) NOT NULL,
    GateType NVARCHAR(20) NOT NULL DEFAULT 'SOFT' 
        CHECK (GateType IN ('SOFT', 'HARD', 'UPSELL')),
    
    -- Gate triggers
    TriggerLimit INT NOT NULL, -- e.g., 80% of limit
    TriggerCount INT NOT NULL DEFAULT 0,
    
    -- Gate state
    IsActive BIT NOT NULL DEFAULT 1,
    LastTriggered DATETIME2 NULL,
    TriggerCountToday INT NOT NULL DEFAULT 0,
    
    -- Upsell context
    UpsellPlanId UNIQUEIDENTIFIER NULL,
    UpsellMessage NVARCHAR(500) NULL,
    UpsellCtaText NVARCHAR(100) NULL,
    UpsellCtaUrl NVARCHAR(500) NULL,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_FeatureGate_User FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_FeatureGate_UpsellPlan FOREIGN KEY (UpsellPlanId) 
        REFERENCES SubscriptionPlans(PlanId),
    UNIQUE (UserId, Feature)
);

-- Subscription Events (For async processing)
CREATE TABLE SubscriptionEvents (
    EventId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventType NVARCHAR(50) NOT NULL 
        CHECK (EventType IN ('SUBSCRIPTION_CREATED', 'SUBSCRIPTION_RENEWED', 
                            'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_EXPIRED',
                            'USAGE_LIMIT_REACHED', 'TRIAL_ENDING', 
                            'PAYMENT_FAILED', 'PAYMENT_SUCCEEDED',
                            'INVOICE_ISSUED', 'INVOICE_PAID')),
    
    -- Target entity
    SubscriptionId UNIQUEIDENTIFIER NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    InvoiceId UNIQUEIDENTIFIER NULL,
    PaymentId UNIQUEIDENTIFIER NULL,
    
    -- Event data
    EventData NVARCHAR(MAX) NOT NULL, -- JSON payload
    Processed BIT NOT NULL DEFAULT 0,
    ProcessedAt DATETIME2 NULL,
    ErrorMessage NVARCHAR(1000) NULL,
    RetryCount INT NOT NULL DEFAULT 0,
    
    -- Scheduling
    ScheduledFor DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    MaxRetries INT NOT NULL DEFAULT 3,
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_Event_Subscription FOREIGN KEY (SubscriptionId) 
        REFERENCES UserSubscriptions(SubscriptionId),
    CONSTRAINT FK_Event_User FOREIGN KEY (UserId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Event_Invoice FOREIGN KEY (InvoiceId) 
        REFERENCES SubscriptionInvoices(InvoiceId),
    CONSTRAINT FK_Event_Payment FOREIGN KEY (PaymentId) 
        REFERENCES Payments(PaymentId)
);

-- Create indexes for performance
CREATE INDEX IX_UserSubscriptions_UserId ON UserSubscriptions(UserId);
CREATE INDEX IX_UserSubscriptions_Status ON UserSubscriptions(Status);
CREATE INDEX IX_UserSubscriptions_EndDate ON UserSubscriptions(EndDate);
CREATE INDEX IX_UserSubscriptions_NextUsageReset ON UserSubscriptions(NextUsageReset);

CREATE INDEX IX_SubscriptionUsageLogs_UserId_Date ON SubscriptionUsageLogs(UserId, UsageDate);
CREATE INDEX IX_SubscriptionUsageLogs_SubscriptionId ON SubscriptionUsageLogs(SubscriptionId);
CREATE INDEX IX_SubscriptionUsageLogs_Feature ON SubscriptionUsageLogs(Feature);

CREATE INDEX IX_SubscriptionInvoices_UserId ON SubscriptionInvoices(UserId);
CREATE INDEX IX_SubscriptionInvoices_Status ON SubscriptionInvoices(Status);
CREATE INDEX IX_SubscriptionInvoices_DueDate ON SubscriptionInvoices(DueDate);

CREATE INDEX IX_SubscriptionEvents_Processed ON SubscriptionEvents(Processed);
CREATE INDEX IX_SubscriptionEvents_ScheduledFor ON SubscriptionEvents(ScheduledFor);
CREATE INDEX IX_SubscriptionEvents_UserId ON SubscriptionEvents(UserId);

CREATE INDEX IX_FeatureGates_UserId ON FeatureGates(UserId);
CREATE INDEX IX_FeatureGates_IsActive ON FeatureGates(IsActive);

-- Create view for active subscription with plan details
CREATE VIEW vw_ActiveUserSubscriptions AS
SELECT 
    us.SubscriptionId,
    us.UserId,
    us.PlanId,
    sp.Name as PlanName,
    sp.DisplayName as PlanDisplayName,
    sp.MaxProperties,
    sp.MaxVisitsPerMonth,
    sp.MaxMediaPerProperty,
    sp.MaxAmenitiesPerProperty,
    sp.AllowBoost,
    sp.MaxBoostsPerMonth,
    sp.AllowPremiumSupport,
    sp.AllowAdvancedAnalytics,
    sp.AllowBulkOperations,
    us.PropertiesUsed,
    us.VisitsUsedThisMonth,
    us.MediaUsedThisMonth,
    us.AmenitiesUsedThisMonth,
    us.BoostsUsedThisMonth,
    us.StartDate,
    us.EndDate,
    us.TrialEndDate,
    us.Status,
    us.AutoRenew,
    us.NextUsageReset,
    CASE 
        WHEN us.Status = 'TRIAL' AND us.TrialEndDate IS NOT NULL 
        THEN DATEDIFF(DAY, SYSDATETIME(), us.TrialEndDate)
        ELSE NULL
    END as DaysRemainingInTrial,
    DATEDIFF(DAY, SYSDATETIME(), us.EndDate) as DaysRemaining
FROM UserSubscriptions us
INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
WHERE us.Status IN ('TRIAL', 'ACTIVE')
AND us.EndDate > SYSDATETIME();

-- Create view for subscription usage summary
CREATE VIEW vw_SubscriptionUsageSummary AS
SELECT 
    us.UserId,
    us.SubscriptionId,
    us.PlanId,
    sp.DisplayName as PlanName,
    -- Current usage
    us.PropertiesUsed,
    sp.MaxProperties,
    CAST(us.PropertiesUsed AS FLOAT) / NULLIF(sp.MaxProperties, 0) * 100 as PropertiesUsagePercent,
    
    us.VisitsUsedThisMonth,
    sp.MaxVisitsPerMonth,
    CAST(us.VisitsUsedThisMonth AS FLOAT) / NULLIF(sp.MaxVisitsPerMonth, 0) * 100 as VisitsUsagePercent,
    
    us.BoostsUsedThisMonth,
    sp.MaxBoostsPerMonth,
    CAST(us.BoostsUsedThisMonth AS FLOAT) / NULLIF(sp.MaxBoostsPerMonth, 0) * 100 as BoostsUsagePercent,
    
    -- Limits
    CASE WHEN us.PropertiesUsed >= sp.MaxProperties THEN 1 ELSE 0 END as PropertiesLimitReached,
    CASE WHEN us.VisitsUsedThisMonth >= sp.MaxVisitsPerMonth THEN 1 ELSE 0 END as VisitsLimitReached,
    CASE WHEN us.BoostsUsedThisMonth >= sp.MaxBoostsPerMonth THEN 1 ELSE 0 END as BoostsLimitReached,
    
    -- Feature access
    sp.AllowBoost,
    sp.AllowPremiumSupport,
    sp.AllowAdvancedAnalytics,
    sp.AllowBulkOperations,
    
    -- Subscription info
    us.Status,
    us.StartDate,
    us.EndDate,
    us.TrialEndDate
FROM UserSubscriptions us
INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
WHERE us.Status IN ('TRIAL', 'ACTIVE')
AND us.EndDate > SYSDATETIME();

GO

-- Create stored procedure for checking usage limits (fast, deterministic)
CREATE PROCEDURE sp_CheckUsageLimit
    @UserId UNIQUEIDENTIFIER,
    @Feature NVARCHAR(50),
    @RequiredCount INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SubscriptionId UNIQUEIDENTIFIER;
    DECLARE @PlanId UNIQUEIDENTIFIER;
    DECLARE @CurrentUsage INT;
    DECLARE @MaxLimit INT;
    DECLARE @HasAccess BIT;
    DECLARE @IsGated BIT;
    DECLARE @GateType NVARCHAR(20);
    DECLARE @Remaining INT;
    
    -- Get active subscription
    SELECT TOP 1 
        @SubscriptionId = us.SubscriptionId,
        @PlanId = us.PlanId,
        @CurrentUsage = CASE @Feature
            WHEN 'PROPERTY_CREATE' THEN us.PropertiesUsed
            WHEN 'VISIT_SCHEDULE' THEN us.VisitsUsedThisMonth
            WHEN 'BOOST_PROPERTY' THEN us.BoostsUsedThisMonth
            ELSE 0
        END,
        @MaxLimit = CASE @Feature
            WHEN 'PROPERTY_CREATE' THEN sp.MaxProperties
            WHEN 'VISIT_SCHEDULE' THEN sp.MaxVisitsPerMonth
            WHEN 'BOOST_PROPERTY' THEN sp.MaxBoostsPerMonth
            ELSE 0
        END,
        @HasAccess = CASE @Feature
            WHEN 'BOOST_PROPERTY' THEN sp.AllowBoost
            WHEN 'PREMIUM_SUPPORT' THEN sp.AllowPremiumSupport
            WHEN 'ADVANCED_ANALYTICS' THEN sp.AllowAdvancedAnalytics
            WHEN 'BULK_OPERATIONS' THEN sp.AllowBulkOperations
            ELSE 1 -- Default to allowed
        END
    FROM UserSubscriptions us
    INNER JOIN SubscriptionPlans sp ON us.PlanId = sp.PlanId
    WHERE us.UserId = @UserId
    AND us.Status IN ('TRIAL', 'ACTIVE')
    AND us.EndDate > SYSDATETIME();
    
    -- If no subscription, check default (free) limits
    IF @SubscriptionId IS NULL
    BEGIN
        SELECT TOP 1 
            @MaxLimit = CASE @Feature
                WHEN 'PROPERTY_CREATE' THEN MaxProperties
                WHEN 'VISIT_SCHEDULE' THEN MaxVisitsPerMonth
                WHEN 'BOOST_PROPERTY' THEN MaxBoostsPerMonth
                ELSE 0
            END
        FROM SubscriptionPlans
        WHERE Name = 'FREE'
        AND IsActive = 1;
        
        SET @CurrentUsage = 0;
        SET @HasAccess = CASE @Feature
            WHEN 'BOOST_PROPERTY' THEN 0
            WHEN 'PREMIUM_SUPPORT' THEN 0
            WHEN 'ADVANCED_ANALYTICS' THEN 0
            WHEN 'BULK_OPERATIONS' THEN 0
            ELSE 1
        END;
    END
    
    -- Calculate remaining
    SET @Remaining = @MaxLimit - @CurrentUsage;
    
    -- Check if gated
    IF @Remaining < @RequiredCount
    BEGIN
        SET @IsGated = 1;
        SET @GateType = 'HARD';
    END
    ELSE IF @Remaining <= (@MaxLimit * 0.2) -- 80% usage triggers soft gate
    BEGIN
        SET @IsGated = 1;
        SET @GateType = 'SOFT';
    END
    ELSE
    BEGIN
        SET @IsGated = 0;
        SET @GateType = NULL;
    END
    
    -- Return result
    SELECT 
        @HasAccess as HasAccess,
        @IsGated as IsGated,
        @GateType as GateType,
        @CurrentUsage as CurrentUsage,
        @MaxLimit as MaxLimit,
        @Remaining as Remaining,
        @SubscriptionId as SubscriptionId,
        @PlanId as PlanId
END
GO

-- Create stored procedure for recording usage
CREATE PROCEDURE sp_RecordUsage
    @UserId UNIQUEIDENTIFIER,
    @Feature NVARCHAR(50),
    @ResourceId UNIQUEIDENTIFIER = NULL,
    @Action NVARCHAR(50) = 'CREATE',
    @Count INT = 1,
    @Override BIT = 0,
    @OverrideReason NVARCHAR(200) = NULL,
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    DECLARE @SubscriptionId UNIQUEIDENTIFIER;
    DECLARE @WasGated BIT;
    DECLARE @GateType NVARCHAR(20);
    DECLARE @CurrentUsage INT;
    DECLARE @MaxLimit INT;
    
    -- First, check the limit
    EXEC sp_CheckUsageLimit 
        @UserId = @UserId,
        @Feature = @Feature,
        @RequiredCount = @Count;
        
    -- Get the results
    SELECT 
    @WasGated = IsGated,
    @GateType = GateType,
    @CurrentUsage = CurrentUsage,
    @MaxLimit = MaxLimit,
    @SubscriptionId = SubscriptionId
FROM dbo.fn_CheckUsageLimit(@UserId, @Feature, @Count);

    
    -- If gated and not overridden, don't proceed
    IF @WasGated = 1 AND @Override = 0
    BEGIN
        ROLLBACK;
        THROW 50001, 'Usage limit reached. Please upgrade your plan.', 1;
        RETURN;
    END
    
    -- Update usage counters (if subscription exists)
    IF @SubscriptionId IS NOT NULL
    BEGIN
        UPDATE UserSubscriptions
        SET 
            PropertiesUsed = CASE WHEN @Feature = 'PROPERTY_CREATE' 
                THEN PropertiesUsed + @Count ELSE PropertiesUsed END,
            VisitsUsedThisMonth = CASE WHEN @Feature = 'VISIT_SCHEDULE' 
                THEN VisitsUsedThisMonth + @Count ELSE VisitsUsedThisMonth END,
            BoostsUsedThisMonth = CASE WHEN @Feature = 'BOOST_PROPERTY' 
                THEN BoostsUsedThisMonth + @Count ELSE BoostsUsedThisMonth END,
            UpdatedAt = SYSDATETIME()
        WHERE SubscriptionId = @SubscriptionId;
    END
    
    -- Log the usage
    INSERT INTO SubscriptionUsageLogs (
        SubscriptionId,
        UserId,
        Feature,
        ResourceId,
        Action,
        UsageCount,
        WasGated,
        GateType,
        OverrideReason,
        IpAddress,
        UserAgent,
        Metadata
    ) VALUES (
        @SubscriptionId,
        @UserId,
        @Feature,
        @ResourceId,
        @Action,
        @Count,
        @WasGated,
        @GateType,
        CASE WHEN @Override = 1 THEN @OverrideReason ELSE NULL END,
        @IpAddress,
        @UserAgent,
        @Metadata
    );
    
    -- If nearing limit, create a soft gate event
    IF @GateType = 'SOFT' AND @Override = 0
    BEGIN
        INSERT INTO SubscriptionEvents (
            EventType,
            UserId,
            SubscriptionId,
            EventData,
            ScheduledFor
        ) VALUES (
            'USAGE_LIMIT_REACHED',
            @UserId,
            @SubscriptionId,
            JSON_OBJECT(
                'feature': @Feature,
                'currentUsage': @CurrentUsage + @Count,
                'maxLimit': @MaxLimit,
                'gateType': 'SOFT',
                'percentageUsed': CAST((@CurrentUsage + @Count) AS FLOAT) / NULLIF(@MaxLimit, 0) * 100
            ),
            SYSDATETIME()
        );
    END
    
    COMMIT TRANSACTION;
END
GO

-- Create stored procedure for resetting monthly usage
CREATE PROCEDURE sp_ResetMonthlyUsage
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE UserSubscriptions
    SET 
        VisitsUsedThisMonth = 0,
        MediaUsedThisMonth = 0,
        AmenitiesUsedThisMonth = 0,
        BoostsUsedThisMonth = 0,
        LastUsageReset = SYSDATETIME(),
        NextUsageReset = DATEADD(MONTH, 1, SYSDATETIME()),
        UpdatedAt = SYSDATETIME()
    WHERE NextUsageReset <= SYSDATETIME()
    AND Status IN ('TRIAL', 'ACTIVE');
    
    -- Log the reset
    INSERT INTO SubscriptionEvents (
        EventType,
        EventData,
        ScheduledFor
    )
    SELECT 
        'USAGE_LIMIT_REACHED', -- Reuse for reset notification
        JSON_OBJECT(
            'resetType': 'MONTHLY',
            'resetDate': CAST(SYSDATETIME() AS NVARCHAR(50)),
            'affectedSubscriptions': COUNT(*)
        ),
        SYSDATETIME()
    FROM UserSubscriptions
    WHERE NextUsageReset <= SYSDATETIME()
    AND Status IN ('TRIAL', 'ACTIVE');
END
GO

-- Create trigger for UpdatedAt
CREATE TRIGGER trg_UpdateSubscriptionPlansTimestamp 
ON SubscriptionPlans
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SubscriptionPlans
    SET UpdatedAt = SYSDATETIME()
    FROM SubscriptionPlans sp
    INNER JOIN inserted i ON sp.PlanId = i.PlanId
END;
GO

CREATE TRIGGER trg_UpdateUserSubscriptionsTimestamp 
ON UserSubscriptions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE UserSubscriptions
    SET UpdatedAt = SYSDATETIME()
    FROM UserSubscriptions us
    INNER JOIN inserted i ON us.SubscriptionId = i.SubscriptionId
END;
GO

CREATE TRIGGER trg_UpdateSubscriptionInvoicesTimestamp 
ON SubscriptionInvoices
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SubscriptionInvoices
    SET UpdatedAt = SYSDATETIME()
    FROM SubscriptionInvoices si
    INNER JOIN inserted i ON si.InvoiceId = i.InvoiceId
END;
GO

CREATE TRIGGER trg_UpdateFeatureGatesTimestamp 
ON FeatureGates
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE FeatureGates
    SET UpdatedAt = SYSDATETIME()
    FROM FeatureGates fg
    INNER JOIN inserted i ON fg.GateId = i.GateId
END;
GO



CREATE TRIGGER trg_UpdateUsersTimestamp 
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Use a different approach that doesn't conflict with OUTPUT clause
    UPDATE u
    SET UpdatedAt = SYSDATETIME()
    FROM Users u
    INNER JOIN inserted i ON u.UserId = i.UserId;
END;