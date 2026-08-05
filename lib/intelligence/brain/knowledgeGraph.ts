import type { IKnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from "./types.ts";

export class KnowledgeGraph implements IKnowledgeGraph {
    private nodes: Map<string, KnowledgeGraphNode> = new Map();
    private edges: KnowledgeGraphEdge[] = [];

    addNode(node: KnowledgeGraphNode): void {
        this.nodes.set(node.id, node);
    }

    addEdge(edge: KnowledgeGraphEdge): void {
        this.edges.push(edge);
    }

    getRelatedEntities(nodeId: string, relation?: string): KnowledgeGraphNode[] {
        const relatedIds = this.edges
            .filter((e) => (e.sourceId === nodeId || e.targetId === nodeId) && (!relation || e.relation === relation))
            .map((e) => (e.sourceId === nodeId ? e.targetId : e.sourceId));

        return relatedIds.map((id) => this.nodes.get(id)).filter((n): n is KnowledgeGraphNode => n !== undefined);
    }
}
