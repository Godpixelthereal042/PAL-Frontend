/**
 * PAL Command OS — Enterprise Operating Console Type Definitions (PAL-TDD-007, Sprint 20)
 *
 * Central executive interface type system defining the CompanyHealthReport model,
 * composite health scoring dimensions, risk/opportunity classification, and
 * AI workforce status tracking.
 *
 * Architecture: PAL-ARCH-DOC-037
 */

// ─── Health Scoring ───────────────────────────────────────────────

export type HealthGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export type HealthDimensionKey = "revenue" | "operations" | "risk" | "team" | "runway";

export interface HealthDimension {
    key: HealthDimensionKey;
    label: string;
    score: number;          // 0-100
    weight: number;         // 0.0-1.0, all weights sum to 1.0
    trend: "improving" | "stable" | "declining";
    summary: string;
}

/**
 * Grade thresholds:
 *   A+ ≥ 95, A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, F < 40
 */
export const GRADE_THRESHOLDS: { min: number; grade: HealthGrade }[] = [
    { min: 95, grade: "A+" },
    { min: 85, grade: "A" },
    { min: 70, grade: "B" },
    { min: 55, grade: "C" },
    { min: 40, grade: "D" },
    { min: 0,  grade: "F" },
];

// ─── Risks & Opportunities ───────────────────────────────────────

export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface RiskAlert {
    riskId: string;
    title: string;
    description: string;
    severity: RiskSeverity;
    affectedDimension: HealthDimensionKey;
    detectedAt: number;
    recommendedAction: string;
}

export interface Opportunity {
    opportunityId: string;
    title: string;
    description: string;
    estimatedImpactPct: number;
    estimatedRevenueUSD: number;
    confidenceScore: number;   // 0.0-1.0
    identifiedAt: number;
    suggestedAction: string;
}

// ─── Pending Decisions ───────────────────────────────────────────

export interface PendingDecision {
    decisionId: string;
    title: string;
    proposedBy: string;        // agent role
    urgency: "critical" | "high" | "medium" | "low";
    impactScore: number;       // 0-100
    urgencyImpactRank: number; // urgency × impact composite
    requiresApprovalFrom: string;
    createdAt: number;
}

// ─── AI Workforce Status ─────────────────────────────────────────

export type AgentOperationalStatus = "active" | "idle" | "executing" | "awaiting_approval";

export interface AgentStatus {
    agentRole: string;
    agentName: string;
    status: AgentOperationalStatus;
    currentActivity: string;
    proposalsGenerated: number;
    actionsExecuted: number;
    lastActiveAt: number;
}

// ─── Company Health Report ───────────────────────────────────────

export interface CompanyHealthReport {
    reportId: string;
    workspaceId: string;
    healthScore: number;                // 0-100 composite
    healthGrade: HealthGrade;
    dimensions: HealthDimension[];
    activeRisks: RiskAlert[];
    growthOpportunities: Opportunity[];
    pendingDecisions: PendingDecision[];
    aiWorkforceStatus: AgentStatus[];
    generatedAt: number;
}
