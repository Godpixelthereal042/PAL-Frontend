import type { ExecutionPlan } from "../planning/types.ts";
import type { IReasoningEngine, ReasoningAnalysis } from "./types.ts";
import { ScenarioGenerator } from "./scenarioGenerator.ts";

export class ReasoningEngine implements IReasoningEngine {
    private scenarioGenerator: ScenarioGenerator;

    constructor(scenarioGenerator?: ScenarioGenerator) {
        this.scenarioGenerator = scenarioGenerator || new ScenarioGenerator();
    }

    async analyzeChallenge(
        workspaceId: string,
        plan: ExecutionPlan,
        context?: any
    ): Promise<ReasoningAnalysis> {
        const scenarios = await this.scenarioGenerator.generateScenarios(workspaceId, plan, context);

        // Select recommended option based on best balanced score
        const recommendedOption = scenarios.find((s) => s.strategyType === "balanced") || scenarios[0];

        const riskForecastSummary = `Evaluated 3 scenario paths. ${recommendedOption.title} is recommended with predicted impact ${recommendedOption.predictedImpactScore}/100 and risk score ${recommendedOption.compositeRiskScore}/100.`;

        return {
            workspaceId,
            challengeDescription: plan.goalDescription,
            scenarios,
            recommendedOptionId: recommendedOption.optionId,
            riskForecastSummary,
            generatedAt: Date.now(),
        };
    }
}
