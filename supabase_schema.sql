-- =============================================
-- ServiceSnap — Supabase Database Schema
-- =============================================
-- Run this SQL in the Supabase SQL Editor
-- (https://supabase.com → your project → SQL Editor → New query)
--
-- This creates 4 tables: profiles, sites, services, issues
-- and enables Row Level Security so users can only see their own data.
-- =============================================

-- 1. PROFILES TABLE
-- Stores user info linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'Site Manager',
    email       TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SITES TABLE
-- Stores building/site information
CREATE TABLE IF NOT EXISTS sites (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    address     TEXT NOT NULL,
    contact     TEXT NOT NULL,
    phone       TEXT NOT NULL,
    notes       TEXT,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Composite unique constraint: enables the services table to enforce
    -- that a service can only reference a site owned by the same user.
    UNIQUE (id, user_id)
);

-- 3. SERVICES TABLE
-- Stores scheduled service visits
CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    provider    TEXT NOT NULL,
    site_id     INTEGER NOT NULL,
    date        DATE NOT NULL,
    time        TIME NOT NULL,
    status      TEXT NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'completed', 'reported')),
    notes       TEXT,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Composite FK: ensures site_id references a site owned by the same user.
    -- The (site_id, user_id) pair must match an existing (id, user_id) in sites.
    FOREIGN KEY (site_id, user_id) REFERENCES sites(id, user_id) ON DELETE CASCADE,
    -- Composite unique constraint: enables the issues table to enforce
    -- that an issue can only reference a service owned by the same user.
    UNIQUE (id, user_id)
);

-- 4. ISSUES TABLE
-- Stores issue reports linked to services
CREATE TABLE IF NOT EXISTS issues (
    id           SERIAL PRIMARY KEY,
    service_id   INTEGER NOT NULL,
    issue_type   TEXT NOT NULL,
    description  TEXT NOT NULL,
    photo_url    TEXT,
    reported_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Composite FK: ensures service_id references a service owned by the same user.
    -- The (service_id, user_id) pair must match an existing (id, user_id) in services.
    FOREIGN KEY (service_id, user_id) REFERENCES services(id, user_id) ON DELETE CASCADE
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Ensures each user can only read/write their own data.
-- This is critical for security!

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- =============================================
-- INDEXES
-- =============================================
-- Speed up RLS queries that filter by user_id on every request.

CREATE INDEX IF NOT EXISTS idx_sites_user_id     ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id  ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_site_id  ON services(site_id);
CREATE INDEX IF NOT EXISTS idx_issues_user_id    ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_service_id ON issues(service_id);

-- PROFILES: users can read and update their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- SITES: users can CRUD their own sites
CREATE POLICY "Users can view own sites"
    ON sites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
    ON sites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
    ON sites FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
    ON sites FOR DELETE
    USING (auth.uid() = user_id);

-- SERVICES: users can CRUD their own services
CREATE POLICY "Users can view own services"
    ON services FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services"
    ON services FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services"
    ON services FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services"
    ON services FOR DELETE
    USING (auth.uid() = user_id);

-- ISSUES: users can CRUD their own issues
CREATE POLICY "Users can view own issues"
    ON issues FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issues"
    ON issues FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues"
    ON issues FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own issues"
    ON issues FOR DELETE
    USING (auth.uid() = user_id);


-- =============================================
-- SEED DATA (Optional — for demo/testing)
-- =============================================
-- Run this AFTER creating a test user in Supabase Auth.
-- Replace 'YOUR-USER-UUID-HERE' with the actual UUID from auth.users.
--
-- INSERT INTO profiles (id, name, role, email) VALUES
--   ('YOUR-USER-UUID-HERE', 'Sam Taylor', 'Site Manager', 'demo@servicesnap.nz');
--
-- INSERT INTO sites (name, address, contact, phone, notes, user_id) VALUES
--   ('Melbourne Office Tower', '120 Collins Street, Melbourne CBD 3000', 'Jane Mitchell', '03-9555-0101', 'Main client site. 3 floors.', 'YOUR-USER-UUID-HERE'),
--   ('Docklands Business Hub', '88 Harbour Esplanade, Docklands 3008', 'Marcus Chen', '03-9555-0242', 'Large commercial building.', 'YOUR-USER-UUID-HERE'),
--   ('Southbank Corporate Centre', '55 City Road, Southbank 3006', 'Priya Sharma', '03-9555-0333', 'After-hours access required.', 'YOUR-USER-UUID-HERE');