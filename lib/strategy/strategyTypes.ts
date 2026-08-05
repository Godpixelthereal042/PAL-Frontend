/**
 * Strategy, Policy & OKR Governance Types (PAL-TDD-005, PAL-ARCH-DOC-033)
 */

export interface LineageMetadata {
    parentId?: string;
    originIntentId: string;
    originPolicyIds: string[];
    originConstraintIds: string[];
    strategyVersion: string;
    alignmentScore: number;
}

export interface ExecutiveIntent {
    id: string;
    title: string;
    priority: "critical" | "high" | "medium" | "low";
    successMetrics: string[];
    deadline?: number;
    owner: string;
    confidence: number;
    strategyVersion: string;
    status: "active" | "achieved" | "deprecated";
    createdAt: number;
}

export interface ExecutivePolicy {
    id: string;
    name: string;
    version: string;
    severity: "mandatory" | "advisory";
    owner: string;
    createdAt: number;
    expiresAt?: number;
    tags: string[];
    appliesTo: string[]; // e.g. ["email", "finance", "engineering"]
    conditions: string[];
    actions: string[]; // e.g. ["require_approval", "block_execution"]
    justification: string;
    source: string;
    enabled: boolean;
}

export interface KPIMetric {
    key: string;
    name: string;
    value: number;
    unit: string;
    targetValue?: number;
    updatedAt: number;
}

export interface AlignmentScoreResult {
    score: number; // 0 - 100
    breakdown: {
        intentMatch: number;
        policyCompliance: number;
        constraintCompliance: number;
        kpiContribution: number;
        riskPenalty: number;
    };
    rationale: string;
}

export interface OKRItem {
    id: string;
    objective: string;
    keyResults: string[];
    initiatives: string[];
    lineage: LineageMetadata;
}

export interface StrategyCompilerOutput {
    goal: string;
    strategyVersion: string;
    intent: ExecutiveIntent;
    policiesApplied: ExecutivePolicy[];
    okrs: OKRItem[];
    alignmentScore: number;
}

export interface IStrategyProvider {
    compileIntent(goal: string, strategyVersion: string): Promise<StrategyCompilerOutput>;
    generateOKRs(intent: ExecutiveIntent): Promise<OKRItem[]>;
    evaluateAlignment(task: Record<string, any>): Promise<AlignmentScoreResult>;
}
