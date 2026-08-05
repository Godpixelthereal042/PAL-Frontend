/**
 * Executive Confidence Model
 *
 * PAL Milestone 7B — Explainability, Learning & Simulation Engine
 */

export interface ConfidenceEvaluation {
    confidenceScore: number; // 0.0 - 1.0
    evidenceStrength: "strong" | "moderate" | "weak";
    supportingFactorsCount: number;
    missingInformation: string[];
    assumptions: string[];
    validationSteps: string[];
}

export class ExecutiveConfidenceModel {
    public evaluateConfidence(
        evidenceCount: number,
        hasMissingGaps: boolean = false,
        baseScore = 0.85
    ): ConfidenceEvaluation {
        let confidenceScore = baseScore;
        let evidenceStrength: "strong" | "moderate" | "weak" = "moderate";

        if (evidenceCount >= 3) {
            evidenceStrength = "strong";
            confidenceScore = Math.min(0.98, confidenceScore + 0.08);
        } else if (evidenceCount === 1) {
            evidenceStrength = "weak";
            confidenceScore = Math.max(0.60, confidenceScore - 0.15);
        }

        const missingInformation: string[] = [];
        if (hasMissingGaps || evidenceCount < 2) {
            missingInformation.push("Updated founder availability & deep work window preferences");
            missingInformation.push("Recent customer contract renewal velocity data");
        }

        const assumptions = [
            "Current team headcount & developer availability remains constant",
            "Past-due invoice collections are executed within 7 days",
            "No emergency unannounced scope shifts occur",
        ];

        const validationSteps = [
            "Review supporting project milestone timeline in Projects view",
            "Verify stakeholder contact recency in Relationship Center",
            "Confirm pending strategic decision in Decision Log",
        ];

        return {
            confidenceScore: Math.round(confidenceScore * 100) / 100,
            evidenceStrength,
            supportingFactorsCount: evidenceCount,
            missingInformation,
            assumptions,
            validationSteps,
        };
    }
}

export const confidenceModel = new ExecutiveConfidenceModel();
