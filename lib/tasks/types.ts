/**
 * PAL Task Graph Engine & Autonomous Planning Types (PAL-TDD-003, PAL-ARCH-DOC-022)
 */

import type { WorkerRoleType } from "../runtime/types.ts";

export type TaskNodeType =
    | "tool_call"
    | "agent_reasoning"
    | "parallel_group"
    | "condition_branch"
    | "fallback_branch"
    | "human_approval";

export interface TaskNodeRetryPolicy {
    maxRetries: number;
    backoffFactorMs: number;
}

export interface TaskNode {
    nodeId: string;
    title: string;
    type: TaskNodeType;
    assignedWorkerRole: WorkerRoleType;
    toolId?: string;
    inputParameters: Record<string, any>;
    prerequisites: string[]; // Node IDs that must complete first
    conditionPredicate?: string; // Evaluated for condition_branch (e.g. "params.employeeCount > 500")
    fallbackNodeId?: string;
    retryPolicy: TaskNodeRetryPolicy;
    timeoutMs: number;
    onFailure: "retry" | "fallback" | "escalate" | "halt";
    status: "pending" | "executing" | "completed" | "failed" | "skipped" | "paused_for_approval";
    output?: Record<string, any>;
    errorDetails?: string;
}

export interface ExecutionLayer {
    layerIndex: number;
    nodeIds: string[]; // Node IDs that can execute in parallel
}

export interface TaskDAG {
    dagId: string;
    workspaceId: string;
    correlationId: string;
    goalDescription: string;
    nodes: Map<string, TaskNode>;
    executionLayers: ExecutionLayer[];
    status: "pending" | "executing" | "paused_for_approval" | "completed" | "failed";
    createdAt: number;
    updatedAt: number;
}

export interface ITaskGraphEngine {
    createTaskDAG(
        workspaceId: string,
        correlationId: string,
        goalDescription: string,
        nodes: TaskNode[]
    ): TaskDAG;
    getTaskDAG(dagId: string): TaskDAG | undefined;
    computeTopologicalLayers(nodes: Map<string, TaskNode>): ExecutionLayer[];
    evaluateConditionNode(node: TaskNode, contextOutputs: Record<string, any>): boolean;
    approveTaskNode(dagId: string, nodeId: string, approverId: string): TaskDAG;
}
