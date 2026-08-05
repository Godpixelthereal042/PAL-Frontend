import type { ILearningEngine, LearnedInsight } from "./types.ts";

export class LearningEngine implements ILearningEngine {
    private insightsMap: Map<string, LearnedInsight[]> = new Map();

    async recordOutcome(
        workspaceId: string,
        actionType: string,
        predictedScore: number,
        actualScore: number,
        evidence: string[]
    ): Promise<LearnedInsight> {
        const delta = Math.abs(predictedScore - actualScore);
        const confidenceScore = Math.max(0.1, 1 - delta / 100);
        const validationStatus = delta <= 15 ? "confirmed" : "refuted";

        const newInsight: LearnedInsight = {
            id: `insight_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            workspaceId,
            actionType,
            predictedScore,
            actualScore,
            delta,
            confidenceScore,
            evidenceReferences: evidence,
            validationStatus,
            lastVerifiedTimestamp: Date.now(),
        };

        const existing = this.insightsMap.get(workspaceId) || [];
        existing.push(newInsight);
        this.insightsMap.set(workspaceId, existing);

        return newInsight;
    }

    async getInsights(workspaceId: string): Promise<LearnedInsight[]> {
        return this.insightsMap.get(workspaceId) || [];
    }
}
