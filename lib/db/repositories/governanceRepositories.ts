/**
 * Executive Governance Repositories (PAL-TDD-005A, PAL-ARCH-DOC-039)
 */

import { BaseRepository } from "../baseRepository.ts";

// 1. Executive Intent Entity & Repository
export interface ExecutiveIntentEntity {
    id: string;
    workspace_id: string;
    title: string;
    priority: string;
    success_metrics: string; // JSON
    deadline?: number;
    owner: string;
    confidence: number;
    strategy_version: string;
    status: string;
    created_at: number;
}

export class ExecutiveIntentRepository extends BaseRepository<ExecutiveIntentEntity> {
    constructor() {
        super("executive_intents");
    }

    async findActiveByStrategy(strategyVersion: string, workspaceId: string = "default_workspace"): Promise<ExecutiveIntentEntity[]> {
        return this.findAll("strategy_version = ? AND status = 'active' AND workspace_id = ?", [strategyVersion, workspaceId]);
    }
}

// 2. Executive Policy Entity & Repository
export interface ExecutivePolicyEntity {
    id: string;
    workspace_id: string;
    name: string;
    version: string;
    severity: string;
    owner: string;
    tags: string; // JSON
    applies_to: string; // JSON
    conditions: string; // JSON
    actions: string; // JSON
    justification?: string;
    source?: string;
    enabled: number | boolean;
    expires_at?: number;
    created_at: number;
}

export class ExecutivePolicyRepository extends BaseRepository<ExecutivePolicyEntity> {
    constructor() {
        super("executive_policies");
    }

    async findEnabledPolicies(workspaceId: string = "default_workspace"): Promise<ExecutivePolicyEntity[]> {
        return this.findAll("enabled = 1 AND workspace_id = ?", [workspaceId]);
    }
}

// 3. OKR Item Entity & Repository
export interface OKRItemEntity {
    id: string;
    workspace_id: string;
    objective: string;
    key_results: string; // JSON
    initiatives: string; // JSON
    origin_intent_id?: string;
    origin_policy_ids: string; // JSON
    origin_constraint_ids: string; // JSON
    strategy_version: string;
    alignment_score: number;
    created_at: number;
}

export class OKRItemRepository extends BaseRepository<OKRItemEntity> {
    constructor() {
        super("okr_items");
    }

    async findByStrategyVersion(strategyVersion: string, workspaceId: string = "default_workspace"): Promise<OKRItemEntity[]> {
        return this.findAll("strategy_version = ? AND workspace_id = ?", [strategyVersion, workspaceId]);
    }
}

// 4. Proposal Entity & Repository
export interface ProposalEntity {
    id: string;
    workspace_id: string;
    title: string;
    objective?: string;
    expected_benefit_usd: number;
    estimated_cost_usd: number;
    estimated_risk: number;
    reversibility_score: number;
    supporting_evidence: string; // JSON
    affected_departments: string; // JSON
    strategy_alignment: number;
    confidence: number;
    status: string;
    created_at: number;
}

export class ProposalRepository extends BaseRepository<ProposalEntity> {
    constructor() {
        super("proposals");
    }
}

// 5. Council Vote Entity & Repository (Append-Only)
export interface CouncilVoteEntity {
    id: string;
    workspace_id: string;
    proposal_id: string;
    member_id: string;
    member_name: string;
    department: string;
    vote: string;
    confidence: number;
    vote_weight: number;
    rationale?: string;
    round_index: number;
    created_at: number;
}

export class CouncilVoteRepository extends BaseRepository<CouncilVoteEntity> {
    constructor() {
        super("council_votes");
    }

    async findByProposal(proposalId: string): Promise<CouncilVoteEntity[]> {
        return this.findAll("proposal_id = ?", [proposalId]);
    }
}

// 6. Decision Ledger Entity & Repository (Append-Only)
export interface DecisionLedgerRecord {
    id: string;
    workspace_id: string;
    decision_id: string;
    entry_type: "prediction" | "observation";
    proposal_id?: string;
    strategy_version: string;
    policy_version: string;
    constraint_version: string;
    memory_snapshot_version?: string;
    simulation_id?: string;
    council_votes: string; // JSON
    predicted_outcome: string; // JSON
    observed_outcome?: string; // JSON
    outcome_delta?: string; // JSON
    content_hash: string;
    recorded_at: number;
}

