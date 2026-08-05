import type { IWorldModel, ObservedState, WorldModelSnapshot } from "./types.ts";

export class WorldModel implements IWorldModel {
    private snapshots: Map<string, WorldModelSnapshot> = new Map();

    async getSnapshot(workspaceId: string): Promise<WorldModelSnapshot> {
        if (!this.snapshots.has(workspaceId)) {
            const initialSnapshot: WorldModelSnapshot = {
                workspaceId,
                timestamp: Date.now(),
                observed: {
                    financialRunwayMonths: 14.5,
                    currentARR: 1200000,
                    cashBalance: 850000,
                    openIncidentsCount: 0,
                    sprintProgressPercentage: 78,
                    activeDealsCount: 12,
                    teamHeadcount: 18,
                    lastObservedTimestamp: Date.now(),
                },
                inferred: {
                    financialHealthScore: 88,
                    operationalVelocityScore: 82,
                    burnRateRisk: "low",
                    customerChurnRisk: "low",
                    inferredInsights: ["Stable runway above 12 months", "Sprint on track for completion"],
                },
                predicted: {
                    projectedARR30Days: 1240000,
                    projectedRunwayMonths: 14.2,
                    forecastedChurnRate: 0.015,
                    confidenceInterval: { min: 1210000, max: 1270000 },
                },
            };
            this.snapshots.set(workspaceId, initialSnapshot);
        }
        return this.snapshots.get(workspaceId)!;
    }

    async updateObservedState(workspaceId: string, updates: Partial<ObservedState>): Promise<WorldModelSnapshot> {
        const current = await this.getSnapshot(workspaceId);
        const updatedObserved: ObservedState = {
            ...current.observed,
            ...updates,
            lastObservedTimestamp: Date.now(),
        };

        // Recalculate Inferred & Predicted State based on new observations
        const burnRisk = updatedObserved.financialRunwayMonths < 6 ? "critical" : updatedObserved.financialRunwayMonths < 9 ? "high" : updatedObserved.financialRunwayMonths < 12 ? "medium" : "low";
        const finHealth = Math.min(100, Math.max(0, Math.round((updatedObserved.financialRunwayMonths / 18) * 100)));

        const newSnapshot: WorldModelSnapshot = {
            workspaceId,
            timestamp: Date.now(),
            observed: updatedObserved,
            inferred: {
                financialHealthScore: finHealth,
                operationalVelocityScore: updatedObserved.sprintProgressPercentage,
                burnRateRisk: burnRisk,
                customerChurnRisk: current.inferred.customerChurnRisk,
                inferredInsights: [
                    `Runway currently at ${updatedObserved.financialRunwayMonths} months`,
                    `Open incidents: ${updatedObserved.openIncidentsCount}`,
                ],
            },
            predicted: {
                projectedARR30Days: Math.round(updatedObserved.currentARR * 1.03),
                projectedRunwayMonths: Math.max(0, updatedObserved.financialRunwayMonths - 0.2),
                forecastedChurnRate: current.predicted.forecastedChurnRate,
                confidenceInterval: {
                    min: Math.round(updatedObserved.currentARR * 1.01),
                    max: Math.round(updatedObserved.currentARR * 1.05),
                },
            },
        };

        this.snapshots.set(workspaceId, newSnapshot);
        return newSnapshot;
    }
}
