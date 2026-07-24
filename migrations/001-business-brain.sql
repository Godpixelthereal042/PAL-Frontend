-- Migration 001: Business Brain
-- PAL Milestone 1A — Business Brain Database
-- Created: 2026-07-22
--
-- This migration adds the Business Brain tables, which store structured
-- memory about a founder's business: name, description, goals, offers,
-- customer segments, challenges, priorities, and important notes.
--
-- Reference: PAL-DOC-003 (AI Architecture) §03, PAL-DOC-002 (MVP) §03

-- Core Business Brain (one per user)
CREATE TABLE IF NOT EXISTS business_brain (
    id                    TEXT PRIMARY KEY,
    user_id               TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name         TEXT,
    business_description  TEXT,
    industry              TEXT,
    business_stage        TEXT,
    target_market         TEXT,
    priorities            TEXT,
    created_at            BIGINT NOT NULL,
    updated_at            BIGINT NOT NULL
);

-- Business Goals (many per brain)
CREATE TABLE IF NOT EXISTS business_goals (
    id          TEXT PRIMARY KEY,
    brain_id    TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    timeframe   TEXT,
    status      TEXT DEFAULT 'active',
    created_at  BIGINT NOT NULL
);

-- Business Offers / Products / Services (many per brain)
CREATE TABLE IF NOT EXISTS business_offers (
    id          TEXT PRIMARY KEY,
    brain_id    TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    offer_type  TEXT,
    price       TEXT,
    status      TEXT DEFAULT 'active',
    created_at  BIGINT NOT NULL
);

-- Customer Segments (many per brain)
CREATE TABLE IF NOT EXISTS business_customer_segments (
    id          TEXT PRIMARY KEY,
    brain_id    TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  BIGINT NOT NULL
);

-- Business Challenges (many per brain)
CREATE TABLE IF NOT EXISTS business_challenges (
    id          TEXT PRIMARY KEY,
    brain_id    TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    severity    TEXT DEFAULT 'medium',
    status      TEXT DEFAULT 'active',
    created_at  BIGINT NOT NULL
);

-- Important Business Notes (many per brain)
CREATE TABLE IF NOT EXISTS business_notes (
    id          TEXT PRIMARY KEY,
    brain_id    TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    category    TEXT,
    created_at  BIGINT NOT NULL
);
