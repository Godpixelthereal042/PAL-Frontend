/**
 * Knowledge Graph Provider Bridge (PAL-TDD-005, PAL-ARCH-DOC-036)
 */

import type { IKnowledgeGraphProvider } from "./feedbackTypes.ts";

export class SimulatedKnowledgeGraphProvider implements IKnowledgeGraphProvider {
    private entities: Map<string, { id: string; type: string; properties: Record<string, any> }> = new Map();
    private relationships: { sourceId: string; targetId: string; relationType: string; properties: Record<string, any> }[] = [];

    async addEntity(entityId: string, type: string, properties: Record<string, any>): Promise<void> {
        this.entities.set(entityId, { id: entityId, type, properties });
    }

    async addRelationship(sourceId: string, targetId: string, relationType: string, properties: Record<string, any> = {}): Promise<void> {
        this.relationships.push({ sourceId, targetId, relationType, properties });
    }

    async queryNeighbors(entityId: string, relationType?: string): Promise<any[]> {
        const matchingEdges = this.relationships.filter(
            (rel) => rel.sourceId === entityId && (!relationType || rel.relationType === relationType)
        );

        return matchingEdges.map((rel) => ({
            targetEntity: this.entities.get(rel.targetId),
            relationType: rel.relationType,
            properties: rel.properties
        }));
    }
}
