/**
 * PAL Executive Decision Engine Types & Interfaces (PAL-TDD-002)
 */

import type { GovernancePolicyResult } from "../../security/ai/governancePolicy.ts";
import type { AIAgentEntity } from "../../db/repositories/aiAgentRepository.ts";
import type { CouncilConsolidation } from "../council/types.ts";
import type { ScenarioOption } from "../reasoning/types.ts";

export interface DecisionScoringResult {
    optionId: string;
    strategicImpactScore: number; // 0 - 100
    compositeRiskScore: number; // 0 - 100
    alignmentConfidence: number; // 0 - 100
    timeToValuePenalty: number; // 0 - 100
    compositeDecisionScore: number; // 0 - 100
}

export interface DecisionExplainabilityTrace {
    decisionId: string;
    correlationId: string;
    workspaceId: string;
    challengeDescription: string;
    inputsUsed: {
        worldModelSnapshotTime: number;
        scenariosEvaluatedCount: number;
        participatingCouncilAgents: string[];
    };
    assumptions: string[];
    alternativesConsidered: Array<{
        optionId: string;
        title: string;
        score: number;
    }>;
    selectedOption: {
        optionId: string;
        title: string;
        score: number;
    };
    governanceEvaluation: GovernancePolicyResult;
    approvalRequired: boolean;
    requiresHumanReview: boolean;
    timestamp: number;
}

export interface IImpactScorer {
    scoreScenario(scenario: ScenarioOption, councilConsolidation?: CouncilConsolidation): DecisionScoringResult;
}

export interface IDecisionEngine {
    evaluateDecision(
        workspaceId: string,
        correlationId: string,
        challengeDescription: string,
        scenarios: ScenarioOption[],
        councilConsolidation: CouncilConsolidation,
        agentProfile: AIAgentEntity | any
    ): Promise<DecisionExplainabilityTrace>;
}
