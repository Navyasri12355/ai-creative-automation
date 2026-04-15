-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'content-creator'
                CHECK (role IN ('brand-admin', 'marketing-manager', 'content-creator')),
    password_hash TEXT NOT NULL,
    brand_id    UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Brands ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                 TEXT NOT NULL,
    industry             TEXT NOT NULL,
    target_regions       TEXT[]    DEFAULT '{}',
    design_style         TEXT      DEFAULT 'modern'
                         CHECK (design_style IN ('modern', 'traditional', 'minimal', 'vibrant')),
    cultural_sensitivity TEXT      DEFAULT 'medium',
    language_preferences TEXT[]    DEFAULT ARRAY['en', 'hi'],
    guidelines           TEXT,
    colors               JSONB     DEFAULT '[]',
    logo_url             TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK: users → brands (circular — add after both tables exist)
ALTER TABLE users
    ADD CONSTRAINT fk_users_brand FOREIGN KEY (brand_id)
    REFERENCES brands(id) ON DELETE SET NULL
    NOT VALID;  -- deferred validation; safe for circular FK

-- ── Creatives ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS creatives (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id       UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    created_by     UUID NOT NULL REFERENCES users(id),
    festival_id    TEXT,
    occasion_type  TEXT NOT NULL DEFAULT 'general',
    platforms      TEXT[]   DEFAULT '{}',
    texts          JSONB    DEFAULT '{}',
    images         JSONB    DEFAULT '[]',
    ai_prompt_used TEXT,
    status         TEXT     DEFAULT 'draft'
                   CHECK (status IN ('draft', 'approved', 'published')),
    generated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    views          INTEGER  DEFAULT 0,
    downloads      INTEGER  DEFAULT 0
);

-- ── Notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT,
    festival_id TEXT,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_brands_owner      ON brands(owner_id);
CREATE INDEX IF NOT EXISTS idx_creatives_brand   ON creatives(brand_id);
CREATE INDEX IF NOT EXISTS idx_creatives_status  ON creatives(status);
CREATE INDEX IF NOT EXISTS idx_creatives_date    ON creatives(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ── Row Level Security ────────────────────────────────────────────────────
-- (Using service key in backend bypasses RLS; enable for extra safety)
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands         ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- ── Storage buckets (run via Supabase dashboard or CLI) ───────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('creatives',    'creatives',    true);