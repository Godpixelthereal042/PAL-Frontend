import type { CouncilConsolidation } from "../council/types.ts";
import type { ScenarioOption } from "../reasoning/types.ts";
import type { DecisionScoringResult, IImpactScorer } from "./types.ts";

export class ImpactScorer implements IImpactScorer {
    private w_i: number = 0.4; // Strategic Impact Weight
    private w_r: number = 0.3; // Risk Weight
    private w_c: number = 0.2; // Alignment Confidence Weight
    private w_t: number = 0.1; // Time Penalty Weight

    scoreScenario(scenario: ScenarioOption, councilConsolidation?: CouncilConsolidation): DecisionScoringResult {
        const I = scenario.predictedImpactScore;
        const R = scenario.compositeRiskScore;

        // Boost confidence if Council achieved consensus on this option
        let C = scenario.alignmentConfidence;
        if (councilConsolidation && councilConsolidation.consensusOptionId === scenario.optionId) {
            C = Math.min(100, Math.round(C * 1.1));
        }

        // Time penalty normalized to 0-100 scale (max penalty at 30 days)
        const T = Math.min(100, Math.round((scenario.timeToValueDays / 30) * 100));

        // Composite Decision Score calculation
        const rawScore = this.w_i * I - this.w_r * R + this.w_c * C - this.w_t * T;
        // Normalize rawScore (-30 to +60 range) into 0-100 scale
        const compositeDecisionScore = Math.min(100, Math.max(0, Math.round(rawScore + 30)));

        return {
            optionId: scenario.optionId,
            strategicImpactScore: I,
            compositeRiskScore: R,
            alignmentConfidence: C,
            timeToValuePenalty: T,
            compositeDecisionScore,
        };
    }
}
