/**
 * PAL Executive Council & Orchestrator Types (PAL-TDD-002)
 */

export interface ExecutiveCapabilityProfile {
    id: string; // e.g. "ai_coo", "ai_cfo"
    title: string;
    domain: "operations" | "finance" | "sales" | "marketing" | "technology" | "legal" | "hr";
    capabilities: string[];
    knowledgeDomains: string[];
    authorityLimitUSD: number;
    availableTools: string[];
    requiredContextLayers: string[];
    outputTypes: string[];
}

export interface InterAgentMessage {
    id: string;
    correlationId: string;
    senderId: string;
    recipientIds: string[]; // "*" for broadcast
    intent: "consultation_request" | "domain_opinion" | "challenge_scenario" | "consensus_vote" | "escalation";
    contextRef?: string;
    confidenceScore: number; // 0.0 - 1.0
    priority: "low" | "medium" | "high" | "critical";
    requestedAction?: string;
    evidence: string[];
    content: string;
    timestamp: number;
}

export interface ExecutiveRecommendation {
    agentId: string;
    agentTitle: string;
    recommendedOptionId: string;
    confidenceScore: number; // 0.0 - 1.0
    domainRationale: string;
    identifiedRisks: string[];
    suggestedMitigations: string[];
}

export interface CouncilConsolidation {
    correlationId: string;
    participatingAgents: string[];
    consensusAchieved: boolean;
    consensusOptionId: string;
    confidenceAverage: number;
    conflictResolutionApplied?: string;
    individualRecommendations: ExecutiveRecommendation[];
    consolidatedSummary: string;
    timestamp: number;
}

export interface IExecutiveAgent {
    getProfile(): ExecutiveCapabilityProfile;
    evaluateChallenge(
        correlationId: string,
        scenarios: any[],
        context: any
    ): Promise<ExecutiveRecommendation>;
}

export interface IExecutiveOrchestrator {
    orchestrateCouncil(
        correlationId: string,
        challengeDomain: string,
        scenarios: any[],
        context: any
    ): Promise<CouncilConsolidation>;
}
