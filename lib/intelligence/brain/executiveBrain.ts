import type { IExecutiveBrain, IKnowledgeGraph, ExecutiveObjective, LearnedInsight, WorldModelSnapshot } from "./types.ts";
import { WorldModel } from "./worldModel.ts";
import { KnowledgeGraph } from "./knowledgeGraph.ts";
import { ObjectivesRegistry } from "./objectivesRegistry.ts";
import { LearningEngine } from "./learningEngine.ts";

export class ExecutiveBrain implements IExecutiveBrain {
    private worldModel: WorldModel;
    private knowledgeGraph: KnowledgeGraph;
    private objectivesRegistry: ObjectivesRegistry;
    private learningEngine: LearningEngine;

    constructor() {
        this.worldModel = new WorldModel();
        this.knowledgeGraph = new KnowledgeGraph();
        this.objectivesRegistry = new ObjectivesRegistry();
        this.learningEngine = new LearningEngine();
    }

    async getWorldModel(workspaceId: string): Promise<WorldModelSnapshot> {
        return this.worldModel.getSnapshot(workspaceId);
    }

    getKnowledgeGraph(): IKnowledgeGraph {
        return this.knowledgeGraph;
    }

    async getObjectives(workspaceId: string): Promise<ExecutiveObjective[]> {
        return this.objectivesRegistry.getObjectives(workspaceId);
    }

    async recordOutcome(
        workspaceId: string,
        actionType: string,
        predictedScore: number,
        actualScore: number,
        evidence: string[]
    ): Promise<LearnedInsight> {
        return this.learningEngine.recordOutcome(workspaceId, actionType, predictedScore, actualScore, evidence);
    }
}
