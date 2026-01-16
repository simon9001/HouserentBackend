CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES
-- ============================================================================
SELECT * FROM "Users"

UPDATE "Users"
SET "Role" = 'ADMIN',
    "UpdatedAt" = NOW()
WHERE "Email" = 'maiyumusyoka4@gmail.com';
-- Users table with Username for login
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE "Users" (
    "UserId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Username" VARCHAR(50) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(500) NOT NULL,
    "FullName" VARCHAR(150) NOT NULL,
    "PhoneNumber" VARCHAR(20) NOT NULL UNIQUE,
    "Email" VARCHAR(150) NOT NULL UNIQUE,
    "Bio" VARCHAR(500),
    "Address" VARCHAR(255),
    "AvatarUrl" VARCHAR(500),
    "Role" VARCHAR(20) NOT NULL DEFAULT 'TENANT' CHECK ("Role" IN ('TENANT', 'AGENT', 'ADMIN')),
    "AgentStatus" VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK ("AgentStatus" IN ('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    "TrustScore" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "LoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "LastLogin" TIMESTAMPTZ,
    "LockedUntil" TIMESTAMPTZ,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "IsEmailVerified" BOOLEAN NOT NULL DEFAULT false
);
-- Indexes for users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- AGENT VERIFICATION
-- ============================================================================

CREATE TABLE agent_verification (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    national_id VARCHAR(50) NOT NULL,
    selfie_url VARCHAR(500) NOT NULL,
    id_front_url VARCHAR(500) NOT NULL,
    id_back_url VARCHAR(500),
    property_proof_url VARCHAR(500),
    
    reviewed_by UUID REFERENCES users(user_id),
    review_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    review_notes VARCHAR(500),
    
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_verification_user_id ON agent_verification(user_id);
CREATE INDEX idx_agent_verification_status ON agent_verification(review_status);

-- ============================================================================
-- PROPERTIES
-- ============================================================================

CREATE TABLE properties (
    property_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    
    -- Address details
    county VARCHAR(100) NOT NULL,
    constituency VARCHAR(100),
    area VARCHAR(150) NOT NULL,
    street_address VARCHAR(500),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    
    -- Property details
    property_type VARCHAR(50) NOT NULL DEFAULT 'APARTMENT' CHECK (property_type IN ('APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'OTHER')),
    bedrooms INTEGER,
    bathrooms INTEGER,
    
    rules TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_boosted BOOLEAN NOT NULL DEFAULT false,
    boost_expiry TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for properties
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_is_available ON properties(is_available);
CREATE INDEX idx_properties_is_boosted ON properties(is_boosted);
CREATE INDEX idx_properties_location ON properties(county, area);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_coordinates ON properties(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================================================================
-- PROPERTY MEDIA
-- ============================================================================

CREATE TABLE property_media (
    media_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'DOCUMENT')),
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_media_property_id ON property_media(property_id);
CREATE INDEX idx_property_media_is_primary ON property_media(property_id, is_primary);

-- ============================================================================
-- PROPERTY AMENITIES
-- ============================================================================

CREATE TABLE property_amenities (
    amenity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_amenities_property_id ON property_amenities(property_id);

-- ============================================================================
-- USER RELATIONSHIPS
-- ============================================================================

-- User follows
CREATE TABLE user_follows (
    follower_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id != followed_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_followed ON user_follows(followed_id);

-- Saved Properties
CREATE TABLE saved_properties (
    saved_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (user_id, property_id)
);

CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX idx_saved_properties_property_id ON saved_properties(property_id);

-- ============================================================================
-- PROPERTY VISITS
-- ============================================================================

CREATE TABLE property_visits (
    visit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(user_id),
    agent_id UUID NOT NULL REFERENCES users(user_id),
    
    visit_date TIMESTAMPTZ NOT NULL,
    visit_purpose VARCHAR(200),
    tenant_notes VARCHAR(500),
    agent_notes VARCHAR(500),
    
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_visits_property_id ON property_visits(property_id);
CREATE INDEX idx_property_visits_tenant_id ON property_visits(tenant_id);
CREATE INDEX idx_property_visits_agent_id ON property_visits(agent_id);
CREATE INDEX idx_property_visits_status ON property_visits(status);
CREATE INDEX idx_property_visits_date ON property_visits(visit_date);

-- ============================================================================
-- REVIEWS
-- ============================================================================

CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(property_id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(user_id),
    agent_id UUID NOT NULL REFERENCES users(user_id),
    
    review_type VARCHAR(20) NOT NULL DEFAULT 'AGENT' CHECK (review_type IN ('PROPERTY', 'AGENT')),
    
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(1000),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_agent_id ON reviews(agent_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    property_id UUID REFERENCES properties(property_id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    payment_provider VARCHAR(50) NOT NULL,
    provider_reference VARCHAR(150) NOT NULL,
    
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('ACCESS', 'BOOST', 'SUBSCRIPTION', 'BOOKING', 'DEPOSIT')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_property_id ON payments(property_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_purpose ON payments(purpose);

-- ============================================================================
-- AUDIT & SECURITY
-- ============================================================================

-- Audit logs
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    metadata JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- User sessions
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_id VARCHAR(200),
    refresh_token_hash VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    verification_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- ============================================================================
-- USER STATUS/STORIES
-- ============================================================================

CREATE TABLE user_status (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    media_url VARCHAR(500),
    text_content VARCHAR(500),
    background_color VARCHAR(20) DEFAULT 'bg-blue-500',
    type VARCHAR(20) NOT NULL DEFAULT 'IMAGE' CHECK (type IN ('IMAGE', 'VIDEO', 'TEXT')),
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_status_user_id ON user_status(user_id);
CREATE INDEX idx_user_status_expires_at ON user_status(expires_at) WHERE is_active = true;

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

-- Subscription Plans
CREATE TABLE subscription_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY')),
    trial_days INTEGER NOT NULL DEFAULT 0,
    
    max_properties INTEGER NOT NULL DEFAULT 5,
    max_visits_per_month INTEGER NOT NULL DEFAULT 10,
    max_media_per_property INTEGER NOT NULL DEFAULT 10,
    max_amenities_per_property INTEGER NOT NULL DEFAULT 15,
    allow_boost BOOLEAN NOT NULL DEFAULT false,
    max_boosts_per_month INTEGER NOT NULL DEFAULT 0,
    allow_premium_support BOOLEAN NOT NULL DEFAULT false,
    allow_advanced_analytics BOOLEAN NOT NULL DEFAULT false,
    allow_bulk_operations BOOLEAN NOT NULL DEFAULT false,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    highlight_features JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(plan_id),
    
    payment_id UUID REFERENCES payments(payment_id),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    trial_end_date TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    cancelled_date TIMESTAMPTZ,
    
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE', 'SUSPENDED')),
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    renewal_attempts INTEGER NOT NULL DEFAULT 0,
    last_renewal_attempt TIMESTAMPTZ,
    
    properties_used INTEGER NOT NULL DEFAULT 0,
    visits_used_this_month INTEGER NOT NULL DEFAULT 0,
    media_used_this_month INTEGER NOT NULL DEFAULT 0,
    amenities_used_this_month INTEGER NOT NULL DEFAULT 0,
    boosts_used_this_month INTEGER NOT NULL DEFAULT 0,
    
    last_usage_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_usage_reset TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions(end_date);
CREATE INDEX idx_user_subscriptions_next_reset ON user_subscriptions(next_usage_reset);

-- Subscription Usage Logs
CREATE TABLE subscription_usage_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(subscription_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id),
    
    feature VARCHAR(50) NOT NULL CHECK (feature IN ('PROPERTY_CREATE', 'VISIT_SCHEDULE', 'MEDIA_UPLOAD', 'AMENITY_ADD', 'BOOST_PROPERTY', 'SUPPORT_TICKET', 'ANALYTICS_ACCESS', 'BULK_OPERATION')),
    resource_id UUID,
    action VARCHAR(50) NOT NULL,
    
    usage_count INTEGER NOT NULL DEFAULT 1,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    usage_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    was_gated BOOLEAN NOT NULL DEFAULT false,
    gate_type VARCHAR(20) CHECK (gate_type IN ('SOFT', 'HARD', 'UPSELL')),
    override_reason VARCHAR(200),
    
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    metadata JSONB
);

CREATE INDEX idx_subscription_usage_logs_subscription ON subscription_usage_logs(subscription_id);
CREATE INDEX idx_subscription_usage_logs_user_date ON subscription_usage_logs(user_id, usage_date);
CREATE INDEX idx_subscription_usage_logs_feature ON subscription_usage_logs(feature);

-- Subscription Invoices
CREATE TABLE subscription_invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(subscription_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KES',
    
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID', 'REFUNDED')),
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_date TIMESTAMPTZ,
    
    payment_id UUID REFERENCES payments(payment_id),
    
    line_items JSONB NOT NULL,
    
    pdf_url VARCHAR(500),
    html_url VARCHAR(500),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_invoices_user_id ON subscription_invoices(user_id);
CREATE INDEX idx_subscription_invoices_subscription_id ON subscription_invoices(subscription_id);
CREATE INDEX idx_subscription_invoices_status ON subscription_invoices(status);
CREATE INDEX idx_subscription_invoices_due_date ON subscription_invoices(due_date);

-- Feature Gates
CREATE TABLE feature_gates (
    gate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL,
    gate_type VARCHAR(20) NOT NULL DEFAULT 'SOFT' CHECK (gate_type IN ('SOFT', 'HARD', 'UPSELL')),
    
    trigger_limit INTEGER NOT NULL,
    trigger_count INTEGER NOT NULL DEFAULT 0,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_triggered TIMESTAMPTZ,
    trigger_count_today INTEGER NOT NULL DEFAULT 0,
    
    upsell_plan_id UUID REFERENCES subscription_plans(plan_id),
    upsell_message VARCHAR(500),
    upsell_cta_text VARCHAR(100),
    upsell_cta_url VARCHAR(500),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (user_id, feature)
);

CREATE INDEX idx_feature_gates_user_id ON feature_gates(user_id);
CREATE INDEX idx_feature_gates_is_active ON feature_gates(is_active);

-- Subscription Events
CREATE TABLE subscription_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('SUBSCRIPTION_CREATED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_EXPIRED', 'USAGE_LIMIT_REACHED', 'TRIAL_ENDING', 'PAYMENT_FAILED', 'PAYMENT_SUCCEEDED', 'INVOICE_ISSUED', 'INVOICE_PAID')),
    
    subscription_id UUID REFERENCES user_subscriptions(subscription_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    invoice_id UUID REFERENCES subscription_invoices(invoice_id),
    payment_id UUID REFERENCES payments(payment_id),
    
    event_data JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message VARCHAR(1000),
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    max_retries INTEGER NOT NULL DEFAULT 3,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_processed ON subscription_events(processed);
CREATE INDEX idx_subscription_events_scheduled ON subscription_events(scheduled_for);
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('BOOKING', 'PAYMENT', 'REVIEW', 'SYSTEM', 'ALERT')),
    reference_id UUID,
    
    is_read BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

-- Conversations
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES users(user_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    
    last_message_at TIMESTAMPTZ,
    last_message_preview VARCHAR(200),
    unread_count_for_tenant INTEGER NOT NULL DEFAULT 0,
    unread_count_for_agent INTEGER NOT NULL DEFAULT 0,
    is_archived_by_tenant BOOLEAN NOT NULL DEFAULT false,
    is_archived_by_agent BOOLEAN NOT NULL DEFAULT false,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    blocked_by UUID REFERENCES users(user_id),
    block_reason VARCHAR(500),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (property_id, agent_id, user_id)
);

CREATE INDEX idx_conversations_property_id ON conversations(property_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id),
    
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CONTACT')),
    media_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    is_edited BOOLEAN NOT NULL DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(user_id)
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at DESC);

-- Message Reactions
CREATE TABLE message_reactions (
    reaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id),
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'LIKE' CHECK (reaction_type IN ('LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (message_id, user_id)
);

CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Create a generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_visits_updated_at BEFORE UPDATE ON property_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_invoices_updated_at BEFORE UPDATE ON subscription_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_gates_updated_at BEFORE UPDATE ON feature_gates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MESSAGING TRIGGERS
-- ============================================================================

-- Trigger to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = CASE 
            WHEN NEW.message_type = 'TEXT' THEN LEFT(NEW.content, 200)
            WHEN NEW.message_type = 'IMAGE' THEN '📷 Image'
            WHEN NEW.message_type = 'VIDEO' THEN '🎥 Video'
            WHEN NEW.message_type = 'DOCUMENT' THEN '📄 Document'
            WHEN NEW.message_type = 'LOCATION' THEN '📍 Location'
            WHEN NEW.message_type = 'CONTACT' THEN '👤 Contact'
            ELSE 'New message'
        END,
        unread_count_for_tenant = CASE 
            WHEN NEW.sender_id = (SELECT agent_id FROM conversations WHERE conversation_id = NEW.conversation_id)
            THEN unread_count_for_tenant + 1
            ELSE unread_count_for_tenant
        END,
        unread_count_for_agent = CASE 
            WHEN NEW.sender_id = (SELECT user_id FROM conversations WHERE conversation_id = NEW.conversation_id)
            THEN unread_count_for_agent + 1
            ELSE unread_count_for_agent
        END
    WHERE conversation_id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Trigger to update conversation when message is read
CREATE OR REPLACE FUNCTION update_conversation_on_message_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
        UPDATE conversations
        SET 
            unread_count_for_tenant = CASE 
                WHEN NEW.sender_id = (SELECT agent_id FROM conversations WHERE conversation_id = NEW.conversation_id)
                THEN GREATEST(unread_count_for_tenant - 1, 0)
                ELSE unread_count_for_tenant
            END,
            unread_count_for_agent = CASE 
                WHEN NEW.sender_id = (SELECT user_id FROM conversations WHERE conversation_id = NEW.conversation_id)
                THEN GREATEST(unread_count_for_agent - 1, 0)
                ELSE unread_count_for_agent
            END
        WHERE conversation_id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_read
    AFTER UPDATE OF read_at ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message_read();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active user subscriptions
CREATE OR REPLACE VIEW vw_active_user_subscriptions AS
SELECT 
    us.subscription_id,
    us.user_id,
    us.plan_id,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    sp.max_properties,
    sp.max_visits_per_month,
    sp.max_media_per_property,
    sp.max_amenities_per_property,
    sp.allow_boost,
    sp.max_boosts_per_month,
    sp.allow_premium_support,
    sp.allow_advanced_analytics,
    sp.allow_bulk_operations,
    us.properties_used,
    us.visits_used_this_month,
    us.media_used_this_month,
    us.amenities_used_this_month,
    us.boosts_used_this_month,
    us.start_date,
    us.end_date,
    us.trial_end_date,
    us.status,
    us.auto_renew,
    us.next_usage_reset,
    CASE 
        WHEN us.status = 'TRIAL' AND us.trial_end_date IS NOT NULL 
        THEN EXTRACT(DAY FROM (us.trial_end_date - NOW()))
        ELSE NULL
    END as days_remaining_in_trial,
    EXTRACT(DAY FROM (us.end_date - NOW())) as days_remaining
FROM user_subscriptions us
INNER JOIN subscription_plans sp ON us.plan_id = sp.plan_id
WHERE us.status IN ('TRIAL', 'ACTIVE')
AND us.end_date > NOW();

-- View for subscription usage summary
CREATE OR REPLACE VIEW vw_subscription_usage_summary AS
SELECT 
    us.user_id,
    us.subscription_id,
    us.plan_id,
    sp.display_name as plan_name,
    
    us.properties_used,
    sp.max_properties,
    CASE WHEN sp.max_properties > 0 
        THEN (us.properties_used::FLOAT / sp.max_properties * 100)::INTEGER 
        ELSE 0 
    END as properties_usage_percent,
    
    us.visits_used_this_month,
    sp.max_visits_per_month,
    CASE WHEN sp.max_visits_per_month > 0 
        THEN (us.visits_used_this_month::FLOAT / sp.max_visits_per_month * 100)::INTEGER 
        ELSE 0 
    END as visits_usage_percent,
    
    us.boosts_used_this_month,
    sp.max_boosts_per_month,
    CASE WHEN sp.max_boosts_per_month > 0 
        THEN (us.boosts_used_this_month::FLOAT / sp.max_boosts_per_month * 100)::INTEGER 
        ELSE 0 
    END as boosts_usage_percent,
    
    (us.properties_used >= sp.max_properties) as properties_limit_reached,
    (us.visits_used_this_month >= sp.max_visits_per_month) as visits_limit_reached,
    (us.boosts_used_this_month >= sp.max_boosts_per_month) as boosts_limit_reached,
    
    sp.allow_boost,
    sp.allow_premium_support,
    sp.allow_advanced_analytics,
    sp.allow_bulk_operations,
    
    us.status,
    us.start_date,
    us.end_date,
    us.trial_end_date
FROM user_subscriptions us
INNER JOIN subscription_plans sp ON us.plan_id = sp.plan_id
WHERE us.status IN ('TRIAL', 'ACTIVE')
AND us.end_date > NOW();

-- View for conversation details
CREATE OR REPLACE VIEW vw_conversation_details AS
SELECT 
    c.conversation_id,
    c.property_id,
    c.agent_id,
    c.user_id as tenant_id,
    p.title as property_title,
    p.rent_amount,
    pm.media_url as property_image,
    a.full_name as agent_name,
    a.email as agent_email,
    a.phone_number as agent_phone,
    a.avatar_url as agent_avatar,
    t.full_name as tenant_name,
    t.email as tenant_email,
    t.phone_number as tenant_phone,
    t.avatar_url as tenant_avatar,
    c.last_message_at,
    c.last_message_preview,
    c.unread_count_for_tenant,
    c.unread_count_for_agent,
    c.created_at as conversation_created_at,
    c.is_archived_by_tenant,
    c.is_archived_by_agent,
    c.is_blocked,
    c.blocked_by,
    c.block_reason
FROM conversations c
INNER JOIN properties p ON c.property_id = p.property_id
LEFT JOIN property_media pm ON p.property_id = pm.property_id AND pm.is_primary = true
INNER JOIN users a ON c.agent_id = a.user_id
INNER JOIN users t ON c.user_id = t.user_id;

-- View for property listings
CREATE OR REPLACE VIEW vw_property_listings AS
SELECT 
    p.property_id,
    p.title,
    p.description,
    p.rent_amount,
    p.deposit_amount,
    p.county,
    p.area,
    p.street_address,
    p.property_type,
    p.bedrooms,
    p.bathrooms,
    p.is_available,
    p.is_verified,
    p.is_boosted,
    p.boost_expiry,
    u.user_id as owner_id,
    u.full_name as owner_name,
    u.trust_score as owner_trust_score,
    p.created_at,
    p.updated_at
FROM properties p
INNER JOIN users u ON p.owner_id = u.user_id
WHERE p.is_available = true AND u.is_active = true;

-- ============================================================================
-- STORED PROCEDURES / FUNCTIONS
-- ============================================================================

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_feature VARCHAR(50),
    p_required_count INTEGER DEFAULT 1
)
RETURNS TABLE (
    has_access BOOLEAN,
    is_gated BOOLEAN,
    gate_type VARCHAR(20),
    current_usage INTEGER,
    max_limit INTEGER,
    remaining INTEGER,
    subscription_id UUID,
    plan_id UUID
) AS $$
DECLARE
    v_subscription_id UUID;
    v_plan_id UUID;
    v_current_usage INTEGER;
    v_max_limit INTEGER;
    v_has_access BOOLEAN;
    v_is_gated BOOLEAN;
    v_gate_type VARCHAR(20);
    v_remaining INTEGER;
BEGIN
    -- Get active subscription
    SELECT 
        us.subscription_id,
        us.plan_id,
        CASE p_feature
            WHEN 'PROPERTY_CREATE' THEN us.properties_used
            WHEN 'VISIT_SCHEDULE' THEN us.visits_used_this_month
            WHEN 'BOOST_PROPERTY' THEN us.boosts_used_this_month
            ELSE 0
        END,
        CASE p_feature
            WHEN 'PROPERTY_CREATE' THEN sp.max_properties
            WHEN 'VISIT_SCHEDULE' THEN sp.max_visits_per_month
            WHEN 'BOOST_PROPERTY' THEN sp.max_boosts_per_month
            ELSE 0
        END,
        CASE p_feature
            WHEN 'BOOST_PROPERTY' THEN sp.allow_boost
            WHEN 'PREMIUM_SUPPORT' THEN sp.allow_premium_support
            WHEN 'ADVANCED_ANALYTICS' THEN sp.allow_advanced_analytics
            WHEN 'BULK_OPERATIONS' THEN sp.allow_bulk_operations
            ELSE true
        END
    INTO v_subscription_id, v_plan_id, v_current_usage, v_max_limit, v_has_access
    FROM user_subscriptions us
    INNER JOIN subscription_plans sp ON us.plan_id = sp.plan_id
    WHERE us.user_id = p_user_id
    AND us.status IN ('TRIAL', 'ACTIVE')
    AND us.end_date > NOW()
    LIMIT 1;
    
    -- If no subscription, use FREE plan defaults
    IF v_subscription_id IS NULL THEN
        SELECT 
            plan_id,
            CASE p_feature
                WHEN 'PROPERTY_CREATE' THEN max_properties
                WHEN 'VISIT_SCHEDULE' THEN max_visits_per_month
                WHEN 'BOOST_PROPERTY' THEN max_boosts_per_month
                ELSE 0
            END
        INTO v_plan_id, v_max_limit
        FROM subscription_plans
        WHERE name = 'FREE' AND is_active = true
        LIMIT 1;
        
        v_current_usage := 0;
        v_has_access := CASE p_feature
            WHEN 'BOOST_PROPERTY' THEN false
            WHEN 'PREMIUM_SUPPORT' THEN false
            WHEN 'ADVANCED_ANALYTICS' THEN false
            WHEN 'BULK_OPERATIONS' THEN false
            ELSE true
        END;
    END IF;
    
    -- Calculate remaining
    v_remaining := v_max_limit - v_current_usage;
    
    -- Check if gated
    IF v_remaining < p_required_count THEN
        v_is_gated := true;
        v_gate_type := 'HARD';
    ELSIF v_remaining <= (v_max_limit * 0.2) THEN
        v_is_gated := true;
        v_gate_type := 'SOFT';
    ELSE
        v_is_gated := false;
        v_gate_type := NULL;
    END IF;
    
    -- Return results
    RETURN QUERY SELECT 
        v_has_access,
        v_is_gated,
        v_gate_type,
        v_current_usage,
        v_max_limit,
        v_remaining,
        v_subscription_id,
        v_plan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record usage
CREATE OR REPLACE FUNCTION record_usage(
    p_user_id UUID,
    p_feature VARCHAR(50),
    p_resource_id UUID DEFAULT NULL,
    p_action VARCHAR(50) DEFAULT 'CREATE',
    p_count INTEGER DEFAULT 1,
    p_override BOOLEAN DEFAULT false,
    p_override_reason VARCHAR(200) DEFAULT NULL,
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_user_agent VARCHAR(500) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_id UUID;
    v_was_gated BOOLEAN;
    v_gate_type VARCHAR(20);
    v_limit_check RECORD;
BEGIN
    -- Check the limit
    SELECT * INTO v_limit_check
    FROM check_usage_limit(p_user_id, p_feature, p_count);
    
    v_subscription_id := v_limit_check.subscription_id;
    v_was_gated := v_limit_check.is_gated;
    v_gate_type := v_limit_check.gate_type;
    
    -- If gated and not overridden, don't proceed
    IF v_was_gated AND NOT p_override THEN
        RAISE EXCEPTION 'Usage limit reached. Please upgrade your plan.';
    END IF;
    
    -- Update usage counters if subscription exists
    IF v_subscription_id IS NOT NULL THEN
        UPDATE user_subscriptions
        SET 
            properties_used = CASE WHEN p_feature = 'PROPERTY_CREATE' 
                THEN properties_used + p_count ELSE properties_used END,
            visits_used_this_month = CASE WHEN p_feature = 'VISIT_SCHEDULE' 
                THEN visits_used_this_month + p_count ELSE visits_used_this_month END,
            boosts_used_this_month = CASE WHEN p_feature = 'BOOST_PROPERTY' 
                THEN boosts_used_this_month + p_count ELSE boosts_used_this_month END,
            updated_at = NOW()
        WHERE subscription_id = v_subscription_id;
    END IF;
    
    -- Log the usage
    INSERT INTO subscription_usage_logs (
        subscription_id,
        user_id,
        feature,
        resource_id,
        action,
        usage_count,
        was_gated,
        gate_type,
        override_reason,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        v_subscription_id,
        p_user_id,
        p_feature,
        p_resource_id,
        p_action,
        p_count,
        v_was_gated,
        v_gate_type,
        CASE WHEN p_override THEN p_override_reason ELSE NULL END,
        p_ip_address,
        p_user_agent,
        p_metadata
    );
    
    -- If nearing limit, create a soft gate event
    IF v_gate_type = 'SOFT' AND NOT p_override THEN
        INSERT INTO subscription_events (
            event_type,
            user_id,
            subscription_id,
            event_data,
            scheduled_for
        ) VALUES (
            'USAGE_LIMIT_REACHED',
            p_user_id,
            v_subscription_id,
            jsonb_build_object(
                'feature', p_feature,
                'currentUsage', v_limit_check.current_usage + p_count,
                'maxLimit', v_limit_check.max_limit,
                'gateType', 'SOFT',
                'percentageUsed', ((v_limit_check.current_usage + p_count)::FLOAT / NULLIF(v_limit_check.max_limit, 0) * 100)
            ),
            NOW()
        );
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER AS $$
DECLARE
    v_affected_count INTEGER;
BEGIN
    UPDATE user_subscriptions
    SET 
        visits_used_this_month = 0,
        media_used_this_month = 0,
        amenities_used_this_month = 0,
        boosts_used_this_month = 0,
        last_usage_reset = NOW(),
        next_usage_reset = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE next_usage_reset <= NOW()
    AND status IN ('TRIAL', 'ACTIVE');
    
    GET DIAGNOSTICS v_affected_count = ROW_COUNT;
    
    RETURN v_affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to start a conversation
CREATE OR REPLACE FUNCTION start_conversation(
    p_property_id UUID,
    p_agent_id UUID,
    p_user_id UUID,
    p_initial_message TEXT DEFAULT NULL,
    p_message_type VARCHAR(20) DEFAULT 'TEXT'
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_message_id UUID;
BEGIN
    -- Check if conversation already exists
    SELECT conversation_id INTO v_conversation_id
    FROM conversations
    WHERE property_id = p_property_id
      AND agent_id = p_agent_id
      AND user_id = p_user_id;
    
    -- If conversation doesn't exist, create it
    IF v_conversation_id IS NULL THEN
        v_conversation_id := uuid_generate_v4();
        
        INSERT INTO conversations (
            conversation_id,
            property_id,
            agent_id,
            user_id,
            created_at,
            last_message_at,
            last_message_preview
        ) VALUES (
            v_conversation_id,
            p_property_id,
            p_agent_id,
            p_user_id,
            NOW(),
            NOW(),
            CASE 
                WHEN p_initial_message IS NOT NULL AND p_message_type = 'TEXT' 
                THEN LEFT(p_initial_message, 200)
                WHEN p_message_type = 'IMAGE' THEN '📷 Image'
                WHEN p_message_type = 'VIDEO' THEN '🎥 Video'
                WHEN p_message_type = 'DOCUMENT' THEN '📄 Document'
                WHEN p_message_type = 'LOCATION' THEN '📍 Location'
                WHEN p_message_type = 'CONTACT' THEN '👤 Contact'
                ELSE 'New conversation'
            END
        );
        
        -- Set initial unread count for agent
        UPDATE conversations
        SET unread_count_for_agent = 1
        WHERE conversation_id = v_conversation_id;
    END IF;
    
    -- Add initial message if provided
    IF p_initial_message IS NOT NULL THEN
        v_message_id := uuid_generate_v4();
        
        INSERT INTO messages (
            message_id,
            conversation_id,
            sender_id,
            content,
            message_type,
            created_at,
            delivered_at
        ) VALUES (
            v_message_id,
            v_conversation_id,
            p_user_id,
            p_initial_message,
            p_message_type,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_agent_id UUID;
    v_tenant_id UUID;
    v_messages_read INTEGER;
BEGIN
    -- Get conversation participants
    SELECT agent_id, user_id INTO v_agent_id, v_tenant_id
    FROM conversations
    WHERE conversation_id = p_conversation_id;
    
    IF v_agent_id IS NULL THEN
        RAISE EXCEPTION 'Conversation not found';
    END IF;
    
    -- Update messages
    UPDATE messages
    SET read_at = NOW()
    WHERE conversation_id = p_conversation_id
      AND read_at IS NULL
      AND sender_id != p_user_id;
    
    GET DIAGNOSTICS v_messages_read = ROW_COUNT;
    
    -- Update conversation unread counts
    IF p_user_id = v_tenant_id THEN
        UPDATE conversations
        SET unread_count_for_tenant = 0
        WHERE conversation_id = p_conversation_id;
    ELSIF p_user_id = v_agent_id THEN
        UPDATE conversations
        SET unread_count_for_agent = 0
        WHERE conversation_id = p_conversation_id;
    END IF;
    
    RETURN v_messages_read;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all active users, update only their own profile
CREATE POLICY "Users can view active users" ON users
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id::text::uuid);

-- Properties: Everyone can view available properties, owners can manage their own
CREATE POLICY "Anyone can view available properties" ON properties
    FOR SELECT USING (is_available = true);

CREATE POLICY "Owners can manage their properties" ON properties
    FOR ALL USING (auth.uid() = owner_id::text::uuid);

-- Property Media: Linked to property permissions
CREATE POLICY "Anyone can view property media" ON property_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.property_id = property_media.property_id
            AND p.is_available = true
        )
    );

CREATE POLICY "Owners can manage property media" ON property_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.property_id = property_media.property_id
            AND p.owner_id = auth.uid()::text::uuid
        )
    );

-- Saved Properties: Users can manage their own saved properties
CREATE POLICY "Users can manage their saved properties" ON saved_properties
    FOR ALL USING (auth.uid() = user_id::text::uuid);

-- Notifications: Users can only see and manage their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id::text::uuid);

-- Conversations: Users can see conversations they're part of
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = user_id::text::uuid OR 
        auth.uid() = agent_id::text::uuid
    );

-- Messages: Users can see messages in their conversations
CREATE POLICY "Users can view conversation messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.conversation_id = messages.conversation_id
            AND (c.user_id = auth.uid()::text::uuid OR c.agent_id = auth.uid()::text::uuid)
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()::text::uuid AND
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.conversation_id = messages.conversation_id
            AND (c.user_id = auth.uid()::text::uuid OR c.agent_id = auth.uid()::text::uuid)
        )
    );

-- User Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

-- Payments: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (
    name, display_name, description, base_price, 
    max_properties, max_visits_per_month, max_media_per_property,
    max_amenities_per_property, sort_order
) VALUES
    ('FREE', 'Free Plan', 'Basic access for new users', 0, 2, 5, 5, 10, 1),
    ('BASIC', 'Basic Plan', 'Perfect for individual agents', 999, 10, 20, 15, 20, 2),
    ('PRO', 'Professional Plan', 'For growing businesses', 2999, 50, 100, 25, 30, 3),
    ('ENTERPRISE', 'Enterprise Plan', 'Unlimited everything', 9999, 999, 999, 50, 50, 4);

-- Update PRO and ENTERPRISE plans to allow premium features
UPDATE subscription_plans 
SET allow_boost = true, 
    max_boosts_per_month = 5,
    allow_premium_support = true
WHERE name IN ('PRO', 'ENTERPRISE');

UPDATE subscription_plans
SET allow_advanced_analytics = true,
    allow_bulk_operations = true
WHERE name = 'ENTERPRISE';

-- ============================================================================
-- HELPFUL QUERIES FOR SUPABASE
-- ============================================================================

-- Get user with active subscription
-- SELECT u.*, 
--        s.plan_id, 
--        sp.display_name as subscription_plan
-- FROM users u
-- LEFT JOIN user_subscriptions s ON u.user_id = s.user_id 
--     AND s.status IN ('TRIAL', 'ACTIVE') 
--     AND s.end_date > NOW()
-- LEFT JOIN subscription_plans sp ON s.plan_id = sp.plan_id
-- WHERE u.user_id = 'your-user-id';

-- Get property with media and amenities
-- SELECT p.*, 
--        json_agg(DISTINCT pm.*) as media,
--        json_agg(DISTINCT pa.*) as amenities
-- FROM properties p
-- LEFT JOIN property_media pm ON p.property_id = pm.property_id
-- LEFT JOIN property_amenities pa ON p.property_id = pa.property_id
-- WHERE p.property_id = 'your-property-id'
-- GROUP BY p.property_id;

COMMENT ON SCHEMA public IS 'Rent Me A Keja - Property Rental Platform Database';



CREATE TABLE security_features (
    security_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Physical Security
    has_security_guard BOOLEAN DEFAULT false,
    guard_hours VARCHAR(50), -- '24/7', 'Night Only', '6PM-6AM'
    has_cctv BOOLEAN DEFAULT false,
    has_perimeter_wall BOOLEAN DEFAULT false,
    has_gate BOOLEAN DEFAULT false,
    has_electric_fence BOOLEAN DEFAULT false,
    
    -- Access Control
    has_security_lights BOOLEAN DEFAULT false,
    requires_visitor_registration BOOLEAN DEFAULT false,
    has_intercom BOOLEAN DEFAULT false,
    
    -- Area Security
    police_station_distance_km DECIMAL(5,2),
    last_incident_date DATE,
    incident_description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE area_security_ratings (
    rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_name VARCHAR(150) NOT NULL, -- e.g., "Kilimani", "Kasarani"
    county VARCHAR(100) NOT NULL,
    
    -- Community ratings (1-5 scale)
    overall_safety_rating DECIMAL(3,2) CHECK (overall_safety_rating BETWEEN 0 AND 5),
    day_safety_rating DECIMAL(3,2) CHECK (day_safety_rating BETWEEN 0 AND 5),
    night_safety_rating DECIMAL(3,2) CHECK (night_safety_rating BETWEEN 0 AND 5),
    
    -- Crime statistics
    total_ratings INTEGER DEFAULT 0,
    last_incident_reported_at TIMESTAMPTZ,
    
    -- Police presence
    nearest_police_station VARCHAR(200),
    police_response_time_minutes INTEGER,
    has_community_policing BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(area_name, county)
);

CREATE INDEX idx_security_property ON security_features(property_id);
CREATE INDEX idx_area_security ON area_security_ratings(area_name, county);

-- ============================================================================
-- 2. LOCATION & ACCESSIBILITY (What tenants REALLY care about)
-- ============================================================================

CREATE TABLE transport_access (
    access_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Matatu/Public Transport
    nearest_matatu_stage VARCHAR(200), -- "NextGen Mall", "Ngong Road"
    matatu_routes TEXT, -- "46, 111, 125" (comma-separated route numbers)
    walking_minutes_to_stage INTEGER,
    
    -- Main Roads
    nearest_main_road VARCHAR(200), -- "Ngong Road", "Thika Road"
    distance_to_main_road_meters INTEGER,
    road_access_quality VARCHAR(20) CHECK (road_access_quality IN ('TARMAC', 'MURRAM', 'POOR', 'IMPASSABLE_RAINY')),
    
    -- Other Transport
    nearest_boda_stage VARCHAR(200), -- Boda boda (motorcycle taxi)
    boda_fare_to_main_road DECIMAL(8,2),
    uber_accessible BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE nearby_places (
    place_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    place_type VARCHAR(50) NOT NULL CHECK (place_type IN (
        'SUPERMARKET', 'HOSPITAL', 'SCHOOL', 'CHURCH', 'MOSQUE', 
        'SHOPPING_MALL', 'BANK', 'ATM', 'PETROL_STATION', 'RESTAURANT',
        'GYM', 'PHARMACY', 'POLICE_STATION', 'BUS_STATION', 'CBD'
    )),
    
    place_name VARCHAR(200) NOT NULL, -- "Naivas Supermarket", "Aga Khan Hospital"
    distance_km DECIMAL(5,2) NOT NULL,
    walking_minutes INTEGER,
    driving_minutes INTEGER,
    
    is_within_walking_distance BOOLEAN GENERATED ALWAYS AS (walking_minutes <= 15) STORED,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transport_property ON transport_access(property_id);
CREATE INDEX idx_nearby_places_property ON nearby_places(property_id);
CREATE INDEX idx_nearby_places_type ON nearby_places(place_type);

-- ============================================================================
-- 3. UTILITIES & INFRASTRUCTURE (Make or break for Kenyan tenants!)
-- ============================================================================

CREATE TABLE utility_info (
    utility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Water
    water_source VARCHAR(50) CHECK (water_source IN ('NAIROBI_WATER', 'BOREHOLE', 'BOTH', 'WATER_VENDOR')),
    water_availability VARCHAR(20) CHECK (water_availability IN ('24/7', 'SCHEDULED', 'IRREGULAR', 'TANKER_ONLY')),
    water_schedule VARCHAR(200), -- "Mon-Fri 6AM-10AM, 6PM-10PM"
    has_water_tank BOOLEAN DEFAULT false,
    tank_capacity_litres INTEGER,
    water_bill_included BOOLEAN DEFAULT false,
    avg_monthly_water_bill DECIMAL(10,2),
    
    -- Electricity
    electricity_provider VARCHAR(50) DEFAULT 'KPLC',
    has_prepaid_meter BOOLEAN DEFAULT true,
    has_postpaid_meter BOOLEAN DEFAULT false,
    frequent_power_outages BOOLEAN DEFAULT false,
    outage_frequency VARCHAR(50), -- "Daily", "2-3 times/week", "Rare"
    has_generator BOOLEAN DEFAULT false,
    has_solar_backup BOOLEAN DEFAULT false,
    electricity_bill_included BOOLEAN DEFAULT false,
    avg_monthly_electricity_bill DECIMAL(10,2),
    
    -- Internet
    fiber_available BOOLEAN DEFAULT false,
    fiber_providers TEXT, -- "Safaricom, Zuku, Faiba" (comma-separated)
    
    -- Garbage
    garbage_collection_available BOOLEAN DEFAULT false,
    garbage_collection_schedule VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_utility_property ON utility_info(property_id);

-- ============================================================================
-- 4. PROPERTY COSTS (Full transparency - no surprises!)
-- ============================================================================

CREATE TABLE property_costs (
    cost_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Main Costs
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_months INTEGER DEFAULT 1, -- Usually 1 month in Kenya
    deposit_amount DECIMAL(10,2) NOT NULL,
    
    -- Additional Costs (MUST be clear upfront!)
    service_charge DECIMAL(10,2) DEFAULT 0, -- For apartments with shared facilities
    garbage_fee DECIMAL(10,2) DEFAULT 0,
    security_fee DECIMAL(10,2) DEFAULT 0,
    
    -- Bills
    water_included BOOLEAN DEFAULT false,
    electricity_included BOOLEAN DEFAULT false,
    internet_included BOOLEAN DEFAULT false,
    
    -- Estimated Monthly Total
    estimated_total_monthly DECIMAL(10,2), -- Rent + service charge + typical utilities
    
    -- Agent/Landlord Fees
    agent_fee DECIMAL(10,2), -- Usually half month's rent
    agent_fee_description VARCHAR(200),
    
    -- Move-in Cost
    total_move_in_cost DECIMAL(10,2), -- Deposit + 1st month + agent fee
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. HOUSE RULES & RESTRICTIONS (Important in Kenyan context)
-- ============================================================================

CREATE TABLE house_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Occupancy
    max_occupants INTEGER,
    children_allowed BOOLEAN DEFAULT true,
    pets_allowed BOOLEAN DEFAULT false,
    pet_deposit DECIMAL(10,2),
    
    -- Visitors
    overnight_visitors_allowed BOOLEAN DEFAULT true,
    visitor_curfew_time TIME,
    
    -- Business/Work
    home_business_allowed BOOLEAN DEFAULT false,
    airbnb_allowed BOOLEAN DEFAULT false,
    
    -- Lifestyle
    smoking_allowed BOOLEAN DEFAULT false,
    loud_music_allowed BOOLEAN DEFAULT false,
    quiet_hours VARCHAR(50), -- "10PM - 6AM"
    
    -- Parking
    parking_available BOOLEAN DEFAULT false,
    parking_spaces INTEGER DEFAULT 0,
    parking_fee DECIMAL(10,2) DEFAULT 0,
    visitor_parking BOOLEAN DEFAULT false,
    
    -- Notice Period
    notice_period_days INTEGER DEFAULT 30, -- How many days notice to vacate
    
    other_rules TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. PROPERTY CONDITION & FEATURES (What you actually get!)
-- ============================================================================

CREATE TABLE property_condition (
    condition_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- General Condition
    overall_condition VARCHAR(20) CHECK (overall_condition IN ('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR')),
    year_built INTEGER,
    last_renovated INTEGER,
    
    -- Kitchen
    has_kitchen BOOLEAN DEFAULT true,
    kitchen_has_cabinets BOOLEAN DEFAULT false,
    kitchen_has_sink BOOLEAN DEFAULT true,
    kitchen_has_gas_connection BOOLEAN DEFAULT false,
    
    -- Bathroom
    number_of_bathrooms INTEGER DEFAULT 1,
    bathroom_has_shower BOOLEAN DEFAULT true,
    bathroom_has_bathtub BOOLEAN DEFAULT false,
    bathroom_has_hot_water BOOLEAN DEFAULT false,
    hot_water_type VARCHAR(30), -- 'INSTANT', 'BOILER', 'SOLAR', 'NONE'
    
    -- Floors & Walls
    floor_type VARCHAR(30), -- 'TILES', 'CEMENT', 'WOOD', 'CARPET'
    wall_finish VARCHAR(30), -- 'PAINTED', 'WALLPAPER', 'BARE'
    has_ceiling BOOLEAN DEFAULT true,
    
    -- Fixtures
    has_curtains_rails BOOLEAN DEFAULT false,
    has_light_fixtures BOOLEAN DEFAULT true,
    has_built_in_wardrobe BOOLEAN DEFAULT false,
    
    -- Outdoor
    has_balcony BOOLEAN DEFAULT false,
    has_backyard BOOLEAN DEFAULT false,
    has_compound BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. TENANT REVIEWS & RATINGS (Social proof!)
-- ============================================================================

-- Extend reviews table with Kenya-specific ratings
ALTER TABLE reviews
ADD COLUMN landlord_responsiveness INTEGER CHECK (landlord_responsiveness BETWEEN 1 AND 5),
ADD COLUMN water_reliability INTEGER CHECK (water_reliability BETWEEN 1 AND 5),
ADD COLUMN electricity_reliability INTEGER CHECK (electricity_reliability BETWEEN 1 AND 5),
ADD COLUMN security_rating INTEGER CHECK (security_rating BETWEEN 1 AND 5),
ADD COLUMN noise_level INTEGER CHECK (noise_level BETWEEN 1 AND 5),
ADD COLUMN cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
ADD COLUMN would_recommend BOOLEAN,
ADD COLUMN lived_duration_months INTEGER;

-- ============================================================================
-- 8. SEARCH & DISCOVERY OPTIMIZATION
-- ============================================================================

-- Materialized view for fast property search
CREATE MATERIALIZED VIEW property_search_index AS
SELECT 
    p.property_id,
    p.title,
    p.county,
    p.constituency,
    p.area,
    p.property_type,
    p.bedrooms,
    p.bathrooms,
    p.is_available,
    p.latitude,
    p.longitude,
    
    -- Costs
    pc.monthly_rent,
    pc.total_move_in_cost,
    
    -- Security
    COALESCE(asr.overall_safety_rating, 0) as area_safety_rating,
    COALESCE(sf.has_security_guard, false) as has_security_guard,
    
    -- Utilities
    ui.water_availability,
    ui.fiber_available,
    
    -- Access
    ta.nearest_matatu_stage,
    ta.walking_minutes_to_stage,
    
    -- Photos
    (SELECT media_url FROM property_media WHERE property_id = p.property_id AND is_primary = true LIMIT 1) as main_photo,
    (SELECT COUNT(*) FROM property_media WHERE property_id = p.property_id) as photo_count,
    
    -- Average rating
    (SELECT AVG(rating) FROM reviews WHERE property_id = p.property_id) as avg_rating,
    (SELECT COUNT(*) FROM reviews WHERE property_id = p.property_id) as review_count,
    
    p.created_at
FROM properties p
LEFT JOIN property_costs pc ON p.property_id = pc.property_id
LEFT JOIN security_features sf ON p.property_id = sf.property_id
LEFT JOIN utility_info ui ON p.property_id = ui.property_id
LEFT JOIN transport_access ta ON p.property_id = ta.property_id
LEFT JOIN area_security_ratings asr ON p.area = asr.area_name AND p.county = asr.county
WHERE p.is_available = true;

CREATE INDEX idx_search_location ON property_search_index(county, area);
CREATE INDEX idx_search_price ON property_search_index(monthly_rent);
CREATE INDEX idx_search_bedrooms ON property_search_index(bedrooms);
CREATE INDEX idx_search_safety ON property_search_index(area_safety_rating);

-- Function to refresh search index
CREATE OR REPLACE FUNCTION refresh_property_search_index()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW property_search_index;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. DISTANCE CALCULATION (How far from work/school/etc)
-- ============================================================================

CREATE TABLE user_important_places (
    place_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    place_name VARCHAR(200) NOT NULL, -- "My Office", "Kids School"
    place_type VARCHAR(50) CHECK (place_type IN ('WORK', 'SCHOOL', 'FAMILY', 'WORSHIP', 'OTHER')),
    
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    address VARCHAR(500),
    
    is_primary BOOLEAN DEFAULT false, -- Primary place (usually work)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_places ON user_important_places(user_id);

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    R CONSTANT DECIMAL := 6371; -- Earth's radius in km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    
    a := sin(dLat/2) * sin(dLat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dLon/2) * sin(dLon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 10. PROPERTY VERIFICATION (Build trust!)
-- ============================================================================

CREATE TABLE property_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    
    -- Document Verification
    has_title_deed BOOLEAN DEFAULT false,
    has_landlord_id BOOLEAN DEFAULT false,
    has_recent_photos BOOLEAN DEFAULT false,
    photos_date DATE,
    
    -- Physical Verification
    physically_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(user_id), -- Admin/staff who verified
    verification_date DATE,
    verification_notes TEXT,
    
    -- Quick checks
    photos_match_description BOOLEAN,
    rent_price_reasonable BOOLEAN,
    landlord_contactable BOOLEAN,
    
    verification_status VARCHAR(20) CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPICIOUS')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- HELPER VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete property info view
CREATE VIEW vw_property_complete AS
SELECT 
    p.property_id,
    p.title,
    p.description,
    p.area,
    p.owner_id,
    p.created_at,
    
    u.full_name AS landlord_name,
    u.phone_number AS landlord_phone,
    u.trust_score AS landlord_trust_score,
    
    -- Costs
    pc.monthly_rent,
    pc.deposit_amount,
    pc.total_move_in_cost,
    pc.estimated_total_monthly,
    
    -- Security
    sf.has_security_guard,
    sf.has_cctv,
    asr.overall_safety_rating AS area_safety,
    
    -- Utilities
    ui.water_availability,
    ui.electricity_provider,
    ui.fiber_available,
    
    -- Transport
    ta.nearest_matatu_stage,
    ta.matatu_routes,
    ta.walking_minutes_to_stage,
    
    -- Ratings
    (SELECT AVG(r.rating) FROM reviews r WHERE r.property_id = p.property_id) AS avg_rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.property_id = p.property_id) AS total_reviews

FROM properties p
LEFT JOIN users u ON p.owner_id = u.user_id
LEFT JOIN property_costs pc ON p.property_id = pc.property_id
LEFT JOIN security_features sf ON p.property_id = sf.property_id
LEFT JOIN utility_info ui ON p.property_id = ui.property_id
LEFT JOIN transport_access ta ON p.property_id = ta.property_id
LEFT JOIN area_security_ratings asr ON p.area = asr.area_name;

COMMENT ON DATABASE postgres IS 'Rent Me A Keja - Helping Kenyans find 












-- ============================================================================
-- ADD "SAMILAS" HOUSE PROPERTY
-- ============================================================================

-- First, let's assume we have a user/agent who will own this property
-- If you don't have a user yet, create one first (or use existing user ID)

-- Step 1: Insert the main property record
INSERT INTO "properties" (
    "property_id", 
    "owner_id",
    "title", 
    "description", 
    "rent_amount", 
    "deposit_amount",
    "county", 
    "constituency", 
    "area", 
    "street_address",
    "latitude", 
    "longitude",
    "property_type", 
    "bedrooms", 
    "bathrooms",
    "rules",
    "is_available", 
    "is_verified",
    "created_at", 
    "updated_at"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, -- You can generate a new UUID or use this one
    (SELECT "UserId" FROM "Users" WHERE "Username" = 'agent123' LIMIT 1), -- Replace with actual agent username or ID
    'Samilas Luxury Villa',
    'A stunning 4-bedroom luxury villa located in a secure, serene neighborhood. Features modern finishes, spacious living areas, and a beautiful garden. Perfect for a family looking for comfort and style. The property comes with 24/7 security, ample parking, and reliable utilities.',
    85000.00, -- Monthly rent in KES
    85000.00, -- Deposit (1 month rent)
    'Nairobi',
    'Westlands',
    'Lavington',
    'Lavington Green, Off James Gichuru Road',
    -1.270860, -- Latitude for Lavington, Nairobi
    36.777820, -- Longitude for Lavington, Nairobi
    'HOUSE',
    4, -- Bedrooms
    3, -- Bathrooms
    'No smoking inside the house. Pets allowed with prior approval. Maximum 6 occupants. Quiet hours from 10 PM to 6 AM.',
    true, -- is_available
    true, -- is_verified
    NOW(),
    NOW()
)
ON CONFLICT ("property_id") DO NOTHING;

-- Step 2: Add property costs (transparent pricing)
INSERT INTO "property_costs" (
    "property_id",
    "monthly_rent",
    "deposit_months",
    "deposit_amount",
    "service_charge",
    "garbage_fee",
    "security_fee",
    "water_included",
    "electricity_included",
    "internet_included",
    "estimated_total_monthly",
    "agent_fee",
    "agent_fee_description",
    "total_move_in_cost"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    85000.00,
    1,
    85000.00,
    5000.00, -- Service charge
    1000.00, -- Garbage fee
    2000.00, -- Security fee
    true, -- Water included
    false, -- Electricity not included
    false, -- Internet not included
    93000.00, -- Rent + service charge + garbage + security
    42500.00, -- Agent fee (half month rent)
    'Standard agent commission - 50% of one month''s rent',
    222500.00 -- Deposit + 1st month + agent fee
);

-- Step 3: Add property amenities
INSERT INTO "property_amenities" ("property_id", "amenity_name", "created_at") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Swimming Pool', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Garden', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Parking (4 cars)', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Security System', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Gym', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Balcony', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Fireplace', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Laundry Room', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Storage', NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Tiled Floors', NOW());

-- Step 4: Add property media (using real image URLs from the internet)
INSERT INTO "property_media" ("property_id", "media_type", "media_url", "thumbnail_url", "is_primary", "created_at") VALUES
-- Primary image
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'IMAGE', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', true, NOW()),
-- Additional images
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'IMAGE', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', false, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'IMAGE', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', false, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'IMAGE', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', false, NOW()),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'IMAGE', 'https://images.unsplash.com/photo-1600573472550-8090d91c5c01?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', 'https://images.unsplash.com/photo-1600573472550-8090d91c5c01?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', false, NOW());

-- Step 5: Add security features
INSERT INTO "security_features" (
    "property_id",
    "has_security_guard",
    "guard_hours",
    "has_cctv",
    "has_perimeter_wall",
    "has_gate",
    "has_electric_fence",
    "has_security_lights",
    "requires_visitor_registration",
    "has_intercom",
    "police_station_distance_km"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    true,
    '24/7',
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    2.5
);

-- Step 6: Add transport access information
INSERT INTO "transport_access" (
    "property_id",
    "nearest_matatu_stage",
    "matatu_routes",
    "walking_minutes_to_stage",
    "nearest_main_road",
    "distance_to_main_road_meters",
    "road_access_quality",
    "nearest_boda_stage",
    "boda_fare_to_main_road",
    "uber_accessible"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    'Lavington Stage',
    '46, 111, 125, 126',
    8,
    'James Gichuru Road',
    500,
    'TARMAC',
    'Gate B',
    50.00,
    true
);

-- Step 7: Add nearby places
INSERT INTO "nearby_places" ("property_id", "place_type", "place_name", "distance_km", "walking_minutes", "driving_minutes") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'SUPERMARKET', 'Naivas Lavington', 0.8, 10, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'HOSPITAL', 'Aga Khan Hospital', 3.2, NULL, 8),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'SCHOOL', 'St. Mary''s School', 1.5, 20, 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'SHOPPING_MALL', 'Yaya Centre', 2.0, NULL, 6),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'BANK', 'Equity Bank Lavington', 0.7, 9, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'RESTAURANT', 'Artcaffe Lavington', 0.5, 6, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'GYM', 'Fitness First Lavington', 1.2, 15, 4);

-- Step 8: Add utility information
INSERT INTO "utility_info" (
    "property_id",
    "water_source",
    "water_availability",
    "water_schedule",
    "has_water_tank",
    "tank_capacity_litres",
    "water_bill_included",
    "electricity_provider",
    "has_prepaid_meter",
    "has_postpaid_meter",
    "frequent_power_outages",
    "outage_frequency",
    "has_generator",
    "has_solar_backup",
    "electricity_bill_included",
    "fiber_available",
    "fiber_providers",
    "garbage_collection_available",
    "garbage_collection_schedule"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    'BOTH', -- NAIROBI_WATER and BOREHOLE
    '24/7',
    'Continuous supply with backup',
    true,
    10000,
    true, -- Water bill included in rent
    'KPLC',
    true,
    false,
    false,
    'Rare',
    true,
    false,
    false, -- Electricity bill not included
    true,
    'Safaricom, Zuku, Faiba',
    true,
    'Monday, Wednesday, Friday - 7 AM'
);

-- Step 9: Add house rules
INSERT INTO "house_rules" (
    "property_id",
    "max_occupants",
    "children_allowed",
    "pets_allowed",
    "overnight_visitors_allowed",
    "visitor_curfew_time",
    "home_business_allowed",
    "airbnb_allowed",
    "smoking_allowed",
    "loud_music_allowed",
    "quiet_hours",
    "parking_available",
    "parking_spaces",
    "parking_fee",
    "visitor_parking",
    "notice_period_days",
    "other_rules"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    6,
    true,
    true,
    true,
    '22:00:00',
    false,
    false,
    false,
    false,
    '10PM - 6AM',
    true,
    4,
    0.00,
    true,
    30,
    'No parties without prior approval. Maintain cleanliness of common areas. Report any maintenance issues immediately.'
);

-- Step 10: Add property condition details
INSERT INTO "property_condition" (
    "property_id",
    "overall_condition",
    "year_built",
    "last_renovated",
    "has_kitchen",
    "kitchen_has_cabinets",
    "kitchen_has_sink",
    "kitchen_has_gas_connection",
    "number_of_bathrooms",
    "bathroom_has_shower",
    "bathroom_has_bathtub",
    "bathroom_has_hot_water",
    "hot_water_type",
    "floor_type",
    "wall_finish",
    "has_ceiling",
    "has_curtains_rails",
    "has_light_fixtures",
    "has_built_in_wardrobe",
    "has_balcony",
    "has_backyard",
    "has_compound"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    'EXCELLENT',
    2020,
    2023,
    true,
    true,
    true,
    true,
    3,
    true,
    true,
    true,
    'INSTANT',
    'TILES',
    'PAINTED',
    true,
    true,
    true,
    true,
    true,
    true,
    true
);

-- Step 11: Add property verification
INSERT INTO "property_verifications" (
    "property_id",
    "has_title_deed",
    "has_landlord_id",
    "has_recent_photos",
    "photos_date",
    "physically_verified",
    "verified_by",
    "verification_date",
    "verification_notes",
    "photos_match_description",
    "rent_price_reasonable",
    "landlord_contactable",
    "verification_status"
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    true,
    true,
    true,
    '2024-01-15',
    true,
    (SELECT "UserId" FROM "Users" WHERE "Role" = 'ADMIN' LIMIT 1),
    '2024-01-20',
    'Property physically verified. All documents in order. Photos match actual property.',
    true,
    true,
    true,
    'VERIFIED'
);

-- Step 12: Add area security rating for Lavington
INSERT INTO "area_security_ratings" (
    "area_name",
    "county",
    "overall_safety_rating",
    "day_safety_rating",
    "night_safety_rating",
    "total_ratings",
    "nearest_police_station",
    "police_response_time_minutes",
    "has_community_policing"
) VALUES (
    'Lavington',
    'Nairobi',
    4.2,
    4.5,
    3.8,
    47,
    'Kilimani Police Station',
    10,
    true
)
ON CONFLICT ("area_name", "county") 
DO UPDATE SET 
    "overall_safety_rating" = 4.2,
    "day_safety_rating" = 4.5,
    "night_safety_rating" = 3.8,
    "updated_at" = NOW();

-- Step 13: Refresh the materialized search view
SELECT refresh_property_search_index();

-- ============================================================================
-- VERIFICATION QUERY - Check if property was added successfully
-- ============================================================================

-- Query to verify the property was added
SELECT 
    p."property_id",
    p."title",
    p."area",
    p."county",
    p."rent_amount",
    p."bedrooms",
    p."bathrooms",
    (SELECT COUNT(*) FROM "property_media" pm WHERE pm."property_id" = p."property_id") as photo_count,
    (SELECT COUNT(*) FROM "property_amenities" pa WHERE pa."property_id" = p."property_id") as amenities_count,
    p."is_verified",
    p."created_at"
FROM "properties" p
WHERE p."title" LIKE '%Samilas%'
LIMIT 1;

-- Query to see complete property information
SELECT 
    p."title",
    p."description",
    p."rent_amount",
    p."bedrooms",
    p."bathrooms",
    pc."estimated_total_monthly",
    pc."total_move_in_cost",
    sf."has_security_guard",
    sf."has_cctv",
    ui."water_availability",
    ui."fiber_available",
    ta."nearest_matatu_stage",
    ta."walking_minutes_to_stage",
    asr."overall_safety_rating"
FROM "properties" p
LEFT JOIN "property_costs" pc ON p."property_id" = pc."property_id"
LEFT JOIN "security_features" sf ON p."property_id" = sf."property_id"
LEFT JOIN "utility_info" ui ON p."property_id" = ui."property_id"
LEFT JOIN "transport_access" ta ON p."property_id" = ta."property_id"
LEFT JOIN "area_security_ratings" asr ON p."area" = asr."area_name" AND p."county" = asr."county"
WHERE p."title" LIKE '%Samilas%';

-- ============================================================================
-- SIMPLIFIED INSERT SCRIPT (if you want a quick insert without all details)
-- ============================================================================

/*
-- Quick insert with minimal details
INSERT INTO "properties" (
    "property_id", 
    "owner_id",
    "title", 
    "description", 
    "rent_amount", 
    "county", 
    "area", 
    "property_type", 
    "bedrooms", 
    "bathrooms",
    "is_available", 
    "is_verified"
) VALUES (
    uuid_generate_v4(), -- Auto-generate UUID
    (SELECT "UserId" FROM "Users" LIMIT 1), -- Use first user as owner
    'Samilas Luxury Villa',
    'Beautiful 4-bedroom house in Lavington with modern amenities and security.',
    85000.00,
    'Nairobi',
    'Lavington',
    'HOUSE',
    4,
    3,
    true,
    true
);

-- Add at least one image
INSERT INTO "property_media" ("property_id", "media_type", "media_url", "is_primary") VALUES
(
    (SELECT "property_id" FROM "properties" WHERE "title" LIKE '%Samilas%' LIMIT 1),
    'IMAGE',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    true
);
*/

-- ============================================================================
-- HELPFUL NOTES
-- ============================================================================

/*
1. Before running this script:
   - Make sure you have at least one user in the "Users" table
   - Update the owner_id to match an actual user ID
   - You can generate a new UUID or use the provided one

2. Image URLs used:
   - All images are from Unsplash (free, high-quality stock photos)
   - Links are to actual house/villa images
   - You can replace these with your own images if needed

3. Property details:
   - Name: Samilas Luxury Villa
   - Location: Lavington, Nairobi
   - Type: House
   - Bedrooms: 4
   - Bathrooms: 3
   - Rent: KES 85,000/month
   - Features: Pool, Garden, Security, Gym, etc.

4. To modify:
   - Change any values as needed
   - Add/remove amenities
   - Update location details
   - Adjust pricing
*/

COMMENT ON TABLE "properties" IS 'Includes Samilas Luxury Villa property for demonstration';