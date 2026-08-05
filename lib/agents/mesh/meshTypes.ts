/**
 * Autonomous Executive Agent Mesh Types (PAL-TDD-007, Sprint 20 Milestone 2)
 *
 * Defines the hybrid communication model combining structured telemetry payloads
 * with rich natural language reasoning context (assumptions, confidence, evidence),
 * enabling continuous inter-agent collaboration and CEO synthesis.
 *
 * Architecture: PAL-ARCH-DOC-038
 */

import { ExecutiveAgentRole } from "../executiveAgentCouncil.ts";

export type MeshMessageType = "alert" | "recommendation" | "status_update" | "request" | "cross_critique";
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface SupportingEvidence {
    source: string;
    metric: string;
    value: string | number;
    timestamp: number;
}

export interface AgentReasoningContext {
    summary: string;
    assumptions: string[];
    confidenceScore: number;    // 0.0 - 1.0
    supportingEvidence: SupportingEvidence[];
}

export interface MeshMessage {
    messageId: string;
    fromAgent: ExecutiveAgentRole;
    toAgent: ExecutiveAgentRole | "all";
    messageType: MeshMessageType;
    subject: string;
    urgency: UrgencyLevel;
    dataPayload: Record<string, any>;
    reasoningContext: AgentReasoningContext;
    timestamp: number;
}

export interface AgentInsight {
    insightId: string;
    agentRole: ExecutiveAgentRole;
    domain: string;
    headline: string;
    observations: string[];
    riskFactor?: string;
    opportunityFactor?: string;
    createdAt: number;
}

export interface CollaborativeRecommendation {
    recommendationId: string;
    participatingAgents: ExecutiveAgentRole[];
    title: string;
    synthesizedStrategy: string;
    combinedConfidenceScore: number; // 0.0 - 1.0
    estimatedFinancialImpactUSD: number;
    requiresHumanApproval: boolean;
    reasoningTrace: Array<{
        agentRole: ExecutiveAgentRole;
        contribution: string;
    }>;
    createdAt: number;
}

export interface MeshCycleReport {
    cycleId: string;
    workspaceId: string;
    activeAgentsCount: number;
    messagesExchangedCount: number;
    insightsDiscovered: AgentInsight[];
    collaborativeRecommendations: CollaborativeRecommendation[];
    ceoDirectiveSummary: string;
    timestamp: number;
}
