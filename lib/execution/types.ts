/**
 * PAL Autonomous Execution Engine Types (PAL-TDD-003, PAL-ARCH-DOC-024, PAL-ARCH-DOC-025)
 */

import type { ExecutionContext, WorkerRoleType } from "../runtime/types.ts";
import type { TaskDAG, TaskNode } from "../tasks/types.ts";
import type { WorkerExecutionResponse } from "../workers/types.ts";

export interface ExecutionTraceMetadata {
    executionId: string;
    parentExecutionId?: string;
    workflowId?: string;
    dagId: string;
    taskNodeId: string;
    workerRole: WorkerRoleType;
    attemptNumber: number;
    startedAt: number;
    completedAt?: number;
}

export interface DeadLetterQueueRecord {
    dlqId: string;
    workspaceId: string;
    correlationId: string;
    dagId: string;
    taskNodeId: string;
    workerRole: WorkerRoleType;
    failedAttemptsCount: number;
    errorDetails: string;
    inputParameters: Record<string, any>;
    contextSnapshot: ExecutionContext;
    enqueuedAt: number;
}

export interface ExecutionResult {
    dagId: string;
    status: "completed" | "failed" | "paused_for_approval";
    nodeResponses: Map<string, WorkerExecutionResponse>;
    dlqRecords: DeadLetterQueueRecord[];
    executionTrace: ExecutionTraceMetadata[];
    startedAt: number;
    completedAt?: number;
}

export interface IDeadLetterQueue {
    enqueue(record: DeadLetterQueueRecord): Promise<void>;
    getRecords(workspaceId: string): Promise<DeadLetterQueueRecord[]>;
    clearRecord(dlqId: string): Promise<boolean>;
}

export interface IAutonomousExecutionEngine {
    executeDAG(dag: TaskDAG, context: ExecutionContext): Promise<ExecutionResult>;
    resumeDAG(dagId: string, approverId: string, context: ExecutionContext): Promise<ExecutionResult>;
    getDLQRecords(workspaceId: string): Promise<DeadLetterQueueRecord[]>;
}
