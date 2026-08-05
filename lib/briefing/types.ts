/**
 * Daily Briefing Engine Types & Interfaces
 *
 * PAL Milestone 5A — Daily Briefing Engine
 */

export type HealthStatus = "excellent" | "good" | "fair" | "poor";
export type HealthTrend = "improving" | "stable" | "declining";
export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskCategory = "operational" | "financial" | "strategic" | "technical" | "schedule";

export interface HealthFactor {
    name: string;
    impact: "positive" | "negative" | "neutral";
    description: string;
    scoreDelta?: number;
}

export interface BusinessHealth {
    score: number; // 0 - 100
    status: HealthStatus;
    trend: HealthTrend;
    factors: HealthFactor[];
    summary: string;
}

export interface Priority {
    id: string;
    title: string;
    score: number; // Deterministic score for ranking
    reason: string;
    deadline?: string | null;
    relatedProject?: string | null;
    urgency: "critical" | "high" | "medium" | "low";
}

export interface Risk {
    id: string;
    title: string;
    severity: RiskSeverity;
    category: RiskCategory;
    impact: string;
    mitigation?: string;
    relatedItem?: string;
}

export interface Opportunity {
    id: string;
    title: string;
    type: string;
    description: string;
    potentialValue?: string;
}

export interface Insight {
    id: string;
    category: string;
    title: string;
    metric?: string;
    description: string;
    supportingEvidence?: string;
}

export interface Recommendation {
    title: string;
    reason: string;
    expectedImpact: string;
    confidence: number; // 0 - 100
    supportingEvidence: string[];
}

export interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    location?: string;
    status: string;
}

export interface FinancialSummary {
    overdueInvoicesAmount: number;
    pendingInvoicesAmount: number;
    summary: string;
}

export interface PendingDecisionBrief {
    id: string;
    title: string;
    rationale?: string | null;
    createdAt: number;
}

export interface DailyBriefing {
    id: string;
    userId: string;
    founderName: string;
    generatedAt: number;
    businessHealth: BusinessHealth;
    priorities: Priority[];
    schedule: ScheduleItem[];
    risks: Risk[];
    opportunities: Opportunity[];
    pendingDecisions: PendingDecisionBrief[];
    financialHighlights: FinancialSummary;
    insights: Insight[];
    recommendation: Recommendation;
    markdownSummary: string;
}
