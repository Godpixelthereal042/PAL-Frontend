/**
 * Economic Scheduler & Resource Allocation Types (PAL-TDD-005, PAL-ARCH-DOC-032)
 */

export type DepartmentType = "engineering" | "finance" | "marketing" | "sales" | "hr" | "general";
export type PriorityClass = "critical_path" | "high_roi" | "routine" | "background_maintenance";

export interface DepartmentBudget {
    department: DepartmentType;
    capitalUSD: number;
    aiTokensQuota: number;
    humanHoursQuota: number;
    computeNodesQuota: number;
    apiRateLimitQuota: number;
}

export interface ResourcePoolStatus {
    department: DepartmentType;
    usedCapitalUSD: number;
    usedAiTokens: number;
    usedHumanHours: number;
    usedComputeNodes: number;
    usedApiRequests: number;
}

export interface ScheduledTaskItem {
    taskId: string;
    taskName: string;
    department: DepartmentType;
    priorityClass: PriorityClass;
    expectedBenefitUSD: number;
    tokenCostUSD: number;
    computeCostUSD: number;
    riskScore: number; // 0 - 100
    confidence: number; // 0.0 - 1.0
    reversibilityScore: number; // 0.0 (Irreversible) - 1.0 (Fully Reversible)
    economicPriorityRating?: number;
    prerequisites?: string[];
    createdAt: number;
}