export class DecisionLedgerRepository extends BaseRepository<DecisionLedgerRecord> {
    constructor() {
        super("decision_ledger");
    }

    async findByDecisionId(decisionId: string): Promise<DecisionLedgerRecord[]> {
        return this.findAll("decision_id = ?", [decisionId]);
    }
}

// 7. Scheduled Task Entity & Repository
export interface ScheduledTaskEntity {
    id: string;
    workspace_id: string;
    task_name: string;
    department: string;
    priority_class: string;
    expected_benefit_usd: number;
    token_cost_usd: number;
    compute_cost_usd: number;
    risk_score: number;
    confidence: number;
    reversibility_score: number;
    economic_priority_rating?: number;
    prerequisites: string; // JSON
    status: string;
    created_at: number;
    dequeued_at?: number;
}

export class ScheduledTaskRepository extends BaseRepository<ScheduledTaskEntity> {
    constructor() {
        super("scheduled_tasks");
    }

    async findQueuedTasks(workspaceId: string = "default_workspace"): Promise<ScheduledTaskEntity[]> {
        return this.findAll("status = 'queued' AND workspace_id = ?", [workspaceId]);
    }
}

// 8. Department Budget Entity & Repository
export interface DepartmentBudgetEntity {
    id: string;
    workspace_id: string;
    department: string;
    capital_usd: number;
    ai_tokens_quota: number;
    human_hours_quota: number;
    compute_nodes_quota: number;
    api_rate_limit_quota: number;
    used_capital_usd: number;
    used_ai_tokens: number;
    used_human_hours: number;
    used_compute_nodes: number;
    used_api_requests: number;
    period_start: number;
    period_end?: number;
}

export class DepartmentBudgetRepository extends BaseRepository<DepartmentBudgetEntity> {
    constructor() {
        super("department_budgets");
    }

    async findByDepartment(department: string, workspaceId: string = "default_workspace"): Promise<DepartmentBudgetEntity | null> {
        const rows = await this.findAll("department = ? AND workspace_id = ?", [department, workspaceId]);
        return rows[0] || null;
    }
}

// 9. KPI Metric Entity & Repository
export interface KPIMetricEntity {
    id: string;
    workspace_id: string;
    metric_key: string;
    metric_name: string;
    value: number;
    unit: string;
    target_value?: number;
    source?: string;
    updated_at: number;
}

export class KPIRegistryRepository extends BaseRepository<KPIMetricEntity> {
    constructor() {
        super("kpi_metrics");
    }

    async findByKey(metricKey: string, workspaceId: string = "default_workspace"): Promise<KPIMetricEntity | null> {
        const rows = await this.findAll("metric_key = ? AND workspace_id = ?", [metricKey, workspaceId]);
        return rows[0] || null;
    }
}

// 10. Approval Request Entity & Repository
export interface ApprovalRequestEntity {
    id: string;
    workspace_id: string;
    proposal_id?: string;
    action_name: string;
    department: string;
    required_role: string;
    escalation_role?: string;
    status: string;
    justification?: string;
    requested_at: number;
    decided_at?: number;
    decided_by?: string;
    timeout_at?: number;
}

export class ApprovalRequestRepository extends BaseRepository<ApprovalRequestEntity> {
    constructor() {
        super("approval_requests");
    }

    async findPendingRequests(workspaceId: string = "default_workspace"): Promise<ApprovalRequestEntity[]> {
        return this.findAll("(status = 'pending' OR status = 'escalated') AND workspace_id = ?", [workspaceId]);
    }
}

// 11. Simulation Result Entity & Repository
export interface SimulationResultEntity {
    id: string;
    workspace_id: string;
    proposal_id?: string;
    strategy_version: string;
    mode: string;
    risk_breakdown: string; // JSON
    assumptions: string; // JSON
    forecasts: string; // JSON
    recommendation: string;
    confidence_score: number;
    simulated_at: number;
}

export class SimulationResultRepository extends BaseRepository<SimulationResultEntity> {
    constructor() {
        super("simulation_results");
    }
}
