-- SQL DDL Script for Supabase PostgreSQL Table Initialization

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    email TEXT NOT NULL,
    "companyName" TEXT,
    "targetAudience" TEXT,
    "primaryKPI" TEXT,
    "selectedPersona" TEXT
);

CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    color TEXT NOT NULL,
    goal TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'Planning',
    due_date TEXT,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Member',
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    client TEXT NOT NULL,
    amount TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    "isSynced" INTEGER NOT NULL DEFAULT 0,
    "isAutoSync" INTEGER NOT NULL DEFAULT 0,
    "syncedMessages" INTEGER NOT NULL DEFAULT 0,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at BIGINT
);

CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'decided',
    created_at BIGINT NOT NULL
);


CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    image TEXT,
    attachments TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    "isUnread" INTEGER NOT NULL DEFAULT 1,
    section TEXT NOT NULL,
    "iconType" TEXT NOT NULL,
    "actionLabel" TEXT,
    "actionRoute" TEXT
);

CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    category TEXT NOT NULL,
    "isCompleted" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS briefs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    status TEXT,
    synced_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'not_started',
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    due_date TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'decided',
    created_at BIGINT NOT NULL
);

-- Business Brain Tables (Milestone 1A)

CREATE TABLE IF NOT EXISTS business_brain (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    business_description TEXT,
    industry TEXT,
    business_stage TEXT,
    target_market TEXT,
    priorities TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_goals (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    timeframe TEXT,
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_offers (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    offer_type TEXT,
    price TEXT,
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_customer_segments (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_challenges (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_notes (
    id TEXT PRIMARY KEY,
    brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT,
    created_at BIGINT NOT NULL
);

