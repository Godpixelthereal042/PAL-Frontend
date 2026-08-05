import type { ExecutionPlan, ExecutionTaskNode, IPlanningEngine } from "./types.ts";
import { GoalDecomposer } from "./goalDecomposer.ts";

export class PlanningEngine implements IPlanningEngine {
    private decomposer: GoalDecomposer;

    constructor(decomposer?: GoalDecomposer) {
        this.decomposer = decomposer || new GoalDecomposer();
    }

    async createExecutionPlan(
        workspaceId: string,
        goalDescription: string,
        context?: any
    ): Promise<ExecutionPlan> {
        const { tasks, milestones } = await this.decomposer.decomposeGoal(workspaceId, goalDescription, context);

        const executionOrder = this.topologicalSort(tasks);
        const totalEstimatedCost = tasks.reduce((sum, t) => sum + t.estimatedCost, 0);
        const totalEstimatedTimeHours = tasks.reduce((sum, t) => sum + t.estimatedTimeHours, 0);

        return {
            id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            workspaceId,
            title: `Execution Plan: ${goalDescription}`,
            goalDescription,
            tasks,
            executionOrder,
            milestones,
            totalEstimatedCost,
            totalEstimatedTimeHours,
            createdAt: Date.now(),
        };
    }

    private topologicalSort(tasks: ExecutionTaskNode[]): string[] {
        const inDegree: Map<string, number> = new Map();
        const adjList: Map<string, string[]> = new Map();

        tasks.forEach((t) => {
            inDegree.set(t.id, 0);
            adjList.set(t.id, []);
        });

        tasks.forEach((t) => {
            t.prerequisites.forEach((prereqId) => {
                if (adjList.has(prereqId)) {
                    adjList.get(prereqId)!.push(t.id);
                    inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
                }
            });
        });

        const queue: string[] = [];
        inDegree.forEach((degree, id) => {
            if (degree === 0) {
                queue.push(id);
            }
        });

        const sortedOrder: string[] = [];
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            sortedOrder.push(currentId);

            const neighbors = adjList.get(currentId) || [];
            neighbors.forEach((neighborId) => {
                inDegree.set(neighborId, inDegree.get(neighborId)! - 1);
                if (inDegree.get(neighborId) === 0) {
                    queue.push(neighborId);
                }
            });
        }

        // Fallback if cycle detected or disconnected nodes remain
        if (sortedOrder.length !== tasks.length) {
            return tasks.map((t) => t.id);
        }

        return sortedOrder;
    }
}
