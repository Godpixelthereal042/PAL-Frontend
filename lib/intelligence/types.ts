/**
 * Executive Intelligence Engine - TypeScript Contracts
 *
 * PAL Milestone 7A — Executive Intelligence Engine
 */

import type { BusinessContext } from "../contextEngine.ts";

export type Severity = "low" | "medium" | "high" | "critical";
export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type TimeframeWindow = "7d" | "30d" | "90d";
export type TrendDirection = "improving" | "declining" | "stable";

export interface RiskInsight {
    id: string;
    title: string;
    description: string;
    severity: Severity;
    confidence: number; // 0.0 - 1.0
    evidence: string[];
    recommendedAction: string;
    impact: string;
    category: "operational" | "financial" | "relationship" | "schedule" | "decision";
}

export interface OpportunityInsight {
    id: string;
    title: string;
    reason: string;
    potentialValue: string;
    confidence: number; // 0.0 - 1.0
    suggestedNextAction: string;
    category: "investor" | "client" | "automation" | "capacity" | "growth";
}

export interface TrendInsight {
    id: string;
    metric: string;
    timeframe: TimeframeWindow;
    direction: TrendDirection;
    percentChange: number;
    description: string;
    evidence: string[];
}

export interface ForecastInsight {
    id: string;
    prediction: string;
    confidence: number; // 0.0 - 1.0
    supportingData: string[];
    timeHorizon: string;
    assumptions: string[];
}

export interface ExecutiveRecommendation {
    id: string;
    recommendation: string;
    whyItMatters: string;
    expectedOutcome: string;
    recommendedAction: string;
    priority: PriorityLevel;
    confidence: number;
    actionUrl?: string;
    category: string;
}

export interface ExecutiveSnapshot {
    timestamp: number;
    businessContext: BusinessContext;
    activeProjectsCount: number;
    overdueTasksCount: number;
    pendingDecisionsCount: number;
    atRiskRelationshipsCount: number;
    overdueInvoicesTotal: number;
    activeWorkflowsCount: number;
}

export interface ExecutiveIntelligence {
    timestamp: number;
    snapshot: ExecutiveSnapshot;
    topRisk: RiskInsight | null;
    topOpportunity: OpportunityInsight | null;
    keyTrend: TrendInsight | null;
    topForecast: ForecastInsight | null;
    risks: RiskInsight[];
    opportunities: OpportunityInsight[];
    trends: TrendInsight[];
    forecasts: ForecastInsight[];
    recommendations: ExecutiveRecommendation[];
    prioritizedInsights: Array<{
        id: string;
        type: "risk" | "opportunity" | "trend" | "forecast";
        score: number;
        title: string;
        summary: string;
    }>;
}
