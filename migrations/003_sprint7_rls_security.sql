-- PAL Sprint 7 — Milestone 3: Multi-Tenant Row Level Security (RLS) Migration
-- File: migrations/003_sprint7_rls_security.sql

-- 1. Enable Row Level Security (RLS) on all 11 Governance Tables
ALTER TABLE executive_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

-- 2. Enable Row Level Security (RLS) on Execution & Audit Tables
ALTER TABLE execution_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create Tenant Isolation Policies (Workspace Scoped)
CREATE POLICY executive_intents_isolation ON executive_intents
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY executive_policies_isolation ON executive_policies
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY okr_items_isolation ON okr_items
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY proposals_isolation ON proposals
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY council_votes_isolation ON council_votes
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY decision_ledger_isolation ON decision_ledger
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY scheduled_tasks_isolation ON scheduled_tasks
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY department_budgets_isolation ON department_budgets
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY kpi_metrics_isolation ON kpi_metrics
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY approval_requests_isolation ON approval_requests
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY simulation_results_isolation ON simulation_results
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY execution_checkpoints_isolation ON execution_checkpoints
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY idempotency_records_isolation ON idempotency_records
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY dead_letter_queue_isolation ON dead_letter_queue
    USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE POLICY integration_audit_logs_isolation ON integration_audit_logs
    USING (workspace_id = current_setting('app.current_workspace_id', true));
