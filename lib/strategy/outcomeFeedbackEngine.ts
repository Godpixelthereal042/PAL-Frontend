/**
 * Outcome Feedback Flywheel Engine (PAL-TDD-005, PAL-ARCH-DOC-036)
 */

import { DecisionLedger } from "./decisionLedger.ts";
import type { DeviationAnalysis, LearningUpdate } from "./feedbackTypes.ts";
import { SimulatedKnowledgeGraphProvider } from "./knowledgeGraphBridge.ts";

export class OutcomeFeedbackEngine {
    private ledger: DecisionLedger;
    private graphProvider: SimulatedKnowledgeGraphProvider;

    constructor(ledger?: DecisionLedger, graphProvider?: SimulatedKnowledgeGraphProvider) {
        this.ledger = ledger || new DecisionLedger();
        this.graphProvider = graphProvider || new SimulatedKnowledgeGraphProvider();
    }

    async analyzeOutcome(decisionId: string, actualOutcome: Record<string, number>): Promise<LearningUpdate | undefined> {
        const entry = this.ledger.recordObservedOutcome(decisionId, actualOutcome);
        if (!entry) return undefined;

        const deviations: DeviationAnalysis[] = [];
        let totalErrorPct = 0;
        let metricCount = 0;

        for (const [metricKey, predictedVal] of Object.entries(entry.predictedOutcome)) {
            const actualVal = actualOutcome[metricKey] ?? predictedVal;
            const diff = actualVal - predictedVal;
            const errorPercentage = predictedVal !== 0 ? Number(((diff / predictedVal) * 100).toFixed(2)) : 0;

            const status = errorPercentage > 5 ? "overpredicted" : errorPercentage < -5 ? "underpredicted" : "accurate";

            deviations.push({
                decisionId,
                metricKey,
                predictedValue: predictedVal,
                actualValue: actualVal,
                absoluteError: Math.abs(diff),
                errorPercentage,
                status
            });

            totalErrorPct += Math.abs(errorPercentage);
            metricCount++;
        }

        const avgError = metricCount > 0 ? totalErrorPct / metricCount : 0;
        const confidenceAdjustment = avgError > 15 ? -0.10 : avgError < 5 ? 0.05 : 0;

        let policyRecommendation: string | undefined;
        if (avgError > 15) {
            policyRecommendation = `Recommend adjusting forecasting policy: Average prediction error ${avgError.toFixed(1)}% exceeds 15% threshold for Strategy ${entry.strategyVersion}.`;
        }

        // Add learning event node to Knowledge Graph
        await this.graphProvider.addEntity(`decision_${decisionId}`, "ExecutiveDecision", {
            strategyVersion: entry.strategyVersion,
            avgError
        });

        return {
            decisionId,
            analyzedAt: Date.now(),
            deviations,
            confidenceAdjustment,
            policyRecommendation
        };
    }

    getLedger(): DecisionLedger {
        return this.ledger;
    }

    getGraphProvider(): SimulatedKnowledgeGraphProvider {
        return this.graphProvider;
    }
}
