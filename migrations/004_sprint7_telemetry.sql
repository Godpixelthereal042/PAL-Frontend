-- PAL Sprint 7 — Milestone 4.5: Observability & AI Evaluation Telemetry Migration
-- File: migrations/004_sprint7_telemetry.sql

CREATE TABLE IF NOT EXISTS llm_reasoning_traces (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    prompt_name TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    estimated_cost_usd REAL DEFAULT 0.0,
    latency_ms INTEGER DEFAULT 0,
    success INTEGER DEFAULT 1,
    retry_count INTEGER DEFAULT 0,
    schema_valid INTEGER DEFAULT 1,
    error_message TEXT,
    created_at BIGINT NOT NULL
);

ALTER TABLE llm_reasoning_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY llm_reasoning_traces_isolation ON llm_reasoning_traces
    USING (workspace_id = current_setting('app.current_workspace_id', true));
