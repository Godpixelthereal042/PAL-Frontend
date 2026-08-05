/**
 * PAL Executive Brain Subsystem Types & Interfaces (PAL-TDD-002)
 */

export interface ObservedState {
    financialRunwayMonths: number;
    currentARR: number;
    cashBalance: number;
    openIncidentsCount: number;
    sprintProgressPercentage: number;
    activeDealsCount: number;
    teamHeadcount: number;
    lastObservedTimestamp: number;
}

export interface InferredState {
    financialHealthScore: number; // 0-100
    operationalVelocityScore: number; // 0-100
    burnRateRisk: "low" | "medium" | "high" | "critical";
    customerChurnRisk: "low" | "medium" | "high";
    inferredInsights: string[];
}

export interface PredictedState {
    projectedARR30Days: number;
    projectedRunwayMonths: number;
    forecastedChurnRate: number;
    confidenceInterval: { min: number; max: number };
}

export interface WorldModelSnapshot {
    workspaceId: string;
    timestamp: number;
    observed: ObservedState;
    inferred: InferredState;
    predicted: PredictedState;
}

export interface KnowledgeGraphNode {
    id: string;
    type: "user" | "ai_agent" | "department" | "project" | "task" | "customer" | "connector" | "metric";
    label: string;
    attributes: Record<string, any>;
}

export interface KnowledgeGraphEdge {
    sourceId: string;
    targetId: string;
    relation: "OWNS" | "DELEGATED_TO" | "DEPENDS_ON" | "BLOCKS" | "MANAGES" | "MONITORS" | "IMPACTS";
    weight?: number;
}

export interface ExecutiveObjective {
    id: string;
    workspaceId: string;
    title: string;
    type: "north_star" | "okr" | "kpi";
    targetMetric: string;
    currentValue: number;
    targetValue: number;
    status: "on_track" | "at_risk" | "behind";
    ownerId: string;
    updatedAt: number;
}

export interface LearnedInsight {
    id: string;
    workspaceId: string;
    actionType: string;
    predictedScore: number;
    actualScore: number;
    delta: number;
    confidenceScore: number; // 0.0 - 1.0
    evidenceReferences: string[];
    validationStatus: "validating" | "confirmed" | "refuted";
    lastVerifiedTimestamp: number;
}

export interface IWorldModel {
    getSnapshot(workspaceId: string): Promise<WorldModelSnapshot>;
    updateObservedState(workspaceId: string, updates: Partial<ObservedState>): Promise<WorldModelSnapshot>;
}

export interface IKnowledgeGraph {
    addNode(node: KnowledgeGraphNode): void;
    addEdge(edge: KnowledgeGraphEdge): void;
    getRelatedEntities(nodeId: string, relation?: string): KnowledgeGraphNode[];
}

export interface IObjectivesRegistry {
    getObjectives(workspaceId: string): Promise<ExecutiveObjective[]>;
    setObjective(objective: ExecutiveObjective): Promise<void>;
}

export interface ILearningEngine {
    recordOutcome(workspaceId: string, actionType: string, predictedScore: number, actualScore: number, evidence: string[]): Promise<LearnedInsight>;
    getInsights(workspaceId: string): Promise<LearnedInsight[]>;
}

export interface IExecutiveBrain {
    getWorldModel(workspaceId: string): Promise<WorldModelSnapshot>;
    getKnowledgeGraph(): IKnowledgeGraph;
    getObjectives(workspaceId: string): Promise<ExecutiveObjective[]>;
    recordOutcome(workspaceId: string, actionType: string, predictedScore: number, actualScore: number, evidence: string[]): Promise<LearnedInsight>;
}
