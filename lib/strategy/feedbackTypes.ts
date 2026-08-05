/**
 * Outcome Feedback Flywheel & Decision Ledger Types (PAL-TDD-005, PAL-ARCH-DOC-036)
 */

export interface DecisionLedgerEntry {
    decisionId: string;
    proposalId: string;
    strategyVersion: string;
    policyVersion: string;
    constraintVersion: string;
    memorySnapshotVersion: string;
    simulationId: string;
    councilVotes: any[];
    predictedOutcome: Record<string, number>;
    observedOutcome?: Record<string, number>;
    outcomeDelta?: Record<string, number>; // Prediction error percentages per metric
    entryType?: "prediction" | "observation";
    contentHash?: string;
    recordedAt: number;
}

export interface DeviationAnalysis {
    decisionId: string;
    metricKey: string;
    predictedValue: number;
    actualValue: number;
    absoluteError: number;
    errorPercentage: number;
    status: "accurate" | "underpredicted" | "overpredicted";
}

export interface LearningUpdate {
    decisionId: string;
    analyzedAt: number;
    deviations: DeviationAnalysis[];
    confidenceAdjustment: number; // e.g. +0.05 or -0.10
    policyRecommendation?: string;
}

export interface IKnowledgeGraphProvider {
    addEntity(entityId: string, type: string, properties: Record<string, any>): Promise<void>;
    addRelationship(sourceId: string, targetId: string, relationType: string, properties?: Record<string, any>): Promise<void>;
    queryNeighbors(entityId: string, relationType?: string): Promise<any[]>;
}
