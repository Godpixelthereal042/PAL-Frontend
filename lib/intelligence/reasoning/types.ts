/**
 * PAL Executive Reasoning Subsystem Types & Interfaces (PAL-TDD-002)
 */

import type { ExecutionPlan } from "../planning/types.ts";

export interface ScenarioOption {
    optionId: "option_a_conservative" | "option_b_aggressive" | "option_c_balanced";
    title: string;
    description: string;
    strategyType: "conservative" | "aggressive" | "balanced";
    predictedImpactScore: number; // 0 - 100
    compositeRiskScore: number; // 0 - 100
    alignmentConfidence: number; // 0 - 100
    timeToValueDays: number;
    estimatedCost: number;
    tradeoffs: {
        advantages: string[];
        disadvantages: string[];
        mitigations: string[];
    };
}

export interface ReasoningAnalysis {
    workspaceId: string;
    challengeDescription: string;
    scenarios: ScenarioOption[];
    recommendedOptionId: string;
    riskForecastSummary: string;
    generatedAt: number;
}

export interface IScenarioGenerator {
    generateScenarios(
        workspaceId: string,
        plan: ExecutionPlan,
        context: any
    ): Promise<ScenarioOption[]>;
}

export interface IReasoningEngine {
    analyzeChallenge(
        workspaceId: string,
        plan: ExecutionPlan,
        context?: any
    ): Promise<ReasoningAnalysis>;
}
