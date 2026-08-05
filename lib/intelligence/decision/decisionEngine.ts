import { GovernancePolicyEvaluator } from "../../security/ai/governancePolicy.ts";
import type { AIAgentEntity } from "../../db/repositories/aiAgentRepository.ts";
import type { CouncilConsolidation } from "../council/types.ts";
import type { ScenarioOption } from "../reasoning/types.ts";
import type { DecisionExplainabilityTrace, IDecisionEngine } from "./types.ts";
import { ImpactScorer } from "./impactScorer.ts";

export class DecisionEngine implements IDecisionEngine {
    private impactScorer: ImpactScorer;
    private governanceEvaluator: GovernancePolicyEvaluator;

    constructor(impactScorer?: ImpactScorer, governanceEvaluator?: GovernancePolicyEvaluator) {
        this.impactScorer = impactScorer || new ImpactScorer();
        this.governanceEvaluator = governanceEvaluator || new GovernancePolicyEvaluator();
    }

    async evaluateDecision(
        workspaceId: string,
        correlationId: string,
        challengeDescription: string,
        scenarios: ScenarioOption[],
        councilConsolidation: CouncilConsolidation,
        agentProfile: AIAgentEntity | any
    ): Promise<DecisionExplainabilityTrace> {
        // Score each scenario
        const scoredAlternatives = scenarios.map((scenario) => {
            const scoring = this.impactScorer.scoreScenario(scenario, councilConsolidation);
            return {
                optionId: scenario.optionId,
                title: scenario.title,
                score: scoring.compositeDecisionScore,
                cost: scenario.estimatedCost,
                riskScore: scenario.compositeRiskScore,
            };
        });

        // Rank by composite score descending
        scoredAlternatives.sort((a, b) => b.score - a.score);
        const selected = scoredAlternatives[0];

        const agentEntity = {
            id: agentProfile.agentId || "ai_ops",
            workspace_id: workspaceId,
            name: agentProfile.agentName || "AI Executive",
            role: (agentProfile.assignedRoles && agentProfile.assignedRoles[0]) || "ai_ops",
            authority_level: (agentProfile.authorityLevel as any) || "assisted",
            max_budget_per_action: agentProfile.maxBudgetThreshold || 1000,
            created_at: Date.now(),
            updated_at: Date.now(),
        };

        // Evaluate selected action against Sprint 2 GovernancePolicyEvaluator
        const governanceResult = this.governanceEvaluator.evaluateAction({
            agent: agentEntity as any,
            actionName: "executive_decision_execution",
            estimatedCost: selected.cost,
            isHighRisk: selected.riskScore > 50,
        });

        const decisionId = `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const assumptions = [
            `Current cash runway remains stable above 12 months`,
            `Council consensus reached with ${Math.round(councilConsolidation.confidenceAverage * 100)}% confidence`,
            `Action risk score evaluated at ${selected.riskScore}/100`,
        ];

        return {
            decisionId,
            correlationId,
            workspaceId,
            challengeDescription,
            inputsUsed: {
                worldModelSnapshotTime: Date.now(),
                scenariosEvaluatedCount: scenarios.length,
                participatingCouncilAgents: councilConsolidation.participatingAgents,
            },
            assumptions,
            alternativesConsidered: scoredAlternatives.map((a) => ({ optionId: a.optionId, title: a.title, score: a.score })),
            selectedOption: {
                optionId: selected.optionId,
                title: selected.title,
                score: selected.score,
            },
            governanceEvaluation: governanceResult,
            approvalRequired: governanceResult.requiresHumanApproval,
            requiresHumanReview: governanceResult.requiresHumanApproval || !councilConsolidation.consensusAchieved,
            timestamp: Date.now(),
        };
    }
}
