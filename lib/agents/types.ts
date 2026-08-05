/**
 * Autonomous Executive Agents Framework - TypeScript Contracts
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import type { ExecutiveIntelligence, ExecutiveSnapshot } from "../intelligence/types.ts";

export type AgentRole =
    | "coo"
    | "chief_of_staff"
    | "operations"
    | "sales_growth"
    | "finance"
    | "project";

export interface AgentContext {
    userId: string;
    snapshot: ExecutiveSnapshot;
    intelligence: ExecutiveIntelligence;
}

export interface AgentFinding {
    id: string;
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    detail: string;
    recommendation: string;
    confidence: number;
    actionUrl?: string;
}

export interface AgentResponse {
    agentRole: AgentRole;
    agentName: string;
    focus: string;
    findings: AgentFinding[];
    confidence: number;
}

export interface OrchestrationResult {
    timestamp: number;
    primaryRecommendation: string;
    whyItMatters: string;
    synthesizedSummary: string;
    unifiedConfidence: number;
    participatingAgents: AgentRole[];
    agentResponses: AgentResponse[];
}
