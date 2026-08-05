import type { ExecutionLayer, ITaskGraphEngine, TaskDAG, TaskNode } from "./types.ts";

export class TaskGraphEngine implements ITaskGraphEngine {
    private dags: Map<string, TaskDAG> = new Map();

    createTaskDAG(
        workspaceId: string,
        correlationId: string,
        goalDescription: string,
        nodesList: TaskNode[]
    ): TaskDAG {
        const dagId = `dag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const nodesMap = new Map<string, TaskNode>();

        nodesList.forEach((node) => {
            nodesMap.set(node.nodeId, { ...node, status: "pending" });
        });

        const executionLayers = this.computeTopologicalLayers(nodesMap);
        const now = Date.now();

        const dag: TaskDAG = {
            dagId,
            workspaceId,
            correlationId,
            goalDescription,
            nodes: nodesMap,
            executionLayers,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        };

        this.dags.set(dagId, dag);
        return dag;
    }

    getTaskDAG(dagId: string): TaskDAG | undefined {
        return this.dags.get(dagId);
    }

    computeTopologicalLayers(nodes: Map<string, TaskNode>): ExecutionLayer[] {
        const layers: ExecutionLayer[] = [];
        const inDegree = new Map<string, number>();
        const dependents = new Map<string, string[]>();

        // Initialize in-degree counters and dependent adjacencies
        for (const [nodeId, node] of nodes.entries()) {
            const prereqs = node.prerequisites || [];
            inDegree.set(nodeId, prereqs.length);

            prereqs.forEach((prereqId) => {
                const list = dependents.get(prereqId) || [];
                list.push(nodeId);
                dependents.set(prereqId, list);
            });
        }

        let currentLayerNodeIds: string[] = [];
        for (const [nodeId, degree] of inDegree.entries()) {
            if (degree === 0) {
                currentLayerNodeIds.push(nodeId);
            }
        }

        let layerIdx = 0;
        const processed = new Set<string>();

        while (currentLayerNodeIds.length > 0) {
            layers.push({ layerIndex: layerIdx, nodeIds: [...currentLayerNodeIds] });
            const nextLayerNodeIds: string[] = [];

            for (const nodeId of currentLayerNodeIds) {
                processed.add(nodeId);
                const deps = dependents.get(nodeId) || [];

                for (const depId of deps) {
                    const currentDegree = (inDegree.get(depId) || 1) - 1;
                    inDegree.set(depId, currentDegree);

                    if (currentDegree === 0 && !processed.has(depId)) {
                        nextLayerNodeIds.push(depId);
                    }
                }
            }

            currentLayerNodeIds = nextLayerNodeIds;
            layerIdx++;
        }

        return layers;
    }

    evaluateConditionNode(node: TaskNode, contextOutputs: Record<string, any>): boolean {
        if (!node.conditionPredicate) return true;

        try {
            // Simple expression evaluator for predicate string (e.g., "count > 500")
            const fn = new Function("outputs", `with(outputs) { return ${node.conditionPredicate}; }`);
            return Boolean(fn(contextOutputs));
        } catch (err) {
            return false;
        }
    }

    approveTaskNode(dagId: string, nodeId: string, approverId: string): TaskDAG {
        const dag = this.dags.get(dagId);
        if (!dag) throw new Error(`Task DAG '${dagId}' not found`);

        const node = dag.nodes.get(nodeId);
        if (!node) throw new Error(`Task node '${nodeId}' not found in DAG '${dagId}'`);

        if (node.status !== "paused_for_approval") {
            throw new Error(`Task node '${nodeId}' is not paused for approval (status: ${node.status})`);
        }

        node.status = "completed";
        node.output = { approvedBy: approverId, approvedAt: Date.now() };

        // Check if all nodes in DAG are completed
        const allCompleted = Array.from(dag.nodes.values()).every(
            (n) => n.status === "completed" || n.status === "skipped"
        );

        if (allCompleted) {
            dag.status = "completed";
        } else {
            dag.status = "executing";
        }

        dag.updatedAt = Date.now();
        return dag;
    }
}
