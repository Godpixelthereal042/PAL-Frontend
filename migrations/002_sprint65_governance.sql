-- PAL Migration 002: Sprint 6.5 Executive Governance State Persistence
-- Governing Specs: PAL-TDD-005A, PAL-ARCH-DOC-039

-- 1. Executive Intents
CREATE TABLE IF NOT EXISTS executive_intents (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    title TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'high',
    success_metrics JSONB DEFAULT '[]',
    deadline BIGINT,
    owner TEXT NOT NULL DEFAULT 'CEO',
    confidence NUMERIC(4,2) NOT NULL DEFAULT 0.90,
    strategy_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at BIGINT NOT NULL
);

-- 2. Executive Policies
CREATE TABLE IF NOT EXISTS executive_policies (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    severity TEXT NOT NULL DEFAULT 'mandatory',
    owner TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    applies_to JSONB DEFAULT '[]',
    conditions JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    justification TEXT,
    source TEXT,
    enabled BOOLEAN NOT NULL DEFAULT true,
    expires_at BIGINT,
    created_at BIGINT NOT NULL
);

-- 3. OKR Items
CREATE TABLE IF NOT EXISTS okr_items (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    objective TEXT NOT NULL,
    key_results JSONB DEFAULT '[]',
    initiatives JSONB DEFAULT '[]',
    origin_intent_id TEXT,
    origin_policy_ids JSONB DEFAULT '[]',
    origin_constraint_ids JSONB DEFAULT '[]',
    strategy_version TEXT NOT NULL,
    alignment_score INTEGER DEFAULT 0,
    created_at BIGINT NOT NULL
);

-- 4. Proposals
CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    title TEXT NOT NULL,
    objective TEXT,
    expected_benefit_usd NUMERIC(12,2) DEFAULT 0,
    estimated_cost_usd NUMERIC(12,2) DEFAULT 0,
    estimated_risk INTEGER DEFAULT 0,
    reversibility_score NUMERIC(4,2) DEFAULT 0.50,
    supporting_evidence JSONB DEFAULT '[]',
    affected_departments JSONB DEFAULT '[]',
    strategy_alignment INTEGER DEFAULT 0,
    confidence NUMERIC(4,2) DEFAULT 0.50,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at BIGINT NOT NULL
);

-- 5. Council Votes (Append-Only)
CREATE TABLE IF NOT EXISTS council_votes (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    proposal_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    department TEXT NOT NULL,
    vote TEXT NOT NULL,
    confidence NUMERIC(4,2) NOT NULL,
    vote_weight NUMERIC(4,2) NOT NULL,
    rationale TEXT,
    round_index INTEGER NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL
);

-- 6. Decision Ledger (Append-Only, Immutable)
CREATE TABLE IF NOT EXISTS decision_ledger (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    decision_id TEXT NOT NULL,
    entry_type TEXT NOT NULL DEFAULT 'prediction',
    proposal_id TEXT,
    strategy_version TEXT NOT NULL,
    policy_version TEXT NOT NULL,
    constraint_version TEXT NOT NULL,
    memory_snapshot_version TEXT,
    simulation_id TEXT,
    council_votes JSONB DEFAULT '[]',
    predicted_outcome JSONB NOT NULL DEFAULT '{}',
    observed_outcome JSONB,
    outcome_delta JSONB,
    content_hash TEXT NOT NULL,
    recorded_at BIGINT NOT NULL
);

-- 7. Scheduled Tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    task_name TEXT NOT NULL,
    department TEXT NOT NULL,
    priority_class TEXT NOT NULL DEFAULT 'routine',
    expected_benefit_usd NUMERIC(12,2) DEFAULT 0,
    token_cost_usd NUMERIC(12,2) DEFAULT 0,
    compute_cost_usd NUMERIC(12,2) DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    confidence NUMERIC(4,2) DEFAULT 0.50,
    reversibility_score NUMERIC(4,2) DEFAULT 0.50,
    economic_priority_rating NUMERIC(10,4),
    prerequisites JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'queued',
    created_at BIGINT NOT NULL,
    dequeued_at BIGINT
);

-- 8. Department Budgets
CREATE TABLE IF NOT EXISTS department_budgets (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    department TEXT NOT NULL,
    capital_usd NUMERIC(12,2) NOT NULL DEFAULT 50000,
    ai_tokens_quota BIGINT NOT NULL DEFAULT 10000000,
    human_hours_quota NUMERIC(8,2) NOT NULL DEFAULT 100,
    compute_nodes_quota INTEGER NOT NULL DEFAULT 10,
    api_rate_limit_quota INTEGER NOT NULL DEFAULT 5000,
    used_capital_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    used_ai_tokens BIGINT NOT NULL DEFAULT 0,
    used_human_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    used_compute_nodes INTEGER NOT NULL DEFAULT 0,
    used_api_requests INTEGER NOT NULL DEFAULT 0,
    period_start BIGINT NOT NULL,
    period_end BIGINT
);

-- 9. KPI Metrics
CREATE TABLE IF NOT EXISTS kpi_metrics (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    metric_key TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value NUMERIC(16,4) NOT NULL,
    unit TEXT NOT NULL,
    target_value NUMERIC(16,4),
    source TEXT DEFAULT 'manual',
    updated_at BIGINT NOT NULL
);

-- 10. Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    proposal_id TEXT,
    action_name TEXT NOT NULL,
    department TEXT NOT NULL,
    required_role TEXT NOT NULL,
    escalation_role TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    justification TEXT,
    requested_at BIGINT NOT NULL,
    decided_at BIGINT,
    decided_by TEXT,
    timeout_at BIGINT
);

-- 11. Simulation Results
CREATE TABLE IF NOT EXISTS simulation_results (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL DEFAULT 'default_workspace',
    proposal_id TEXT,
    strategy_version TEXT NOT NULL,
    mode TEXT NOT NULL,
    risk_breakdown JSONB NOT NULL DEFAULT '{}',
    assumptions JSONB DEFAULT '[]',
    forecasts JSONB DEFAULT '[]',
    recommendation TEXT NOT NULL,
    confidence_score NUMERIC(4,2) NOT NULL,
    simulated_at BIGINT NOT NULL
);
