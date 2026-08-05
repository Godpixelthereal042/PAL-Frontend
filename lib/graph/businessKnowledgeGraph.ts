/**
 * PAL Business Knowledge Graph Engine (PAL-TDD-006, Sprint 13)
 *
 * Graph data structure representing interconnected business relationships between
 * customers, revenue metrics, campaigns, recommendations, decisions, and outcomes.
 */

export type NodeCategory = "customer" | "product" | "metric" | "campaign" | "recommendation" | "decision" | "outcome";

export interface GraphNode {
    id: string;
    category: NodeCategory;
    label: string;
    properties: Record<string, any>;
}

export interface GraphEdge {
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationType: "PURCHASED" | "IMPACTS_REVENUE" | "TARGETED_BY" | "GENERATED_RECOMMENDATION" | "RESULTED_IN_OUTCOME";
    weight: number;
}

export class BusinessKnowledgeGraph {
    private static instance: BusinessKnowledgeGraph;
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];

    constructor() {
        this.initializeDemoGraph("ws_demo_company");
    }

    public static getInstance(): BusinessKnowledgeGraph {
        if (!BusinessKnowledgeGraph.instance) {
            BusinessKnowledgeGraph.instance = new BusinessKnowledgeGraph();
        }
        return BusinessKnowledgeGraph.instance;
    }

    private initializeDemoGraph(workspaceId: string): void {
        const n1: GraphNode = { id: "n_cust_acme", category: "customer", label: "Acme Enterprise", properties: { mrrUSD: 5000 } };
        const n2: GraphNode = { id: "n_prod_pro", category: "product", label: "PAL Pro Tier", properties: { priceUSD: 199 } };
        const n3: GraphNode = { id: "n_met_mrr", category: "metric", label: "Monthly Recurring Revenue", properties: { currentUSD: 24500 } };
        const n4: GraphNode = { id: "n_rec_churn", category: "recommendation", label: "Trial Churn Re-engagement", properties: { confidence: 0.95 } };
        const n5: GraphNode = { id: "n_out_rev", category: "outcome", label: "+$14,500 MRR Growth", properties: { netGainUSD: 14500 } };

        this.addNode(n1);
        this.addNode(n2);
        this.addNode(n3);
        this.addNode(n4);
        this.addNode(n5);

        this.addEdge({ edgeId: "e_1", sourceNodeId: "n_cust_acme", targetNodeId: "n_prod_pro", relationType: "PURCHASED", weight: 1.0 });
        this.addEdge({ edgeId: "e_2", sourceNodeId: "n_prod_pro", targetNodeId: "n_met_mrr", relationType: "IMPACTS_REVENUE", weight: 1.0 });
        this.addEdge({ edgeId: "e_3", sourceNodeId: "n_met_mrr", targetNodeId: "n_rec_churn", relationType: "GENERATED_RECOMMENDATION", weight: 0.9 });
        this.addEdge({ edgeId: "e_4", sourceNodeId: "n_rec_churn", targetNodeId: "n_out_rev", relationType: "RESULTED_IN_OUTCOME", weight: 0.95 });
    }

    public addNode(node: GraphNode): void {
        this.nodes.set(node.id, node);
    }

    public addEdge(edge: GraphEdge): void {
        this.edges.push(edge);
    }

    public getNode(id: string): GraphNode | undefined {
        return this.nodes.get(id);
    }

    public getGraphTopology(): { nodesCount: number; edgesCount: number; nodes: GraphNode[]; edges: GraphEdge[] } {
        return {
            nodesCount: this.nodes.size,
            edgesCount: this.edges.length,
            nodes: Array.from(this.nodes.values()),
            edges: this.edges
        };
    }
}
